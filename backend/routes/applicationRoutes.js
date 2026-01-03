const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

// Apply for a job (Student only)
router.post('/apply', auth, requireRole(['student']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const studentId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if job exists and is active
    const jobCheck = await client.query(
      'SELECT job_id FROM jobs WHERE job_id = $1 AND status = $2',
      [jobId, 'active']
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not active'
      });
    }

    // Check if already applied
    const existingApplication = await client.query(
      'SELECT application_id FROM applications WHERE student_id = $1 AND job_id = $2',
      [studentId, jobId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const result = await client.query(
      `INSERT INTO applications (student_id, job_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [studentId, jobId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Apply job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job'
    });
  } finally {
    client.release();
  }
});

// Get student's applications (Student only)
router.get('/my-applications', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const applications = await pool.query(`
      SELECT a.application_id, a.status, a.applied_date,
             j.title as job_title, j.job_type, j.location, j.salary,
             c.company_name, c.email as company_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN companies c ON j.company_id = c.company_id
      WHERE a.student_id = $1
      ORDER BY a.applied_date DESC
    `, [studentId]);

    res.json({
      success: true,
      applications: applications.rows
    });

  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Get applications for company's jobs (Company only)
router.get('/company', auth, requireRole(['company']), async (req, res) => {
  try {
    const companyId = req.user.id;
    
    const applications = await pool.query(`
      SELECT a.application_id, a.status, a.applied_date,
             s.name as student_name, s.email as student_email, s.department, s.batch, s.skills,
             j.title as job_title, j.job_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN students s ON a.student_id = s.student_id
      WHERE j.company_id = $1
      ORDER BY a.applied_date DESC
    `, [companyId]);

    res.json({
      success: true,
      applications: applications.rows
    });

  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Update application status (Company only)
router.put('/:id', auth, requireRole(['company']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'rejected', 'selected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if application belongs to company's job
    const applicationCheck = await pool.query(`
      SELECT a.application_id 
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      WHERE a.application_id = $1 AND j.company_id = $2
    `, [id, companyId]);

    if (applicationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    // Update application status
    await pool.query(
      'UPDATE applications SET status = $1 WHERE application_id = $2',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application'
    });
  }
});

// Withdraw application (Student only)
router.delete('/:id', auth, requireRole(['student']), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Check if application belongs to student
    const applicationCheck = await pool.query(
      'SELECT application_id FROM applications WHERE application_id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (applicationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    await pool.query('DELETE FROM applications WHERE application_id = $1', [id]);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application'
    });
  }
});

module.exports = router;