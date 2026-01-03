import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

  const [jobForm, setJobForm] = useState({
    title: '',
    job_type: 'Full-time',
    description: '',
    required_skills: '',
    salary: '',
    location: 'Remote',
    vacancy: 1
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'jobs') {
      fetchCompanyJobs();
    } else if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchOverviewData = async () => {
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        axios.get('/jobs/company'),
        axios.get('/applications/company')
      ]);
      
      const companyJobs = jobsRes.data.jobs || [];
      const companyApplications = applicationsRes.data.applications || [];
      
      setJobs(companyJobs);
      setApplications(companyApplications);
      
      // Calculate stats
      setStats({
        totalJobs: companyJobs.length,
        activeJobs: companyJobs.filter(job => job.status === 'active').length,
        totalApplications: companyApplications.length,
        pendingApplications: companyApplications.filter(app => app.status === 'pending').length
      });
    } catch (error) {
      toast.error('Failed to load overview data');
    }
  };

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/jobs/company');
      setJobs(response.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/applications/company');
      setApplications(response.data.applications || []);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile/company');
      setProfile(response.data.company || {});
    } catch (error) {
      console.log('Error fetching profile');
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const jobData = {
        ...jobForm,
        required_skills: jobForm.required_skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      await axios.post('/jobs', jobData);
      toast.success('Job posted successfully! Waiting for admin approval.');
      setShowJobForm(false);
      resetJobForm();
      fetchCompanyJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const jobData = {
        ...jobForm,
        required_skills: jobForm.required_skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      await axios.put(`/jobs/${editingJob.job_id}`, jobData);
      toast.success('Job updated successfully!');
      setShowJobForm(false);
      setEditingJob(null);
      resetJobForm();
      fetchCompanyJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await axios.delete(`/jobs/${jobId}`);
        toast.success('Job deleted successfully!');
        fetchCompanyJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.put(`/applications/${applicationId}`, { status });
      toast.success('Application status updated!');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      job_type: 'Full-time',
      description: '',
      required_skills: '',
      salary: '',
      location: 'Remote',
      vacancy: 1
    });
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      job_type: job.job_type,
      description: job.description,
      required_skills: job.required_skills?.join(', ') || '',
      salary: job.salary || '',
      location: job.location,
      vacancy: job.vacancy || 1
    });
    setShowJobForm(true);
  };

  const closeJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
    resetJobForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🏢 Company Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={() => setShowJobForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Post New Job
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'jobs', 'applications', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Job Posting Form Modal */}
      {showJobForm && (
        <JobFormModal
          jobForm={jobForm}
          setJobForm={setJobForm}
          onSubmit={editingJob ? updateJob : createJob}
          onClose={closeJobForm}
          loading={loading}
          isEditing={!!editingJob}
        />
      )}

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats}
              jobs={jobs}
              applications={applications}
              onViewJobs={() => setActiveTab('jobs')}
              onViewApplications={() => setActiveTab('applications')}
            />
          )}

          {/* Jobs Management Tab */}
          {activeTab === 'jobs' && (
            <JobsTab
              jobs={jobs}
              loading={loading}
              onEditJob={openEditJob}
              onDeleteJob={deleteJob}
              onRefresh={fetchCompanyJobs}
            />
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <ApplicationsTab
              applications={applications}
              loading={loading}
              onUpdateStatus={updateApplicationStatus}
              onRefresh={fetchApplications}
            />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <CompanyProfileTab 
              profile={profile}
              user={user}
            />
          )}

        </div>
      </div>
    </div>
  );
};

// Job Form Modal Component
const JobFormModal = ({ jobForm, setJobForm, onSubmit, onClose, loading, isEditing }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? 'Edit Job' : 'Post New Job'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title *</label>
            <input
              type="text"
              value={jobForm.title}
              onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Frontend Developer"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Type *</label>
              <select
                value={jobForm.job_type}
                onChange={(e) => setJobForm({...jobForm, job_type: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Vacancy</label>
              <input
                type="number"
                value={jobForm.vacancy}
                onChange={(e) => setJobForm({...jobForm, vacancy: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description *</label>
            <textarea
              value={jobForm.description}
              onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={jobForm.required_skills}
              onChange={(e) => setJobForm({...jobForm, required_skills: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., JavaScript, React, Node.js, Python"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary</label>
              <input
                type="text"
                value={jobForm.salary}
                onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ₹8-12 LPA, $50,000-70,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={jobForm.location}
                onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Remote, Bangalore, Hybrid"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Job' : 'Post Job')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, jobs, applications, onViewJobs, onViewApplications }) => {
  const recentJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Applications</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Jobs</h3>
              <button
                onClick={onViewJobs}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map(job => (
                  <div key={job.job_id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{job.title}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{job.job_type}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No jobs posted yet</p>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Applications</h3>
              <button
                onClick={onViewApplications}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map(application => (
                  <div key={application.application_id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{application.student_name}</p>
                      <p className="text-sm text-gray-500">{application.job_title}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      application.status === 'selected' ? 'bg-green-100 text-green-800' :
                      application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No applications yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Jobs Management Tab Component
const JobsTab = ({ jobs, loading, onEditJob, onDeleteJob, onRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Job Management</h2>
            <p className="text-gray-600">Manage your job postings</p>
          </div>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      ) : (
        <div className="p-6">
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.job_id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📍 {job.location}</span>
                        <span>•</span>
                        <span>⏱️ {job.job_type}</span>
                        <span>•</span>
                        <span>💰 {job.salary || 'Not specified'}</span>
                        <span>•</span>
                        <span>👥 {job.vacancy} vacancy</span>
                      </div>
                      <p className="mt-3 text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                      
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Required Skills:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.required_skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {job.application_count || 0} applications
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditJob(job)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.job_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No jobs posted yet.</p>
              <p className="text-gray-400 mt-2">Start by posting your first job!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Applications Tab Component
const ApplicationsTab = ({ applications, loading, onUpdateStatus, onRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Applications Management</h2>
            <p className="text-gray-600">Review and manage job applications</p>
          </div>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      ) : (
        <div className="p-6">
          {applications.length > 0 ? (
            <div className="space-y-6">
              {applications.map(application => (
                <div key={application.application_id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {application.student_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{application.student_name}</h4>
                          <p className="text-gray-600">{application.student_email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {application.department} - Batch {application.batch}
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied for: <span className="font-medium">{application.job_title}</span>
                          </p>
                          
                          {application.skills && application.skills.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700">Skills:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {application.skills.map((skill, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      <select
                        value={application.status}
                        onChange={(e) => onUpdateStatus(application.application_id, e.target.value)}
                        className={`border rounded p-2 text-sm font-medium ${
                          application.status === 'selected' ? 'bg-green-100 text-green-800 border-green-200' :
                          application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="selected">Selected</option>
                      </select>
                      
                      <span className="text-sm text-gray-500">
                        Applied: {new Date(application.applied_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No applications yet.</p>
              <p className="text-gray-400 mt-2">Applications will appear here when students apply to your jobs.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Company Profile Tab Component
const CompanyProfileTab = ({ profile, user }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Company Profile</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p className="mt-1 text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <p className="mt-1 text-gray-900">
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {profile.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <p className="mt-1 text-gray-900">{profile?.industry || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">HR Contact</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">HR Name</label>
                  <p className="mt-1 text-gray-900">{profile?.hr_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HR Phone</label>
                  <p className="mt-1 text-gray-900">{profile?.hr_phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Company Description</h3>
              <div className="mt-4">
                <p className="text-gray-900">
                  {profile?.description || 'No description provided.'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.approved_by_admin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile?.approved_by_admin ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;