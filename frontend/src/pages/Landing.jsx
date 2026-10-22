import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: '📷',
      title: 'AI Food Scanner',
      desc: 'Point your camera or upload any food image. Our advanced vision model instantly identifies items, portions, and computes macros.',
    },
    {
      icon: '📊',
      title: 'Precision Nutrition Tracking',
      desc: 'Accurately track your daily calories, protein, carbohydrates, fat, and hydration with evidence-based Mifflin-St Jeor targets.',
    },
    {
      icon: '💬',
      title: 'Intelligent AI Coach',
      desc: 'Get instantaneous, tailored dietary answers, healthy ingredient swaps, and actionable nutrition advice directly from your personal coach.',
    },
    {
      icon: '📈',
      title: 'Progress & Body Metrics',
      desc: 'Visualize your weight trajectory, BMI shifts, and historical trends over time with clean interactive analytical charts.',
    },
  ];

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-logo-badge">OK</div>
          <span className="landing-brand-title">
            OK<span>FIT</span>
          </span>
        </div>

        <nav className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-glow-blob" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse" />
            Next-Gen AI Vision Nutrition
          </div>

          <h1 className="hero-heading">
            Know What You Eat.
            <span className="hero-gradient-text"> Fuel Your Ambition.</span>
          </h1>

          <p className="hero-subheading">
            Instant food recognition, automated macro estimation, and smart calorie
            tracking. Snap a photo of your meal and let OKfit calculate the nutrition in seconds.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <span className="btn-arrow">→</span>
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Existing Member? Log In
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-stats-bar">
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Food Accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">&lt; 1.5s</span>
              <span className="stat-label">Scan Speed</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Science-Backed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="landing-features">
        <div className="features-header">
          <span className="section-eyebrow">Features</span>
          <h2 className="section-title">Engineered For Peak Performance</h2>
          <p className="section-subtitle">
            Everything you need to master your diet without tedious manual logging.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">{feat.icon}</div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-card">
          <h2>Ready to transform your relationship with food?</h2>
          <p>Join thousands of athletes and fitness enthusiasts who track with OKfit today.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="landing-brand">
              <span className="landing-brand-title">
                OK<span>FIT</span>
              </span>
            </div>
            <p className="footer-copy">
              © {new Date().getFullYear()} OKfit. All rights reserved. Nutrition targets use the
              Mifflin-St Jeor formula and are estimates for reference only.
            </p>
          </div>
          <div className="footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <a href="#features">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
