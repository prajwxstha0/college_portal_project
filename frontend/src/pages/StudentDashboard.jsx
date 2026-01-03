import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: 'all',
    location: 'all',
    department: 'all'
  });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlisted: 0,
    selected: 0
  });

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
      fetchRecommendedJobs();
    } else if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'profile') {
      fetchProfile();
    } else if (activeTab === 'recommended') {
      fetchRecommendedJobs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (applications.length > 0) {
      calculateStats();
    }
  }, [applications]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const response = await axios.get('/jobs/recommended');
      setRecommendedJobs(response.data.recommendedJobs || []);
    } catch (error) {
      console.log('No recommended jobs available');
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/applications/my-applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.log('No applications yet');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile/student');
      setProfile(response.data.student || {});
    } catch (error) {
      console.log('Error fetching profile');
    }
  };

  const applyForJob = async (jobId) => {
    try {
      await axios.post('/applications/apply', { jobId });
      toast.success('Application submitted successfully!');
      fetchApplications();
      fetchJobs(); // Refresh to update apply button status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/profile/student', profileData);
      setProfile(response.data.student);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      await axios.put('/profile/student/password', passwordData);
      toast.success('Password updated successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
      return false;
    }
  };

  const uploadResume = async (resumeUrl) => {
    try {
      await axios.post('/profile/student/resume', { resumeUrl });
      toast.success('Resume uploaded successfully!');
      fetchProfile();
      return true;
    } catch (error) {
      toast.error('Failed to upload resume');
      return false;
    }
  };

  const withdrawApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await axios.delete(`/applications/${applicationId}`);
        toast.success('Application withdrawn successfully!');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to withdraw application');
      }
    }
  };

  const calculateStats = () => {
    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      selected: applications.filter(app => app.status === 'selected').length
    };
    setStats(stats);
  };

  const hasApplied = (jobId) => {
    return applications.some(app => app.job_id === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.job_id === jobId);
    return application ? application.status : null;
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.required_skills?.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesJobType = filters.jobType === 'all' || job.job_type === filters.jobType;
    const matchesLocation = filters.location === 'all' || 
                           job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesJobType && matchesLocation;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🎓 Student Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {user?.department} - Batch {user?.batch}
              </span>
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

      {/* Stats Overview */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.shortlisted}</div>
                <div className="text-sm text-gray-600">Shortlisted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
                <div className="text-sm text-gray-600">Selected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'jobs', label: 'Browse Jobs', icon: '💼' },
              { key: 'recommended', label: 'Recommended', icon: '⭐' },
              { key: 'applications', label: 'My Applications', icon: '📋' },
              { key: 'profile', label: 'Profile', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <JobsTab
              jobs={filteredJobs}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              onApply={applyForJob}
              hasApplied={hasApplied}
              getApplicationStatus={getApplicationStatus}
              onRefresh={fetchJobs}
            />
          )}

          {/* Recommended Jobs Tab */}
          {activeTab === 'recommended' && (
            <RecommendedJobsTab
              jobs={recommendedJobs}
              loading={loading}
              onApply={applyForJob}
              hasApplied={hasApplied}
              getApplicationStatus={getApplicationStatus}
              onRefresh={fetchRecommendedJobs}
            />
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <ApplicationsTab
              applications={applications}
              loading={loading}
              stats={stats}
              onWithdraw={withdrawApplication}
              onRefresh={fetchApplications}
              getStatusColor={getStatusColor}
            />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab 
              profile={profile}
              user={user}
              onUpdateProfile={updateProfile}
              onUpdatePassword={updatePassword}
              onUploadResume={uploadResume}
            />
          )}

        </div>
      </div>
    </div>
  );
};

// Jobs Tab Component
const JobsTab = ({ jobs, loading, searchTerm, setSearchTerm, filters, setFilters, onApply, hasApplied, getApplicationStatus, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={filters.jobType}
              onChange={(e) => setFilters({...filters, jobType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
            </select>
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            <button
              onClick={onRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Jobs & Internships
            <span className="text-lg font-normal text-gray-600 ml-2">
              ({jobs.length} jobs found)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard
                key={job.job_id}
                job={job}
                onApply={onApply}
                hasApplied={hasApplied}
                getApplicationStatus={getApplicationStatus}
              />
            ))}
            
            {jobs.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💼</div>
                <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, onApply, hasApplied, getApplicationStatus }) => {
  const applicationStatus = getApplicationStatus(job.job_id);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
          <p className="text-gray-600 mt-1">{job.company_name}</p>
        </div>
        {applicationStatus && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicationStatus)}`}>
            {applicationStatus}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <span className="w-6">📍</span>
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="w-6">💰</span>
          <span>{job.salary || 'Salary not specified'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="w-6">⏱️</span>
          <span>{job.job_type}</span>
        </div>
      </div>

      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        {hasApplied(job.job_id) ? (
          <div className="flex items-center justify-between">
            <span className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm font-medium">
              ✅ Applied
            </span>
            <span className="text-sm text-gray-500">
              {applicationStatus && `Status: ${applicationStatus}`}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onApply(job.job_id)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 font-medium"
          >
            Apply Now
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Posted {new Date(job.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

// Recommended Jobs Tab Component
const RecommendedJobsTab = ({ jobs, loading, onApply, hasApplied, getApplicationStatus, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              ⭐ Recommended Jobs
            </h2>
            <p className="text-gray-600 mt-1">
              Jobs matched to your skills and profile
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Recommendations
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading recommendations...</p>
        </div>
      ) : (
        <div>
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <div key={job.job_id} className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600 mt-1">{job.company_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mb-1">
                        {job.matchPercentage?.toFixed(0)}% Match
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.skillMatch} skills match
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="w-6">📍</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6">💰</span>
                      <span>{job.salary || 'Salary not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6">⏱️</span>
                      <span>{job.job_type}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {hasApplied(job.job_id) ? (
                      <span className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm font-medium">
                        ✅ Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => onApply(job.job_id)}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition duration-200 font-medium"
                      >
                        ⭐ Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No recommended jobs available.</p>
              <p className="text-gray-400 mt-2">
                Update your skills in your profile to get better recommendations.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Applications Tab Component
const ApplicationsTab = ({ applications, loading, stats, onWithdraw, onRefresh, getStatusColor }) => {
  const [filter, setFilter] = useState('all');

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">My Applications</h2>
            <p className="text-gray-600">Track your job applications</p>
          </div>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Application Filters */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: `All Applications (${applications.length})` },
            { key: 'pending', label: `Pending (${stats.pendingApplications})` },
            { key: 'shortlisted', label: `Shortlisted (${stats.shortlisted})` },
            { key: 'selected', label: `Selected (${stats.selected})` },
            { key: 'rejected', label: `Rejected (${applications.filter(app => app.status === 'rejected').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      ) : (
        <div className="p-6">
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map(application => (
                <div key={application.application_id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {application.company_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{application.job_title}</h4>
                          <p className="text-gray-600">{application.company_name}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📍 {application.location}</span>
                            <span>•</span>
                            <span>⏱️ {application.job_type}</span>
                            <span>•</span>
                            <span>💰 {application.salary || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                      <button
                        onClick={() => onWithdraw(application.application_id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Applied on: {new Date(application.applied_date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {application.company_email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">
                {filter === 'all' ? 'No applications yet.' : `No ${filter} applications.`}
              </p>
              <p className="text-gray-400 mt-2">
                {filter === 'all' 
                  ? 'Start applying to jobs to see them here.' 
                  : 'Applications with this status will appear here.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Profile Tab Component - FIXED VERSION
const ProfileTab = ({ profile, user, onUpdateProfile, onUpdatePassword, onUploadResume }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: profile?.phone || '',
    department: user?.department || 'CSE',
    batch: user?.batch || '',
    cgpa: profile?.cgpa || '',
    skills: profile?.skills?.join(', ') || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resumeFile, setResumeFile] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const profileData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    
    const success = await onUpdateProfile(profileData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    const success = await onUpdatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (success) {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please select a file');
      return;
    }

    // Mock file upload - in real implementation, you'd upload to cloud storage
    const mockResumeUrl = `https://example.com/resumes/${user?.id}/${resumeFile.name}`;
    const success = await onUploadResume(mockResumeUrl);
    
    if (success) {
      setResumeFile(null);
      // Reset file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phone: profile?.phone || '',
      department: user?.department || 'CSE',
      batch: user?.batch || '',
      cgpa: profile?.cgpa || '',
      skills: profile?.skills?.join(', ') || ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Student Profile</h2>
      </div>

      {/* Profile Navigation */}
      <div className="border-b">
        <nav className="flex -mb-px">
          {[
            { key: 'personal', label: 'Personal Info', icon: '👤' },
            { key: 'academic', label: 'Academic Info', icon: '🎓' },
            { key: 'skills', label: 'Skills & Resume', icon: '💼' },
            { key: 'security', label: 'Security', icon: '🔒' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Personal Information Section */}
        {activeSection === 'personal' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academic Information Section */}
        {activeSection === 'academic' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Academic Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Academic Info
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="CSE">Computer Science</option>
                      <option value="IT">Information Technology</option>
                      <option value="ECE">Electronics</option>
                      <option value="ME">Mechanical</option>
                      <option value="CE">Civil</option>
                      <option value="EE">Electrical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch *</label>
                    <input
                      type="number"
                      value={formData.batch}
                      onChange={(e) => setFormData({...formData, batch: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 8.5"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-gray-900">{user?.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch</label>
                    <p className="mt-1 text-gray-900">{user?.batch}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CGPA</label>
                    <p className="mt-1 text-gray-900">{profile?.cgpa || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills & Resume Section */}
        {activeSection === 'skills' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Skills & Resume</h3>

            {/* Skills Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Skills</h4>
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="e.g., JavaScript, React, Node.js, Python"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={handleProfileSubmit}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save Skills
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {profile?.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added yet.</p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit Skills
                  </button>
                </div>
              )}
            </div>

            {/* Resume Section */}
            <div className="pt-6 border-t">
              <h4 className="text-md font-medium text-gray-900 mb-4">Resume</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload your resume to increase your chances of getting hired.
                  </p>
                  <form onSubmit={handleResumeUpload} className="flex items-center space-x-4">
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={!resumeFile}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload
                    </button>
                  </form>
                </div>

                {profile?.resume_url && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">📄</span>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Resume Uploaded</p>
                          <p className="text-sm text-green-600">Your resume is visible to companies</p>
                        </div>
                      </div>
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Security Settings</h3>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Keep your account secure by regularly updating your password.
                </p>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'selected': return 'bg-green-100 text-green-800';
    case 'shortlisted': return 'bg-blue-100 text-blue-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

export default StudentDashboard;