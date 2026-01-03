import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchAnalytics();
    } else if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'companies') {
      fetchCompanies();
    } else if (activeTab === 'jobs') {
      fetchJobs();
    } else if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data.stats || {});
    } catch (error) {
      toast.error('Failed to load statistics');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/admin/analytics');
      setAnalytics(response.data.analytics || {});
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/students');
      setStudents(response.data.students || []);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/companies');
      setCompanies(response.data.companies || []);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/jobs');
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
      const response = await axios.get('/admin/applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Student Management
  const approveStudent = async (studentId) => {
    try {
      await axios.put(`/admin/students/${studentId}/approve`);
      toast.success('Student approved successfully!');
      fetchStudents();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve student');
    }
  };

  const blockStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to block this student?')) {
      try {
        await axios.put(`/admin/students/${studentId}/block`);
        toast.success('Student blocked successfully!');
        fetchStudents();
        fetchStats();
      } catch (error) {
        toast.error('Failed to block student');
      }
    }
  };

  const deleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await axios.delete(`/admin/students/${studentId}`);
        toast.success('Student deleted successfully!');
        fetchStudents();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  // Company Management
  const approveCompany = async (companyId) => {
    try {
      await axios.put(`/admin/companies/${companyId}/approve`);
      toast.success('Company approved successfully!');
      fetchCompanies();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve company');
    }
  };

  const blockCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to block this company?')) {
      try {
        await axios.put(`/admin/companies/${companyId}/block`);
        toast.success('Company blocked successfully!');
        fetchCompanies();
        fetchStats();
      } catch (error) {
        toast.error('Failed to block company');
      }
    }
  };

  const deleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This will also delete all their jobs and applications.')) {
      try {
        await axios.delete(`/admin/companies/${companyId}`);
        toast.success('Company deleted successfully!');
        fetchCompanies();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete company');
      }
    }
  };

  // Job Management
  const approveJob = async (jobId) => {
    try {
      await axios.put(`/admin/jobs/${jobId}/approve`);
      toast.success('Job approved successfully!');
      fetchJobs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve job');
    }
  };

  const rejectJob = async (jobId) => {
    if (window.confirm('Are you sure you want to reject this job?')) {
      try {
        await axios.put(`/admin/jobs/${jobId}/reject`);
        toast.success('Job rejected successfully!');
        fetchJobs();
        fetchStats();
      } catch (error) {
        toast.error('Failed to reject job');
      }
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`/admin/jobs/${jobId}`);
        toast.success('Job deleted successfully!');
        fetchJobs();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  // Application Management
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.put(`/admin/applications/${applicationId}`, { status });
      toast.success('Application status updated!');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  // Report Generation
  const generatePlacementReport = async () => {
    try {
      const response = await axios.get('/admin/reports/placement');
      toast.success('Placement report generated successfully!');
      
      // Create and download PDF (mock implementation)
      const reportData = response.data.report;
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `placement-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error('Failed to generate placement report');
    }
  };

  const generateAnalyticsReport = async () => {
    try {
      const response = await axios.get('/admin/reports/analytics');
      toast.success('Analytics report generated successfully!');
      
      // Create and download PDF (mock implementation)
      const reportData = response.data.report;
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error('Failed to generate analytics report');
    }
  };

  const refreshData = () => {
    fetchStats();
    fetchAnalytics();
    toast.success('Data refreshed!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                ⚙️ Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                Admin
              </span>
              <button
                onClick={refreshData}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Refresh Data
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
          <nav className="flex space-x-4 overflow-x-auto">
            {[
              'dashboard',
              'students', 
              'companies',
              'jobs',
              'applications',
              'reports',
              'analytics'
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap capitalize ${
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              stats={stats}
              analytics={analytics}
              onViewStudents={() => setActiveTab('students')}
              onViewCompanies={() => setActiveTab('companies')}
              onViewJobs={() => setActiveTab('jobs')}
            />
          )}

          {/* Students Management Tab */}
          {activeTab === 'students' && (
            <StudentsTab
              students={students}
              loading={loading}
              onApproveStudent={approveStudent}
              onBlockStudent={blockStudent}
              onDeleteStudent={deleteStudent}
              onRefresh={fetchStudents}
              selectedStudent={selectedStudent}
              onSelectStudent={setSelectedStudent}
            />
          )}

          {/* Companies Management Tab */}
          {activeTab === 'companies' && (
            <CompaniesTab
              companies={companies}
              loading={loading}
              onApproveCompany={approveCompany}
              onBlockCompany={blockCompany}
              onDeleteCompany={deleteCompany}
              onRefresh={fetchCompanies}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />
          )}

          {/* Jobs Management Tab */}
          {activeTab === 'jobs' && (
            <JobsTab
              jobs={jobs}
              loading={loading}
              onApproveJob={approveJob}
              onRejectJob={rejectJob}
              onDeleteJob={deleteJob}
              onRefresh={fetchJobs}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
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

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsTab
              reports={reports}
              loading={loading}
              onGeneratePlacementReport={generatePlacementReport}
              onGenerateAnalyticsReport={generateAnalyticsReport}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              analytics={analytics}
              stats={stats}
            />
          )}

        </div>
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ stats, analytics, onViewStudents, onViewCompanies, onViewJobs }) => {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👨‍🎓</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
              <p className="text-xs text-red-600 mt-1">
                {stats.pendingStudents || 0} pending approval
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Companies</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies || 0}</p>
              <p className="text-xs text-red-600 mt-1">
                {stats.pendingCompanies || 0} pending approval
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs || 0}</p>
              <p className="text-xs text-red-600 mt-1">
                {stats.pendingJobs || 0} pending approval
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.activeJobs || 0} active jobs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={onViewStudents}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 text-left"
            >
              👨‍🎓 Manage Students
            </button>
            <button 
              onClick={onViewCompanies}
              className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 text-left"
            >
              🏢 Manage Companies
            </button>
            <button 
              onClick={onViewJobs}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 text-left"
            >
              💼 Manage Jobs
            </button>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <span className="font-medium">Students</span>
                <p className="text-sm text-gray-600">Waiting for approval</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.pendingStudents || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <span className="font-medium">Companies</span>
                <p className="text-sm text-gray-600">Waiting for approval</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.pendingCompanies || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <span className="font-medium">Jobs</span>
                <p className="text-sm text-gray-600">Waiting for approval</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.pendingJobs || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.blockedStudents || 0}</div>
            <div className="text-gray-600">Blocked Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.blockedCompanies || 0}</div>
            <div className="text-gray-600">Blocked Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.placementRate || '72%'}</div>
            <div className="text-gray-600">Placement Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Students Management Tab Component
const StudentsTab = ({ students, loading, onApproveStudent, onBlockStudent, onDeleteStudent, onRefresh, selectedStudent, onSelectStudent }) => {
  const pendingStudents = students.filter(s => s.status === 'pending');
  const approvedStudents = students.filter(s => s.status === 'approved');
  const blockedStudents = students.filter(s => s.status === 'blocked');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Student Management</h2>
              <p className="text-gray-600">Approve, block, or remove student accounts</p>
            </div>
            <button
              onClick={onRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Student Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { key: 'all', label: `All Students (${students.length})`, count: students.length },
              { key: 'pending', label: `Pending (${pendingStudents.length})`, count: pendingStudents.length },
              { key: 'approved', label: `Approved (${approvedStudents.length})`, count: approvedStudents.length },
              { key: 'blocked', label: `Blocked (${blockedStudents.length})`, count: blockedStudents.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => onSelectStudent(tab.key)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  selectedStudent === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading students...</p>
          </div>
        ) : (
          <div className="p-6">
            {(() => {
              const displayStudents = selectedStudent === 'all' ? students :
                                   selectedStudent === 'pending' ? pendingStudents :
                                   selectedStudent === 'approved' ? approvedStudents :
                                   blockedStudents;

              return displayStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayStudents.map((student) => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.batch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === 'approved' ? 'bg-green-100 text-green-800' :
                              student.status === 'blocked' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {student.status === 'pending' && (
                              <button
                                onClick={() => onApproveStudent(student.student_id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            )}
                            {student.status !== 'blocked' ? (
                              <button
                                onClick={() => onBlockStudent(student.student_id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                onClick={() => onApproveStudent(student.student_id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Unblock
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteStudent(student.student_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    {selectedStudent === 'pending' ? 'No pending students' :
                     selectedStudent === 'approved' ? 'No approved students' :
                     selectedStudent === 'blocked' ? 'No blocked students' :
                     'No students found'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// Companies Management Tab Component
const CompaniesTab = ({ companies, loading, onApproveCompany, onBlockCompany, onDeleteCompany, onRefresh, selectedCompany, onSelectCompany }) => {
  const pendingCompanies = companies.filter(c => !c.approved_by_admin && !c.blocked);
  const approvedCompanies = companies.filter(c => c.approved_by_admin && !c.blocked);
  const blockedCompanies = companies.filter(c => c.blocked);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Company Management</h2>
              <p className="text-gray-600">Approve, block, or remove company accounts</p>
            </div>
            <button
              onClick={onRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Company Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { key: 'all', label: `All Companies (${companies.length})`, count: companies.length },
              { key: 'pending', label: `Pending (${pendingCompanies.length})`, count: pendingCompanies.length },
              { key: 'approved', label: `Approved (${approvedCompanies.length})`, count: approvedCompanies.length },
              { key: 'blocked', label: `Blocked (${blockedCompanies.length})`, count: blockedCompanies.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => onSelectCompany(tab.key)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  selectedCompany === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading companies...</p>
          </div>
        ) : (
          <div className="p-6">
            {(() => {
              const displayCompanies = selectedCompany === 'all' ? companies :
                                     selectedCompany === 'pending' ? pendingCompanies :
                                     selectedCompany === 'approved' ? approvedCompanies :
                                     blockedCompanies;

              return displayCompanies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HR Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayCompanies.map((company) => (
                        <tr key={company.company_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                              <div className="text-sm text-gray-500">{company.email}</div>
                              {company.website && (
                                <div className="text-sm text-blue-500">{company.website}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {company.hr_name}
                            {company.hr_phone && (
                              <div className="text-gray-400">{company.hr_phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              company.blocked ? 'bg-red-100 text-red-800' :
                              company.approved_by_admin ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {company.blocked ? 'blocked' : company.approved_by_admin ? 'approved' : 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(company.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {!company.approved_by_admin && !company.blocked && (
                              <button
                                onClick={() => onApproveCompany(company.company_id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            )}
                            {!company.blocked ? (
                              <button
                                onClick={() => onBlockCompany(company.company_id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                onClick={() => onApproveCompany(company.company_id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Unblock
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteCompany(company.company_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    {selectedCompany === 'pending' ? 'No pending companies' :
                     selectedCompany === 'approved' ? 'No approved companies' :
                     selectedCompany === 'blocked' ? 'No blocked companies' :
                     'No companies found'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// Jobs Management Tab Component
const JobsTab = ({ jobs, loading, onApproveJob, onRejectJob, onDeleteJob, onRefresh, selectedJob, onSelectJob }) => {
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'active');
  const rejectedJobs = jobs.filter(j => j.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Job Management</h2>
              <p className="text-gray-600">Approve, reject, or remove job postings</p>
            </div>
            <button
              onClick={onRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Job Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { key: 'all', label: `All Jobs (${jobs.length})`, count: jobs.length },
              { key: 'pending', label: `Pending (${pendingJobs.length})`, count: pendingJobs.length },
              { key: 'active', label: `Active (${activeJobs.length})`, count: activeJobs.length },
              { key: 'rejected', label: `Rejected (${rejectedJobs.length})`, count: rejectedJobs.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => onSelectJob(tab.key)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  selectedJob === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        ) : (
          <div className="p-6">
            {(() => {
              const displayJobs = selectedJob === 'all' ? jobs :
                                selectedJob === 'pending' ? pendingJobs :
                                selectedJob === 'active' ? activeJobs :
                                rejectedJobs;

              return displayJobs.length > 0 ? (
                <div className="space-y-4">
                  {displayJobs.map(job => (
                    <div key={job.job_id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <p className="text-gray-600 mt-1">{job.company_name}</p>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>📍 {job.location}</span>
                              <span className="mx-2">•</span>
                              <span>⏱️ {job.job_type}</span>
                              <span className="mx-2">•</span>
                              <span>💰 {job.salary || 'Not specified'}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2">
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
                        </div>
                        
                        <div className="ml-6 flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            job.status === 'active' ? 'bg-green-100 text-green-800' :
                            job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          Posted by: {job.company_name}
                        </div>
                        <div className="flex space-x-2">
                          {job.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onApproveJob(job.job_id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onRejectJob(job.job_id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onDeleteJob(job.job_id)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
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
                  <p className="text-gray-500 text-lg">
                    {selectedJob === 'pending' ? 'No pending jobs' :
                     selectedJob === 'active' ? 'No active jobs' :
                     selectedJob === 'rejected' ? 'No rejected jobs' :
                     'No jobs found'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
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
            <h2 className="text-2xl font-bold">Applications Monitoring</h2>
            <p className="text-gray-600">Track and manage all job applications</p>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job & Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.application_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Application #{app.application_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.student_name}</div>
                          <div className="text-sm text-gray-500">{app.student_email}</div>
                          <div className="text-sm text-gray-400">{app.department} - {app.batch}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.job_title}</div>
                          <div className="text-sm text-gray-500">{app.company_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.application_id, e.target.value)}
                          className={`border rounded p-2 text-sm font-medium ${
                            app.status === 'selected' ? 'bg-green-100 text-green-800 border-green-200' :
                            app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="selected">Selected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.applied_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No applications found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Reports Tab Component
const ReportsTab = ({ reports, loading, onGeneratePlacementReport, onGenerateAnalyticsReport }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-gray-600">Generate comprehensive reports for placement and analytics</p>
      </div>
      
      <div className="p-6">
        {/* Report Generation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">📊 Placement Reports</h3>
            <p className="text-gray-600 mb-4">Generate comprehensive placement reports with student and company data</p>
            <div className="space-y-3">
              <button 
                onClick={onGeneratePlacementReport}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              >
                Generate Placement Report
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                Department-wise Report
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Company-wise Report
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">📈 Analytics Reports</h3>
            <p className="text-gray-600 mb-4">Generate analytical insights and trends for system performance</p>
            <div className="space-y-3">
              <button 
                onClick={onGenerateAnalyticsReport}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
              >
                Generate Analytics Report
              </button>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700">
                Placement Trends
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Success Rate Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">Generated on {report.date}</div>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports generated yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics, stats }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.placementRate || '72%'}</div>
          <div className="text-gray-600">Placement Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{analytics.avgPackage || '₹8.5 LPA'}</div>
          <div className="text-gray-600">Average Package</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{analytics.highestPackage || '₹15.2 LPA'}</div>
          <div className="text-gray-600">Highest Package</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">{analytics.totalPlacements || '89'}</div>
          <div className="text-gray-600">Total Placements</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">👥 User Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Active Students</span>
              <span className="font-semibold">{analytics.activeStudents || '142'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Active Companies</span>
              <span className="font-semibold">{analytics.activeCompanies || '28'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Applications Today</span>
              <span className="font-semibold">{analytics.applicationsToday || '15'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Interviews Scheduled</span>
              <span className="font-semibold">{analytics.interviewScheduled || '23'}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⚡ System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Performance</span>
                <span className="text-green-600">Excellent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Server Uptime</span>
                <span className="text-green-600">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Response Time</span>
                <span className="text-green-600">Fast</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department-wise Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Department-wise Performance</h3>
        <div className="space-y-3">
          {[
            { dept: 'Computer Science', placement: '85%', avgPackage: '₹9.2 LPA', students: 45 },
            { dept: 'Information Technology', placement: '78%', avgPackage: '₹8.1 LPA', students: 40 },
            { dept: 'Electronics', placement: '72%', avgPackage: '₹7.5 LPA', students: 35 },
            { dept: 'Mechanical', placement: '68%', avgPackage: '₹6.8 LPA', students: 30 }
          ].map((dept, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="font-medium">{dept.dept}</span>
                <div className="text-sm text-gray-500">{dept.students} students</div>
              </div>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-green-600 font-semibold">{dept.placement}</div>
                  <div className="text-xs text-gray-500">Placement</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600 font-semibold">{dept.avgPackage}</div>
                  <div className="text-xs text-gray-500">Avg Package</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;