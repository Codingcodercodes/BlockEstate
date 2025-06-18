import React from 'react';

interface DigiLockerAuthProps {
  onAuthSuccess?: (hash: string) => void;  // Optional callback to handle the auth hash after successful login
}

const DigiLockerAuth: React.FC<DigiLockerAuthProps> = ({ onAuthSuccess }) => {

  const handleLogin = () => {
    console.log('DigiLocker login button clicked');  // Debugging line

    // Send user to DigiLocker login page
    window.location.href = "http://localhost:3000/digilocker/login";  // Now pointing to the working server

    // Simulate a hash being returned from the backend (mock for demo purposes)
    const mockHash = "some-verification-hash";  // Replace this with real backend logic.

    // Simulate calling the success callback
    if (onAuthSuccess) {
      console.log('Calling onAuthSuccess with hash:', mockHash);  // Debugging line
      onAuthSuccess(mockHash);  // Trigger callback with mock hash
    }
  };
};

export default DigiLockerAuth;
