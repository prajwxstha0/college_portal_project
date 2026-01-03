const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerCompany,
  login,
  getCurrentUser
} = require('../controllers/authController');

const {
  validateStudentRegistration,
  validateCompanyRegistration,
  validateLogin
} = require('../middleware/validation');

const { auth } = require('../middleware/auth');

// Public routes
router.post('/register/student', validateStudentRegistration, registerStudent);
router.post('/register/company', validateCompanyRegistration, registerCompany);
router.post('/login', validateLogin, login);

// Protected route - Get current user
router.get('/me', auth, getCurrentUser);

module.exports = router;

// routes/authRoutes.js
router.get("/login", (req, res) => {
  res.send("Auth route working ✅");
});
