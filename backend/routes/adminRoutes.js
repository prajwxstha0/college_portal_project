const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

// Get comprehensive admin statistics
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM companies) as total_companies,
        (SELECT COUNT(*) FROM jobs) as total_jobs,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM students WHERE status = 'pending') as pending_students,
        (SELECT COUNT(*) FROM companies WHERE approved_by_admin = false) as pending_companies,
        (SELECT COUNT(*) FROM jobs WHERE status = 'pending') as pending_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
        (SELECT COUNT(*) FROM students WHERE status = 'blocked') as blocked_students,
        (SELECT COUNT(*) FROM companies WHERE blocked = true) as blocked_companies
    `);

    const data = stats.rows[0];
    
    res.json({
      success: true,
      stats: {
        totalStudents: parseInt(data.total_students),
        totalCompanies: parseInt(data.total_companies),
        totalJobs: parseInt(data.total_jobs),
        totalApplications: parseInt(data.total_applications),
        pendingStudents: parseInt(data.pending_students),
        pendingCompanies: parseInt(data.pending_companies),
        pendingJobs: parseInt(data.pending_jobs),
        activeJobs: parseInt(data.active_jobs),
        blockedStudents: parseInt(data.blocked_students),
        blockedCompanies: parseInt(data.blocked_companies)
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Get all students
router.get('/students', auth, requireRole(['admin']), async (req, res) => {
  try {
    const students = await pool.query(`
      SELECT student_id, name, email, department, batch, status, created_at 
      FROM students 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      students: students.rows
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// Get all companies
router.get('/companies', auth, requireRole(['admin']), async (req, res) => {
  try {
    const companies = await pool.query(`
      SELECT company_id, company_name, email, website, hr_name, hr_phone, 
             approved_by_admin, blocked, created_at 
      FROM companies 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      companies: companies.rows
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies'
    });
  }
});

// Get all jobs with company info
router.get('/jobs', auth, requireRole(['admin']), async (req, res) => {
  try {
    const jobs = await pool.query(`
      SELECT j.job_id, j.title, j.job_type, j.description, j.salary, j.location, 
             j.status, j.created_at, c.company_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      ORDER BY j.created_at DESC
    `);

    res.json({
      success: true,
      jobs: jobs.rows
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// Get all applications with student and job info
router.get('/applications', auth, requireRole(['admin']), async (req, res) => {
  try {
    const applications = await pool.query(`
      SELECT a.application_id, a.status, a.applied_date,
             s.name as student_name, s.email as student_email, s.department, s.batch,
             j.title as job_title, c.company_name
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN jobs j ON a.job_id = j.job_id
      JOIN companies c ON j.company_id = c.company_id
      ORDER BY a.applied_date DESC
    `);

    res.json({
      success: true,
      applications: applications.rows
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Get analytics data
router.get('/analytics', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Mock analytics data - in real implementation, you'd calculate these
    const analytics = {
      placementRate: '72%',
      avgPackage: '₹8.5 LPA',
      highestPackage: '₹15.2 LPA',
      activeStudents: 142,
      activeCompanies: 28,
      applicationsToday: 15,
      totalPlacements: 89,
      interviewScheduled: 23
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Get reports
router.get('/reports', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Mock reports data
    const reports = [
      { id: 1, name: 'Monthly Placement Report - January 2024', date: '2024-01-15', type: 'placement' },
      { id: 2, name: 'Company-wise Analysis Report', date: '2024-01-10', type: 'analytics' },
      { id: 3, name: 'Department Performance Report', date: '2024-01-05', type: 'performance' }
    ];

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
});

// Generate placement report
router.get('/reports/placement', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Mock placement report generation
    const report = {
      title: 'Placement Report - January 2024',
      generatedAt: new Date().toISOString(),
      summary: {
        totalStudents: 150,
        placedStudents: 89,
        placementRate: '59.3%',
        averagePackage: '₹8.5 LPA',
        highestPackage: '₹15.2 LPA'
      },
      departmentWise: [
        { department: 'CSE', placed: 35, total: 45, rate: '77.8%' },
        { department: 'IT', placed: 28, total: 40, rate: '70.0%' },
        { department: 'ECE', placed: 18, total: 35, rate: '51.4%' },
        { department: 'ME', placed: 8, total: 30, rate: '26.7%' }
      ]
    };

    res.json({
      success: true,
      message: 'Placement report generated successfully',
      report
    });

  } catch (error) {
    console.error('Placement report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating placement report'
    });
  }
});

// Generate analytics report
router.get('/reports/analytics', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Mock analytics report
    const report = {
      title: 'System Analytics Report',
      generatedAt: new Date().toISOString(),
      userActivity: {
        dailyLogins: 45,
        newRegistrations: 8,
        activeUsers: 67
      },
      jobStatistics: {
        totalPosted: 34,
        activeJobs: 28,
        avgApplicationsPerJob: 12.5
      },
      placementTrends: {
        monthlyGrowth: '15%',
        topHiringCompanies: ['Tech Corp', 'Innovate Ltd', 'Data Systems'],
        popularJobRoles: ['Software Developer', 'Data Analyst', 'Frontend Engineer']
      }
    };

    res.json({
      success: true,
      message: 'Analytics report generated successfully',
      report
    });

  } catch (error) {
    console.error('Analytics report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating analytics report'
    });
  }
});

// Student Management
router.put('/students/:id/approve', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE students SET status = $1 WHERE student_id = $2', ['approved', id]);
    res.json({ success: true, message: 'Student approved successfully' });
  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({ success: false, message: 'Error approving student' });
  }
});

router.put('/students/:id/block', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE students SET status = $1 WHERE student_id = $2', ['blocked', id]);
    res.json({ success: true, message: 'Student blocked successfully' });
  } catch (error) {
    console.error('Block student error:', error);
    res.status(500).json({ success: false, message: 'Error blocking student' });
  }
});

router.delete('/students/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE student_id = $1', [id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Error deleting student' });
  }
});

// Company Management
router.put('/companies/:id/approve', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE companies SET approved_by_admin = $1, blocked = $2 WHERE company_id = $3', [true, false, id]);
    res.json({ success: true, message: 'Company approved successfully' });
  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({ success: false, message: 'Error approving company' });
  }
});

router.put('/companies/:id/block', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE companies SET blocked = $1 WHERE company_id = $2', [true, id]);
    res.json({ success: true, message: 'Company blocked successfully' });
  } catch (error) {
    console.error('Block company error:', error);
    res.status(500).json({ success: false, message: 'Error blocking company' });
  }
});

router.delete('/companies/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE company_id = $1', [id]);
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ success: false, message: 'Error deleting company' });
  }
});

// Job Management
router.put('/jobs/:id/approve', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE jobs SET status = $1 WHERE job_id = $2', ['active', id]);
    res.json({ success: true, message: 'Job approved successfully' });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({ success: false, message: 'Error approving job' });
  }
});

router.put('/jobs/:id/reject', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE jobs SET status = $1 WHERE job_id = $2', ['rejected', id]);
    res.json({ success: true, message: 'Job rejected successfully' });
  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting job' });
  }
});

router.delete('/jobs/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE job_id = $1', [id]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Error deleting job' });
  }
});

// Application Management
router.put('/applications/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE applications SET status = $1 WHERE application_id = $2', [status, id]);
    res.json({ success: true, message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ success: false, message: 'Error updating application' });
  }
});

module.exports = router;