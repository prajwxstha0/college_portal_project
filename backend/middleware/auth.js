const { verifyToken } = require('../utils/authUtils');
const { pool } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    const decoded = verifyToken(token);
    
    // Get user based on role
    let user;
    let query;
    let params;

    switch (decoded.role) {
      case 'student':
        query = `
          SELECT student_id as id, name, email, department, batch, status, created_at 
          FROM students 
          WHERE student_id = $1 AND status != 'blocked'
        `;
        params = [decoded.userId];
        break;
      
      case 'company':
        query = `
          SELECT company_id as id, company_name as name, email, approved_by_admin as approved, created_at 
          FROM companies 
          WHERE company_id = $1
        `;
        params = [decoded.userId];
        break;
      
      case 'admin':
        query = `
          SELECT admin_id as id, name, email, created_at 
          FROM admins 
          WHERE admin_id = $1
        `;
        params = [decoded.userId];
        break;
      
      default:
        return res.status(401).json({ 
          success: false,
          message: 'Invalid user role' 
        });
    }

    const result = await pool.query(query, params);
    user = result.rows[0];

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    req.user = { ...user, role: decoded.role };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, requireRole };