import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Clock } from 'react-feather';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (err) {
      setError('There was an error submitting your message. Please try again later.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact LapBazaar</h1>
        <p>We're here to help with any questions about our services</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <Mail size={24} />
            </div>
            <div className="info-details">
              <h3>Email Us</h3>
              <p>support@lapbazaar.pk</p>
              <p>sales@lapbazaar.pk</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <Phone size={24} />
            </div>
            <div className="info-details">
              <h3>Call Us</h3>
              <p>+92-300-1234567</p>
              <p>+92-21-9876543</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <MessageSquare size={24} />
            </div>
            <div className="info-details">
              <h3>Live Chat</h3>
              <p>Available 10AM - 8PM PKT</p>
              <button className="chat-button">Start Chat</button>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <MapPin size={24} />
            </div>
            <div className="info-details">
              <h3>Visit Us</h3>
              <p>123 Tech Street, Karachi</p>
              <p>Sindh, Pakistan</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <Clock size={24} />
            </div>
            <div className="info-details">
              <h3>Working Hours</h3>
              <p>Monday - Saturday: 10AM - 8PM</p>
              <p>Sunday: 12PM - 5PM</p>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>
          {submitted ? (
            <div className="success-message">
              <h3>Thank you for contacting us!</h3>
              <p>We've received your message and will get back to you within 24 hours.</p>
              <button 
                className="submit-another"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Your Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="repair">Repair Service</option>
                  <option value="feedback">Feedback/Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message*</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="contact-map">
        <iframe
          title="LapBazaar Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.489712934816!2d67.0282763150027!3d24.85372298405991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e5b3b3f3a3d%3A0x9e8e8c8c8c8c8c8c!2sTech%20Street%2C%20Karachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;