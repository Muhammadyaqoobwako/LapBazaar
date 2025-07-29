import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import trustedDealersImg from '../assets/trusted-dealers.png';
import homeServiceImg from '../assets/home-service.png';
import replacementPartsImg from '../assets/replacement-parts.png';
import secureSellingImg from '../assets/secure-selling.png';

const Home = () => {
  const features = [
    {
      title: "Trusted Dealers",
      img: trustedDealersImg,
      description: "Verified sellers with quality products"
    },
    {
      title: "Home Service",
      img: homeServiceImg,
      description: "Expert technicians at your doorstep"
    },
    {
      title: "Replacement Parts",
      img: replacementPartsImg,
      description: "Genuine parts with warranty"
    },
    {
      title: "Sell Safely & Securely",
      img: secureSellingImg,
      description: "Protected transactions and verified buyers"
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <h1 id="hero-heading" className="hero-title">
            Sell, Buy, or Repair Your<br />
            Laptop — All in One Place!
          </h1>
          <div className="hero-buttons">
            <Link to="/marketplace" className="btn btn-primary">Explore Marketplace</Link>
            <Link to="/repair" className="btn btn-outline">Request Repair</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" className="section-title">Why Choose LapBazaar?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <article key={index} className="feature-card">
                <div className="feature-img-container">
                  <img 
                    src={feature.img} 
                    alt={feature.title} 
                    loading="lazy"
                    className="feature-img"
                    width="80"
                    height="80"
                  />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading" className="section-title">Ready to Get Started?</h2>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary">Create Account</Link>
            <Link to="/marketplace" className="btn btn-outline">Browse Listings</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
