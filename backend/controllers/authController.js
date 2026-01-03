const { pool } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');

// Student Registration
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone, department, batch, cgpa, skills } = req.body;

    // Check if student already exists
    const existingStudent = await pool.query(
      'SELECT student_id FROM students WHERE email = $1',
      [email]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert student
    const result = await pool.query(
      `INSERT INTO students 
       (name, email, password, phone, department, batch, cgpa, skills, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') 
       RETURNING student_id, name, email, department, batch, status, created_at`,
      [name, email, hashedPassword, phone, department, batch, cgpa, skills || []]
    );

    const student = result.rows[0];

    // Generate token
    const token = generateToken(student.student_id, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully. Waiting for admin approval.',
      token,
      user: {
        id: student.student_id,
        name: student.name,
        email: student.email,
        department: student.department,
        batch: student.batch,
        role: 'student',
        status: student.status
      }
    });

  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Company Registration
const registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, website, description, industry, hrName, hrPhone } = req.body;

    // Check if company already exists
    const existingCompany = await pool.query(
      'SELECT company_id FROM companies WHERE email = $1',
      [email]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Company with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert company
    const result = await pool.query(
      `INSERT INTO companies 
       (company_name, email, password, website, description, industry, hr_name, hr_phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING company_id, company_name, email, approved_by_admin, created_at`,
      [companyName, email, hashedPassword, website, description, industry, hrName, hrPhone]
    );

    const company = result.rows[0];

    // Generate token
    const token = generateToken(company.company_id, 'company');

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Waiting for admin approval.',
      token,
      user: {
        id: company.company_id,
        name: company.company_name,
        email: company.email,
        role: 'company',
        approved: company.approved_by_admin
      }
    });

  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let query;
    let userType;

    switch (role) {
      case 'student':
        query = 'SELECT student_id as id, name, email, password, department, batch, status FROM students WHERE email = $1';
        userType = 'student';
        break;
      
      case 'company':
        query = 'SELECT company_id as id, company_name as name, email, password, approved_by_admin as approved FROM companies WHERE email = $1';
        userType = 'company';
        break;
      
  case 'admin':
  query = 'SELECT admin_id as id, name, email, password FROM admins WHERE email = $1';
  userType = 'admin';
  break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
    }

    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if student is blocked
    if (userType === 'student' && user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact administrator.'
      });
    }

    // Check if student is pending approval
    if (userType === 'student' && user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin verification.'
      });
    }

    // Check if company is approved
    if (userType === 'company' && !user.approved) {
      return res.status(403).json({
        success: false,
        message: 'Your company account is pending approval. Please wait for admin verification.'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id, userType);

    // Prepare user data for response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userType
    };

    // Add role-specific fields
    if (userType === 'student') {
      userResponse.department = user.department;
      userResponse.batch = user.batch;
      userResponse.status = user.status;
    } else if (userType === 'company') {
      userResponse.approved = user.approved;
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerStudent,
  registerCompany,
  login,
  getCurrentUser
};

