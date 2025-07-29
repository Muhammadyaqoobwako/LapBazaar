import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';


const Marketplace = () => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    price: '',
    processor: '',
    ram: '',
    storage: '',
    condition: '',
    description: '',
    screenSize: '',
    graphics: '',
    weight: '',
    batteryLife: '',
  });
  const [images, setImages] = useState([]);

  const API_BASE_URL = 'http://localhost:5000';
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in to upload a laptop.');
      return;
    }

    const form = new FormData();

    for (let key in formData) {
      if (
        key !== 'screenSize' &&
        key !== 'graphics' &&
        key !== 'weight' &&
        key !== 'batteryLife'
      ) {
        form.append(key, formData[key]);
      }
    }

    const specs = {
      screenSize: formData.screenSize,
      graphics: formData.graphics,
      weight: formData.weight,
      batteryLife: formData.batteryLife,
    };
    form.append('specs', JSON.stringify(specs));

    images.forEach((img) => form.append('images', img));

    try {
      await axios.post(`${API_BASE_URL}/api/v1/laptops`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Laptop uploaded!');
      navigate('/order'); // Redirect to Order Page
    } catch (err) {
      console.error('Upload error:', err.response?.data?.error || err.message);
      alert(`Upload failed: ${err.response?.data?.error || 'Server error'}`);
    }
  };

  return (
    <div>
      <h2>Laptop Marketplace</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" required /><br />
        <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" required /><br />
        <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" required /><br />
        <input name="processor" value={formData.processor} onChange={handleChange} placeholder="Processor" required /><br />
        <input name="ram" value={formData.ram} onChange={handleChange} placeholder="RAM" required /><br />
        <input name="storage" value={formData.storage} onChange={handleChange} placeholder="Storage" required /><br />
        
        <select name="condition" value={formData.condition} onChange={handleChange} required>
          <option value="">Select Condition</option>
          <option value="new">New</option>
          <option value="refurbished">Refurbished</option>
          <option value="used">Used</option>
        </select><br />

        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required /><br />

        <h4>Specs</h4>
        <input name="screenSize" value={formData.screenSize} onChange={handleChange} placeholder="Screen Size" /><br />
        <input name="graphics" value={formData.graphics} onChange={handleChange} placeholder="Graphics" /><br />
        <input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight" /><br />
        <input name="batteryLife" value={formData.batteryLife} onChange={handleChange} placeholder="Battery Life" /><br />

        <input type="file" multiple accept="image/*" onChange={handleFileChange} required /><br />

        <button type="submit">Upload Laptop</button>
      </form>
    </div>
  );
};

export default Marketplace;
