const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

// Get all jobs (Public - for students)
router.get('/', async (req, res) => {
  try {
    const jobs = await pool.query(`
      SELECT j.job_id, j.title, j.job_type, j.description, j.required_skills, 
             j.salary, j.location, j.status, j.created_at,
             c.company_name, c.email as company_email
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.status = 'active'
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

// Get jobs for a specific company
router.get('/company', auth, requireRole(['company']), async (req, res) => {
  try {
    const companyId = req.user.id;
    
    const jobs = await pool.query(`
      SELECT j.*, 
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) as application_count
      FROM jobs j
      WHERE j.company_id = $1
      ORDER BY j.created_at DESC
    `, [companyId]);

    res.json({
      success: true,
      jobs: jobs.rows
    });

  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company jobs'
    });
  }
});

// Get recommended jobs for student
router.get('/recommended', auth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get student skills
    const studentResult = await pool.query(
      'SELECT skills FROM students WHERE student_id = $1',
      [studentId]
    );
    
    const studentSkills = studentResult.rows[0]?.skills || [];
    
    // Get jobs that match student skills
    const jobs = await pool.query(`
      SELECT j.job_id, j.title, j.job_type, j.description, j.required_skills, 
             j.salary, j.location, j.created_at,
             c.company_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
      LIMIT 10
    `);

    // Simple skill matching (you can enhance this with the algorithm we discussed)
    const recommendedJobs = jobs.rows.map(job => {
      const jobSkills = job.required_skills || [];
      const matchingSkills = studentSkills.filter(skill => 
        jobSkills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      
      return {
        ...job,
        skillMatch: matchingSkills.length,
        matchPercentage: jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 0
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      recommendedJobs
    });

  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended jobs'
    });
  }
});

// Get single job details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await pool.query(`
      SELECT j.*, c.company_name, c.email as company_email, c.website, c.hr_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.job_id = $1
    `, [id]);

    if (job.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job: job.rows[0]
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
});

// Create new job (Company only)
router.post('/', auth, requireRole(['company']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const companyId = req.user.id;
    const {
      title,
      job_type,
      description,
      required_skills,
      salary,
      location,
      vacancy = 1
    } = req.body;

    // Validate required fields
    if (!title || !job_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, job type, and description are required'
      });
    }

    // Insert job
    const result = await client.query(
      `INSERT INTO jobs 
       (company_id, title, job_type, description, required_skills, salary, location, vacancy) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        companyId,
        title,
        job_type,
        description,
        required_skills || [],
        salary || 'Negotiable',
        location || 'Remote',
        vacancy
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully. Waiting for admin approval.',
      job: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job'
    });
  } finally {
    client.release();
  }
});

// Update job (Company only)
router.put('/:id', auth, requireRole(['company']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    const {
      title,
      job_type,
      description,
      required_skills,
      salary,
      location,
      vacancy
    } = req.body;

    // Check if job belongs to company
    const jobCheck = await pool.query(
      'SELECT job_id FROM jobs WHERE job_id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Update job
    const result = await pool.query(
      `UPDATE jobs 
       SET title = $1, job_type = $2, description = $3, required_skills = $4, 
           salary = $5, location = $6, vacancy = $7, status = 'pending'
       WHERE job_id = $8 
       RETURNING *`,
      [title, job_type, description, required_skills, salary, location, vacancy, id]
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: result.rows[0]
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job'
    });
  }
});

// Delete job (Company only)
router.delete('/:id', auth, requireRole(['company']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    // Check if job belongs to company
    const jobCheck = await pool.query(
      'SELECT job_id FROM jobs WHERE job_id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    await pool.query('DELETE FROM jobs WHERE job_id = $1', [id]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job'
    });
  }
});

module.exports = router;