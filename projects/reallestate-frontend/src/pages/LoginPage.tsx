import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirection
import DigiLockerAuth from '../components/DigiLockerAuth';

const LoginPage: React.FC = () => {
  const [authHash, setAuthHash] = useState<string | null>(null);
  const navigate = useNavigate();  // Hook for navigation

  // Handle successful authentication
  const handleAuthSuccess = (hash: string) => {
    setAuthHash(hash);  // Set the authentication hash in state
    console.log("DigiLocker Auth Success:", hash);

    // Optionally, you can store the authHash or use it in your app

    // Redirect to the dashboard or home page after successful login
    navigate('/dashboard');  // Use navigate hook to redirect
  };

  return (
    <div>
      <h1>Login Page</h1>
      <DigiLockerAuth onAuthSuccess={handleAuthSuccess} />

      {/* Optionally display the authHash */}
      {authHash && <p>Authentication Successful with hash: {authHash}</p>}
    </div>
  );
};

export default LoginPage;
