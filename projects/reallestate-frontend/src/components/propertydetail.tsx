// src/components/PropertyDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DigiLockerAuth from './DigiLockerAuth'; // Ensure this file exists
import WalletConnect from './ConnectWallet'; // Ensure this file exists and path is correct

// Importing the useParams hook from react-router-dom
import { useParams } from 'react-router-dom';

interface Property {
  name: string;
  description: string;
  landTokenId: number;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Use useParams to extract the 'id' param from the URL
  const [property, setProperty] = useState<Property | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [buyerAddress, setBuyerAddress] = useState<string>('');
  const [documentHash, setDocumentHash] = useState<string>('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property details:', error);
      }
    };
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const handleVerification = (hash: string) => {
    setDocumentHash(hash);
    setIsVerified(true);
  };

  const handleTransfer = async () => {
    if (isVerified && buyerAddress && documentHash && property) {
      try {
        const response = await axios.post('http://localhost:5000/api/transfer', {
          buyerAddress,
          documentHash,
          landTokenId: property.landTokenId,
        });
        console.log(response.data);
      } catch (error) {
        console.error('Error completing the transaction:', error);
      }
    } else {
      alert('Please complete the verification and ensure a valid buyer address.');
    }
  };

  return (
    <div>
      {property ? (
        <>
          <h2>{property.name}</h2>
          <p>{property.description}</p>
          <DigiLockerAuth onAuthSuccess={handleVerification} />
          <WalletConnect onConnect={setBuyerAddress} />
          {isVerified && (
            <div>
              <button onClick={handleTransfer}>Complete Transaction</button>
            </div>
          )}
        </>
      ) : (
        <p>Loading property details...</p>
      )}
    </div>
  );
};

export default PropertyDetail;
