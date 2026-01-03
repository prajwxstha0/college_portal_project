 -- College Placement Portal Database Schema
-- Created for PostgreSQL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS AND AUTHENTICATION ====================

-- Students Table
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(50) NOT NULL,
    batch INTEGER NOT NULL,
    cgpa DECIMAL(3,2) CHECK (cgpa >= 0 AND cgpa <= 10),
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    hr_name VARCHAR(100),
    hr_phone VARCHAR(15),
    approved_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== JOBS AND INTERNSHIPS ====================

-- Jobs Table
CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(company_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('Full-time', 'Internship', 'Part-time')),
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    qualifications TEXT,
    responsibilities TEXT,
    salary VARCHAR(100),
    location VARCHAR(100) DEFAULT 'Remote',
    vacancy INTEGER DEFAULT 1,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== APPLICATIONS ====================

-- Applications Table
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(job_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'selected')),
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(student_id, job_id) -- Prevent duplicate applications
);

-- ==================== PLACEMENT DRIVES ====================

-- Placement Drives Table
CREATE TABLE placement_drives (
    drive_id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(company_id) ON DELETE CASCADE,
    drive_name VARCHAR(200) NOT NULL,
    drive_date TIMESTAMP WITH TIME ZONE,
    venue VARCHAR(255),
    description TEXT,
    eligible_departments TEXT[] DEFAULT '{}',
    eligible_batches INTEGER[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== NOTIFICATIONS ====================

-- Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Can be student_id or company_id
    user_type VARCHAR(10) CHECK (user_type IN ('student', 'company')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Students indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_batch ON students(batch);
CREATE INDEX idx_students_status ON students(status);

-- Companies indexes
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_approved ON companies(approved_by_admin);

-- Jobs indexes
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);

-- Applications indexes
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(applied_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ==================== SAMPLE DATA ====================

-- Insert default admin (password: admin123)
INSERT INTO admins (name, email, password) VALUES 
('College Admin', 'admin@college.edu', '$2a$10$hashedPasswordForAdmin123');

-- Insert sample departments and batches for reference
-- You can use these in your frontend dropdowns
-- Departments: CSE, IT, ECE, EEE, Mechanical, Civil, MBA, etc.
-- Batches: 2024, 2025, 2026, 2027

-- ==================== UPDATE TRIGGERS ====================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== DATABASE COMMENTS ====================

COMMENT ON TABLE students IS 'Stores student profiles and academic information';
COMMENT ON TABLE companies IS 'Stores company registration details';
COMMENT ON TABLE jobs IS 'Stores job and internship postings';
COMMENT ON TABLE applications IS 'Tracks student applications to jobs';
COMMENT ON TABLE placement_drives IS 'Manages campus placement drive schedules';
COMMENT ON TABLE notifications IS 'Stores user notifications and alerts';

COMMENT ON COLUMN students.status IS 'pending: waiting approval, approved: can apply, blocked: suspended';
COMMENT ON COLUMN companies.approved_by_admin IS 'TRUE when admin verifies company';
COMMENT ON COLUMN jobs.status IS 'pending: waiting approval, active: accepting applications, closed: no more applications';
COMMENT ON COLUMN applications.status IS 'pending: under review, shortlisted: selected for next round, rejected: not selected, selected: job offered';
