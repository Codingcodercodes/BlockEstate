import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Property {
  id: number;
  name: string;
  // Add more fields as needed
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/properties`);

        // Ensure the data is an array, else default to empty array
        const data = Array.isArray(response.data) ? response.data : [];

        setProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Available Properties</h2>
      {properties.length === 0 ? (
        <p>No properties available.</p>
      ) : (
        <ul>
          {properties.map((property) => (
            <li key={property.id}>
              <Link to={`/property/${property.id}`}>{property.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PropertyList;
