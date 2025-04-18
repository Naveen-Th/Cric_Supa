
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to Dashboard
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-cricket-primary">Cricket Hub</h1>
        <p className="text-xl text-gray-600">Loading your cricket dashboard...</p>
        <div className="mt-4 animate-spin h-8 w-8 border-4 border-cricket-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
