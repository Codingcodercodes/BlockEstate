import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import ConnectWallet from './components/ConnectWallet';
import Transact from './components/Transact';
import AppCalls from './components/AppCalls';
import LandManager from './components/LandManager';
import PropertyList from './components/propertylist';
import DigiLockerAuth from './components/DigiLockerAuth';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const DIGILOCKER_LOGIN_URL = process.env.REACT_APP_DIGILOCKER_LOGIN_URL || 'http://localhost:3000/digilocker/login';
const DOCUMENTS_API_URL = process.env.REACT_APP_DOCUMENTS_API_URL || 'http://localhost:3000';

const Home: React.FC = () => {
  const { activeAddress, disconnect } = useWallet();
  const location = useLocation();

  const [modals, setModals] = useState({
    wallet: false,
    transact: false,
    appCalls: false,
    digilocker: false,
    documentModal: false,
  });

  const [fadeIn, setFadeIn] = useState(false);
  const [authHash, setAuthHash] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const truncateAddress = (addr: string) =>
    addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hash = params.get('hash');
    if (hash) {
      setAuthHash(hash);
      console.log('✅ DigiLocker Auth Success:', hash);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, location.pathname]);

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const toggleModal = (key: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const launchDigiLocker = () => {
    setIsRedirecting(true);
    window.location.href = DIGILOCKER_LOGIN_URL;
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${DOCUMENTS_API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
      toggleModal('documentModal');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to upload documents.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post(`${DOCUMENTS_API_URL}/upload/gridfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Upload response:', response.data);
      alert('📤 Document uploaded successfully!');
      fetchDocuments();
    } catch (error: any) {
      console.error('❌ Upload error:', error.response || error.message);
      alert('❌ Error uploading document.');
    } finally {
      setUploading(false);
      setFile(null);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const baseButton: React.CSSProperties = {
    padding: '0.8rem 1.6rem',
    margin: '0.5rem 0',
    width: '100%',
    fontSize: '1.2rem',
    fontWeight: 600,
    borderRadius: '0.7rem',
    cursor: 'pointer',
    transition: 'all 0.4s ease-in-out',
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
  };

  const buttonGradient: React.CSSProperties = {
    ...baseButton,
    background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
    color: '#fff',
    border: 'none',
    transform: 'scale(1)',
  };

  const buttonOutline: React.CSSProperties = {
    ...baseButton,
    backgroundColor: '#fff',
    border: '2px solid #ff7e5f',
    color: '#ff7e5f',
  };

  const sectionStyle: React.CSSProperties = {
    marginTop: '2.5rem',
    padding: '1.8rem',
    background: 'linear-gradient(to bottom right, #ffffff, #f0fdfa)',
    borderRadius: '1rem',
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #1e3c72, #2a5298)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1.2rem',
          padding: '3rem',
          maxWidth: '850px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #ff6a00, #ee0979, #ff6a00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `
              1px 1px 2px rgba(0, 0, 0, 0.2),
              0 4px 8px rgba(255, 106, 0, 0.5),
              0 0 20px rgba(126, 117, 121, 0.3)
            `,
            letterSpacing: '1.5px',
            lineHeight: '1.2',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
          }}

        >
           🌏 Welcome To BlockEstate
        </h1>


        <p style={{ color: '#4a5568', fontSize: '1.1rem', marginBottom: '2rem' }}>
          🏨 Secure, Smart, and Scalable Digital Land on Algorand.
          <br /> The Future Of Ownership 🚀
        </p>

        <button
          style={buttonGradient}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={() => toggleModal('wallet')}
        >
          {activeAddress ? `🦊 Connected: ${truncateAddress(activeAddress)}` : '🔌 Connect Wallet'}
        </button>

        {activeAddress && (
          <div style={{ marginTop: '1.5rem' }}>


            <button
              style={buttonOutline}
              onClick={launchDigiLocker}
              disabled={isRedirecting}
            >
              {isRedirecting ? 'Redirecting...' : '🔑 Login with DigiLocker'}
            </button>

            {/*
            <div style={{ marginTop: '2rem' }}>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ marginBottom: '1rem' }}
              />
              <button
                onClick={handleFileUpload}
                style={buttonOutline}
                disabled={uploading || !file}
              >
                {uploading ? 'Uploading...' : '📤 Upload Document'}
              </button>
            </div>
            <button style={buttonOutline} onClick={fetchDocuments}>
              📄 Fetch Documents
            </button>*/}

            <button
              style={{ ...buttonOutline, marginTop: '1rem' }}
              onClick={() => {
                disconnect();
                setModals((prev) => ({ ...prev, wallet: false }));
              }}
            >
              🔒 Disconnect Wallet
            </button>
          </div>
        )}

        {authHash && (
          <div style={{ marginTop: '1rem', color: 'green', fontWeight: 600 }}>
            ✅ DigiLocker Authenticated: {authHash}
          </div>
        )}

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ff7e5f', marginBottom: '1rem' }}>
            🏡 Available Properties
          </h2>
          <PropertyList />
        </div>

        <div style={{ ...sectionStyle, marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#20c997', marginBottom: '1rem' }}>
            🧭 Land Management Tools
          </h2>
          <LandManager />
        </div>

        <ConnectWallet openModal={modals.wallet} closeModal={() => toggleModal('wallet')} />
        <Transact
          openModal={modals.transact}
          setModalState={(v) => setModals((prev) => ({ ...prev, transact: v }))}
        />
        <AppCalls
          openModal={modals.appCalls}
          setModalState={(v) => setModals((prev) => ({ ...prev, appCalls: v }))}
        />
        <DigiLockerAuth
          openModal={modals.digilocker}
          onAuthSuccess={setAuthHash}
          closeModal={() => toggleModal('digilocker')}
        />

        {/* Document Modal */}
        {modals.documentModal && (
          <div
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
              marginTop: '2rem',
            }}
          >
            <h2>Fetched Documents</h2>
            {loadingDocs ? (
              <p>Loading documents...</p>
            ) : (
              <ul>
                {documents.map((doc: any) => (
                  <li key={doc._id}>
                    <a href={doc.link} target="_blank" rel="noopener noreferrer">
                      {doc.title || doc.filename || 'Untitled'}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => toggleModal('documentModal')} style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default Home;
