const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');
const { hashPassword } = require('../utils/authUtils');

// Get student profile
router.get('/student', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const student = await pool.query(`
      SELECT student_id, name, email, phone, department, batch, cgpa, skills, resume_url, status, created_at
      FROM students 
      WHERE student_id = $1
    `, [studentId]);

    if (student.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: student.rows[0]
    });

  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student profile'
    });
  }
});

// Update student profile
router.put('/student', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      name,
      phone,
      department,
      batch,
      cgpa,
      skills
    } = req.body;

    const result = await pool.query(
      `UPDATE students 
       SET name = $1, phone = $2, department = $3, batch = $4, cgpa = $5, skills = $6
       WHERE student_id = $7 
       RETURNING student_id, name, email, phone, department, batch, cgpa, skills, resume_url`,
      [name, phone, department, batch, cgpa, skills, studentId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student: result.rows[0]
    });

  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Update student password
router.put('/student/password', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get current password
    const student = await pool.query(
      'SELECT password FROM students WHERE student_id = $1',
      [studentId]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify current password
    const { comparePassword } = require('../utils/authUtils');
    const isPasswordValid = await comparePassword(currentPassword, student.rows[0].password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE students SET password = $1 WHERE student_id = $2',
      [hashedPassword, studentId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update student password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

// Get company profile
router.get('/company', auth, requireRole(['company']), async (req, res) => {
  try {
    const companyId = req.user.id;
    
    const company = await pool.query(`
      SELECT company_id, company_name, email, website, description, industry, hr_name, hr_phone, approved_by_admin, created_at
      FROM companies 
      WHERE company_id = $1
    `, [companyId]);

    if (company.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      company: company.rows[0]
    });

  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company profile'
    });
  }
});

// Update company profile
router.put('/company', auth, requireRole(['company']), async (req, res) => {
  try {
    const companyId = req.user.id;
    const {
      company_name,
      website,
      description,
      industry,
      hr_name,
      hr_phone
    } = req.body;

    const result = await pool.query(
      `UPDATE companies 
       SET company_name = $1, website = $2, description = $3, industry = $4, hr_name = $5, hr_phone = $6
       WHERE company_id = $7 
       RETURNING company_id, company_name, email, website, description, industry, hr_name, hr_phone, approved_by_admin`,
      [company_name, website, description, industry, hr_name, hr_phone, companyId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      company: result.rows[0]
    });

  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Update company password
router.put('/company/password', auth, requireRole(['company']), async (req, res) => {
  try {
    const companyId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get current password
    const company = await pool.query(
      'SELECT password FROM companies WHERE company_id = $1',
      [companyId]
    );

    if (company.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Verify current password
    const { comparePassword } = require('../utils/authUtils');
    const isPasswordValid = await comparePassword(currentPassword, company.rows[0].password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE companies SET password = $1 WHERE company_id = $2',
      [hashedPassword, companyId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update company password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

// Upload resume (Student only)
router.post('/student/resume', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume URL is required'
      });
    }

    await pool.query(
      'UPDATE students SET resume_url = $1 WHERE student_id = $2',
      [resumeUrl, studentId]
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl
    });

  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume'
    });
  }
});

module.exports = router;