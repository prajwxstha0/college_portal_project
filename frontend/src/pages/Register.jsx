import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formType, setFormType] = useState('student');
  const [loading, setLoading] = useState(false);
  
  const { registerStudent, registerCompany } = useAuth();
  const navigate = useNavigate();

  // Student form data
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    batch: 2024
  });

  // Company form data
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    password: '',
    hrName: ''
  });

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await registerStudent(studentData);
    
    if (result.success) {
      alert('Registration successful!');
      navigate('/dashboard');
    } else {
      alert(result.message);
    }
    
    setLoading(false);
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await registerCompany(companyData);
    
    if (result.success) {
      alert('Registration successful!');
      navigate('/dashboard');
    } else {
      alert(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setFormType('student')}
              className={`px-4 py-2 rounded-md ${
                formType === 'student' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setFormType('company')}
              className={`px-4 py-2 rounded-md ${
                formType === 'company' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Company
            </button>
          </div>
        </div>

        {formType === 'student' ? (
          <form className="mt-8 space-y-6" onSubmit={handleStudentSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={studentData.name}
                onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="email"
                placeholder="Email Address"
                required
                value={studentData.email}
                onChange={(e) => setStudentData({...studentData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="password"
                placeholder="Password"
                required
                value={studentData.password}
                onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              <select
                value={studentData.department}
                onChange={(e) => setStudentData({...studentData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CSE">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics</option>
              </select>
              
              <input
                type="number"
                placeholder="Batch Year"
                required
                value={studentData.batch}
                onChange={(e) => setStudentData({...studentData, batch: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Student'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleCompanySubmit}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Company Name"
                required
                value={companyData.companyName}
                onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="email"
                placeholder="Email Address"
                required
                value={companyData.email}
                onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="password"
                placeholder="Password"
                required
                value={companyData.password}
                onChange={(e) => setCompanyData({...companyData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="text"
                placeholder="HR Contact Name"
                required
                value={companyData.hrName}
                onChange={(e) => setCompanyData({...companyData, hrName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Company'}
            </button>
          </form>
        )}

        <div className="text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-500"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;