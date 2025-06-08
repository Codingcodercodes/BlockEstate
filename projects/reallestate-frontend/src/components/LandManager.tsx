import React, { useState } from 'react';

const LandManager: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [doc1File, setDoc1File] = useState<File | null>(null);
  const [doc2Text, setDoc2Text] = useState<string>('');
  const [doc3File, setDoc3File] = useState<File | null>(null);
  const [newOwnerName, setNewOwnerName] = useState<string>('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [assetCreated, setAssetCreated] = useState<boolean>(false);
  const [verificationDetails, setVerificationDetails] = useState<string | null>(null);
  const [transferDetails, setTransferDetails] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showTransactions, setShowTransactions] = useState<boolean>(false);

  const randomSuccess = () => Math.random() > 0.3;

  const buttonBase = "px-6 py-2 rounded-md font-semibold shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
  const buttonOutline = "px-6 py-2 rounded-md border-radius-20pborder-2 border-indigo-600 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors";

  const toggleTransactions = () => setShowTransactions(!showTransactions);

  const getAccessToken = async () => {
    setLoading(true);
    setStatus('Authenticating... ⏳');
    await new Promise((res) => setTimeout(res, 1000));
    if (randomSuccess()) {
      setToken('sample-access-token');
      setStatus('Authenticated successfully ✅');
    } else {
      setToken(null);
      setStatus('Authentication failed ❌ Please try again.');
    }
    setLoading(false);
  };

  const fetchDocuments = async () => {
    if (!token) return setStatus('No token. Please authenticate first.');
    if (!doc1File || !doc2Text.trim() || !doc3File || !newOwnerName.trim()) {
      return setStatus('Please upload all files and enter all required information.');
    }
    setLoading(true);
    setStatus('Fetching documents... ⏳');
    await new Promise((res) => setTimeout(res, 1200));
    if (randomSuccess()) {
      setDocuments([doc1File.name, doc2Text, doc3File.name, `New Owner: ${newOwnerName}`]);
      setStatus('Documents fetched successfully ✅');
    } else {
      setStatus('Failed to fetch documents ❌');
    }
    setLoading(false);
  };

  const createAsset = async () => {
    if (!token) return setStatus('Authenticate first!');
    if (documents.length === 0) return setStatus('No documents available to verify ❌');
    setLoading(true);
    setStatus('Creating land verification asset... ⏳');
    setVerificationDetails(null);
    setTransferDetails(null);
    await new Promise((res) => setTimeout(res, 1500));
    if (randomSuccess()) {
      setAssetCreated(true);
      setStatus('Asset created successfully ✅');
      setVerificationDetails(`Verification Summary:
- Document 1: ${doc1File?.name}
-
- Land Title: ${doc2Text}
-
- Receipt: ${doc3File?.name}

- New Owner: ${newOwnerName}

- Verification Status: All documents verified and matched.`);
    } else {
      setAssetCreated(false);
      setStatus('Asset creation failed ❌ Try again.');
      setVerificationDetails(null);
    }
    setLoading(false);
  };

  const transferOwnership = async () => {
    if (!token) return setStatus('Authenticate first!');
    if (!assetCreated) return setStatus('You must create a verification asset first ⚠️');
    setLoading(true);
    setStatus('Transferring ownership... ⏳');
    setTransferDetails(null);
    await new Promise((res) => setTimeout(res, 1500));
    if (randomSuccess()) {
      setStatus('Ownership transferred successfully ✅');
      setTransferDetails(`Transfer Details:
- Transact ID: #${Math.floor(Math.random() * 10000)}
- Previous Owner: You
- New Owner: ${newOwnerName}
- Transfer Date: ${new Date().toLocaleString()}
- Receipt: ${doc3File?.name}`);
    } else {
      setStatus('Ownership transfer failed ❌ Please retry.');
      setTransferDetails(null);
    }
    setLoading(false);
  };

  const handleDoc1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setDoc1File(e.target.files[0]);
  };

  const handleDoc3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setDoc3File(e.target.files[0]);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-xl mt-12 font-sans text-gray-800">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-indigo-700 tracking-wide">
        Land Token Verification & Transfer
      </h1>

      <section className="space-y-10">
        {/* Authenticate */}
        <div className="border border-indigo-300 rounded-lg p-6 bg-indigo-50 shadow-md"
        style= {{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)' , padding: '20px', borderRadius:'30px',  fontFamily: 'calibri' }}>
          <h2 className="text-xl font-semibold mb-5 text-indigo-900">1. Authenticate</h2>
          <button
            onClick={getAccessToken}
            className={`${buttonBase} bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!!token && status.includes('Authenticated') || loading}
            aria-disabled={!!token && status.includes('Authenticated') || loading}
          >
            {loading && status.includes('Authenticating') ? (
              <span className="animate-spin inline-block mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5" style={{ boxShadow: '0 20px 20px rgba(130, 14, 232, 0.4)' }} />
            ) : null}
            {token ? 'Authenticated' : 'Get Access Token'}
          </button>
          {token && <p className="mt-3 text-green-700 font-medium" role="alert">Authenticated ✅</p>}
        </div>

        {/* Upload Documents */}
        {token && (
          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 shadow-sm"
          style={{ boxShadow: '0 8px 20px rgba(232, 134, 14, 0.4)',padding: '20px', borderRadius:'30px', fontFamily: 'calibri' }}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">2. Upload Documents & Enter Info</h2>

            <div className="mb-6">
              <label htmlFor="doc1" className="block font-medium mb-2 cursor-pointer">Property Images:</label>
              <input
                id="doc1"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleDoc1Change}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {doc1File && <p className="mt-2 text-sm text-gray-600">Selected: {doc1File.name}</p>}
            </div>
            <br />

            <div className="mb-6">
              <label htmlFor="landTitle" className="block font-medium mb-2 cursor-text">Land Title:</label>
              <input
                id="landTitle"
                type="text"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter text for Document 2"
                value={doc2Text}
                onChange={(e) => setDoc2Text(e.target.value)}
              />
            </div>
            <br />

            <div className="mb-6">
              <label htmlFor="receipt" className="block font-medium mb-2 cursor-pointer">Land Document:</label>
              <input
                id="receipt"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleDoc3Change}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {doc3File && <p className="mt-2 text-sm text-gray-600">Selected: {doc3File.name}</p>}
            </div>
            <br />

            <div className="mb-6">
              <label htmlFor="newOwnerName" className="block font-medium mb-2 cursor-text">New Owner Name:</label>
              <input
                id="newOwnerName"
                type="text"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter new owner name"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
              />
            </div>
            <br />
            <br />

            <button
              onClick={fetchDocuments}
              className={`${buttonBase} bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={!doc1File || !doc2Text.trim() || !doc3File || !newOwnerName.trim() || loading}
              aria-disabled={!doc1File || !doc2Text.trim() || !doc3File || !newOwnerName.trim() || loading}
            >
              {loading && status.includes('Fetching') ? (
                <span className="animate-spin inline-block mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5" />
              ) : null}
              Fetch Documents
            </button>

            {documents.length > 0 && (
              <ul className="list-disc pl-6 mt-6 space-y-1 text-gray-700 font-mono bg-white rounded-md p-4 shadow-inner max-h-48 overflow-auto">
                {documents.map((doc, i) => (
                  <li key={i}>{doc}<br/></li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Land Actions */}
        {token && (
          <div className="border border-indigo-300 rounded-lg p-6 bg-indigo-50 shadow-md" style={{ padding: '20px', borderRadius: '30px' }}>
            <h2 className="text-xl font-semibold mb-5 text-indigo-900">3. Land Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={createAsset}
                className={`${buttonBase} bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={documents.length === 0 || loading}
                aria-disabled={documents.length === 0 || loading}
              >
                {loading && status.includes('Creating') ? (
                  <span className="animate-spin inline-block mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5" />
                ) : null}
                Create Verification Asset
              </button>
              <br />

            {verificationDetails && (
              <div
                className="mt-8 p-6 rounded-xl bg-green-50 border-4 border-green-600 shadow-lg whitespace-pre-wrap font-mono text-green-900"
                style={{ boxShadow: '0 8px 20px rgba(34,197,94,0.4)' ,padding: '20px', borderRadius:'30px'}}
                role="region"
                aria-label="Verification Details"
              >
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">Verification Details</h3>
                <pre>{verificationDetails}</pre>
              </div>
            )}
            <br />

            <button onClick={toggleTransactions} className={buttonOutline}>
              💸 Transactions
            </button>
            <br />
            {showTransactions && (
              <div className="mt-8 p-6 rounded-xl bg-yellow-50 border-4 border-yellow-500 shadow-lg whitespace-pre-wrap font-mono text-yellow-900"
                style={{ boxShadow: '0 8px 20px rgba(234,179,8,0.4)',padding: '20px', borderRadius:'30px' }}
                role="region"
                aria-label="Transactions Summary">
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">Recent Transactions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>🔍 Asset created on {new Date().toLocaleDateString()} by "You"</li><br />
                  <li>✅ Verified land title: <strong>{doc2Text}</strong></li><br />
                  <li>📄 Receipt: {doc3File?.name}</li><br />
                  <li>➡️ Intended transfer to: {newOwnerName}</li><br />
                  <li>💾 Files uploaded: {doc1File?.name}, {doc3File?.name}</li><br />
                </ul>
              </div>
            )}
            <br />
            <button
                onClick={transferOwnership}
                className={`${buttonBase} bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={!assetCreated || loading}
                aria-disabled={!assetCreated || loading}
              >
                {loading && status.includes('Transferring') ? (
                  <span className="animate-spin inline-block mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5" />
                ) : null}
                Transfer Ownership
              </button>
            </div>

            {transferDetails && (
              <div
                className="mt-8 p-6 rounded-xl bg-blue-50 border-4 border-blue-600 shadow-lg whitespace-pre-wrap font-mono text-blue-900"
                style={{ boxShadow: '0 8px 20px rgba(37,99,235,0.4)',padding: '20px', borderRadius:'30px' }}
                role="region"
                aria-label="Transfer Details"
              >
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">Transfer Details</h3>
                <pre>{transferDetails}</pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Status */}
      {status && (
        <p
          className={`mt-10 text-center font-semibold ${status.toLowerCase().includes('failed') || status.toLowerCase().includes('no token') ? 'text-red-600' : 'text-green-700'}`}
          aria-live="polite"
          role="status"
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default LandManager;
