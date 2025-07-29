import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UploadedLaptopPage = () => {
  const [laptops, setLaptops] = useState([]);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/display-laptops`);
        setLaptops(response.data.data); // Adjusted to match expected format
      } catch (error) {
        console.error('Failed to fetch laptops:', error);
      }
    };

    fetchLaptops();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Uploaded Laptops</h2>
      {laptops.length === 0 ? (
        <p>No laptops uploaded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {laptops.map((laptop) => (
            <div key={laptop._id} style={{ border: '1px solid #ccc', padding: '1rem', width: '320px' }}>
              {laptop.images && laptop.images.length > 0 && (
                <img
                  src={`${API_BASE_URL}${laptop.images[0]}`}
                  alt={`${laptop.brand} ${laptop.model}`}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                />
              )}
              <h3>{laptop.brand} {laptop.model}</h3>
              <p><strong>Price:</strong> ${laptop.price}</p>
              <p><strong>Processor:</strong> {laptop.processor}</p>
              <p><strong>RAM:</strong> {laptop.ram}</p>
              <p><strong>Storage:</strong> {laptop.storage}</p>
              <p><strong>Condition:</strong> {laptop.condition}</p>
              <p><strong>Description:</strong> {laptop.description}</p>

              {laptop.specs && (
                <div style={{ marginTop: '0.5rem' }}>
                  <h4>Specs</h4>
                  <p><strong>Screen Size:</strong> {laptop.specs.screenSize}</p>
                  <p><strong>Graphics:</strong> {laptop.specs.graphics}</p>
                  <p><strong>Weight:</strong> {laptop.specs.weight}</p>
                  <p><strong>Battery Life:</strong> {laptop.specs.batteryLife}</p>
                </div>
              )}

              <p style={{ fontSize: '0.9rem', color: 'gray' }}>
                Uploaded on: {new Date(laptop.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadedLaptopPage;
