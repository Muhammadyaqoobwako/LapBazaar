import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sell.css'; // Make sure this CSS file exists and contains relevant styles

const Sell = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    price: '',
    condition: 'good',
    processor: '',
    ram: '',
    storage: '',
    screenSize: '',
    graphics: '',
    warranty: '',
    description: '',
    images: [] // Stores File objects
  });
  const [previewImages, setPreviewImages] = useState([]); // Stores URLs for image previews
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const brands = ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Other'];
  const ramOptions = ['4GB', '8GB', '16GB', '32GB', '64GB'];
  const storageOptions = ['128GB SSD', '256GB SSD', '512GB SSD', '1TB HDD', '1TB SSD', '2TB HDD', '2TB SSD'];
  const conditionOptions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Minor wear' },
    { value: 'fair', label: 'Fair - Visible wear' },
    { value: 'poor', label: 'Poor - Needs repair' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    // Get files from input, convert to array, and limit to max 5 images
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData(prev => ({
      ...prev,
      images: files // Store actual File objects in formData
    }));

    // Create object URLs for immediate preview
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index) => {
    // Remove image from formData.images
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));

    // Remove corresponding preview URL
    const newPreviews = [...previewImages];
    const removedUrl = newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
    // Revoke the object URL to free up memory
    if (removedUrl[0]) {
      URL.revokeObjectURL(removedUrl[0]);
    }
  };

  const validateForm = () => {
    // Basic validation for required fields
    if (!formData.brand || !formData.model || !formData.price || !formData.processor ||
        !formData.ram || !formData.storage || formData.images.length === 0) {
      setError('Please fill in all required fields and upload at least one image.');
      return false;
    }
    // Price validation
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price (must be a positive number).');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccess(false); // Clear previous success message

    if (!validateForm()) return; // Stop if validation fails

    // Get auth token from localStorage
    const token = localStorage.getItem('authToken'); // Changed to 'authToken' for consistency
    if (!token) {
      setError('You must be logged in to list a laptop. Redirecting to login...');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setLoading(true); // Start loading state

    // Create FormData object to send mixed data (text + files)
    const formDataToSend = new FormData();
    formDataToSend.append('brand', formData.brand);
    formDataToSend.append('model', formData.model);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('condition', formData.condition);
    formDataToSend.append('processor', formData.processor);
    formDataToSend.append('ram', formData.ram);
    formDataToSend.append('storage', formData.storage);
    formDataToSend.append('screenSize', formData.screenSize);
    formDataToSend.append('graphics', formData.graphics);
    formDataToSend.append('warranty', formData.warranty);
    formDataToSend.append('description', formData.description);

    // Append each image file to the FormData object under the key 'images'
    // The backend's multer setup (e.g., `upload.array('images', 5)`) must match this key
    formData.images.forEach(image => {
      formDataToSend.append('images', image);
    });

    try {
      console.log('Submitting laptop data to:', 'http://localhost:5000/api/v1/laptops');
      console.log('Authorization Token:', token ? 'Present' : 'Missing');
      // For debugging FormData contents (optional, can be noisy):
      // for (let pair of formDataToSend.entries()) {
      //   console.log(pair[0]+ ': ' + pair[1]);
      // }

      const response = await axios.post('http://localhost:5000/api/v1/laptops', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // REMOVED: 'Content-Type': 'multipart/form-data'
          // Axios automatically sets the correct Content-Type (e.g., multipart/form-data with boundary)
          // when you send a FormData object. Manually setting it often causes issues.
        }
      });

      console.log('Laptop listing response:', response.data);

      if (response.data.success) {
        setSuccess(true);
        // Reset form fields after successful submission
        setFormData({
          brand: '', model: '', price: '', condition: 'good', processor: '',
          ram: '', storage: '', screenSize: '', graphics: '', warranty: '',
          description: '', images: []
        });
        setPreviewImages([]); // Clear image previews
        
        // Redirect to marketplace after a short delay
        setTimeout(() => {
          navigate('/marketplace');
        }, 2000);
      } else {
        // Handle backend-specific errors if `success` is false
        setError(response.data.error || 'Failed to list laptop. Please try again.');
      }
    } catch (err) {
      console.error('Error listing laptop:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);

      // Handle different error statuses
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please log in again.');
        localStorage.removeItem('authToken'); // Clear potentially expired/invalid token
        setTimeout(() => navigate('/login'), 1500);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error); // Display specific backend error message
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  return (
    <div className="sell-container">
      <h2>Sell Your Laptop</h2>
      {/* Display error and success messages */}
      {error && <div className="alert error-message">{error}</div>}
      {success && <div className="alert success-message">Laptop listed successfully! Redirecting to marketplace...</div>}

      <form onSubmit={handleSubmit} className="sell-form">
        {/* Brand */}
        <div className="form-group">
          <label>
            Brand*:
            <select name="brand" value={formData.brand} onChange={handleChange} required>
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Model */}
        <div className="form-group">
          <label>
            Model*:
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., MacBook Pro 13"
              required
            />
          </label>
        </div>

        {/* Price */}
        <div className="form-group">
          <label>
            Price* (₹):
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 50000"
              required
            />
          </label>
        </div>

        {/* Condition */}
        <div className="form-group">
          <label>
            Condition:
            <select name="condition" value={formData.condition} onChange={handleChange}>
              {conditionOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Processor */}
        <div className="form-group">
          <label>
            Processor*:
            <input
              type="text"
              name="processor"
              value={formData.processor}
              onChange={handleChange}
              placeholder="e.g., Intel Core i5, AMD Ryzen 7"
              required
            />
          </label>
        </div>

        {/* RAM */}
        <div className="form-group">
          <label>
            RAM*:
            <select name="ram" value={formData.ram} onChange={handleChange} required>
              <option value="">Select RAM</option>
              {ramOptions.map(ram => (
                <option key={ram} value={ram}>{ram}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Storage */}
        <div className="form-group">
          <label>
            Storage*:
            <select name="storage" value={formData.storage} onChange={handleChange} required>
              <option value="">Select Storage</option>
              {storageOptions.map(storage => (
                <option key={storage} value={storage}>{storage}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Screen Size */}
        <div className="form-group">
          <label>
            Screen Size:
            <input
              type="text"
              name="screenSize"
              value={formData.screenSize}
              onChange={handleChange}
              placeholder="e.g., 13.3 inch, 15.6 inch"
            />
          </label>
        </div>

        {/* Graphics */}
        <div className="form-group">
          <label>
            Graphics:
            <input
              type="text"
              name="graphics"
              value={formData.graphics}
              onChange={handleChange}
              placeholder="e.g., Intel UHD, NVIDIA GTX 1650"
            />
          </label>
        </div>

        {/* Warranty */}
        <div className="form-group">
          <label>
            Warranty:
            <input
              type="text"
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              placeholder="e.g., 1 year remaining, No warranty"
            />
          </label>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your laptop's condition, usage, any issues, etc."
            />
          </label>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>
            Upload Images* (Max 5):
            <input
              type="file"
              accept="image/*" // Restrict to image files
              multiple // Allow multiple file selection
              onChange={handleImageChange}
              required // HTML5 validation: requires at least one file
            />
          </label>
        </div>

        {/* Image Previews */}
        {previewImages.length > 0 && (
          <div className="preview-images">
            <h4>Image Preview:</h4>
            <div className="images-grid">
              {previewImages.map((src, idx) => (
                <div key={idx} className="preview-image">
                  <img src={src} alt={`preview-${idx}`} />
                  <button type="button" onClick={() => removeImage(idx)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Listing...' : 'List Laptop'}
        </button>
      </form>
    </div>
  );
};

export default Sell;