// src/pages/DigiLockerCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DigiLockerCallback: React.FC = () => {
  const [hash, setHash] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const receivedHash = queryParams.get('hash');

    if (receivedHash) {
      console.log('✅ Received hash from DigiLocker:', receivedHash);
      setHash(receivedHash);

      // Simulate saving hash or doing something useful here
      setTimeout(() => {
        navigate('/dashboard'); // Or wherever you want to redirect the user
      }, 2000);
    } else {
      console.warn('⚠️ No hash found in query params');
    }
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>DigiLocker Callback</h2>
      {hash ? (
        <p>✅ Authentication successful! Received hash: <strong>{hash}</strong></p>
      ) : (
        <p>⏳ Waiting for authentication data...</p>
      )}
    </div>
  );
};

export default DigiLockerCallback;
