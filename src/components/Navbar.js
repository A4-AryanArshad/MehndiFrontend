import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <a href="#home">
            <img src="/assets/img/favicon.png" alt="Travel Logo" />
            Travel
          </a>
        </div>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <a href="#home" className="nav-link" onClick={() => setIsOpen(false)}>
            Home
          </a>
          <a href="#about" className="nav-link" onClick={() => setIsOpen(false)}>
            About
          </a>
          <a href="#discover" className="nav-link" onClick={() => setIsOpen(false)}>
            Discover
          </a>
          <a href="#experience" className="nav-link" onClick={() => setIsOpen(false)}>
            Experience
          </a>
          <a href="#place" className="nav-link" onClick={() => setIsOpen(false)}>
            Places
          </a>
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
