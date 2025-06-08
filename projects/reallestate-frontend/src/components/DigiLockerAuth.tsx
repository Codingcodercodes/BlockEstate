
  import React from 'react';

interface DigiLockerAuthProps {
  onAuthSuccess?: (hash: string) => void; // Optional, now handled via URL after redirect
}

const DigiLockerAuth: React.FC<DigiLockerAuthProps> = () => {

  const handleLogin = () => {
    // Redirect to backend's DigiLocker login route
    window.location.href = "http://localhost:3000/digilocker/login";
  };


};

export default DigiLockerAuth;
