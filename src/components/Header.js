import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    console.log('Hamburger clicked! Current state:', isMenuOpen, 'New state:', !isMenuOpen);
    
    if (!isMenuOpen) {
      // First show the henna pattern animation
      setIsMenuOpen(true); // This triggers the henna pattern
      
      // Then open the overlay menu after the henna animation completes (1.2 seconds)
      setTimeout(() => {
        const overlay = document.querySelector('.nav__overlay');
        if (overlay) {
          overlay.classList.add('nav__overlay--active');
        }
        document.body.style.overflow = 'hidden';
      }, 1200);
    } else {
      // Close the menu smoothly
      const overlay = document.querySelector('.nav__overlay');
      if (overlay) {
        overlay.classList.remove('nav__overlay--active');
      }
      
      // Wait for overlay to close, then reset henna pattern
      setTimeout(() => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
      }, 600); // Wait for overlay transition to complete
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle('dark-theme');
  };

  const closeMenu = () => {
    console.log('Closing menu...');
    // Close the overlay first
    const overlay = document.querySelector('.nav__overlay');
    if (overlay) {
      overlay.classList.remove('nav__overlay--active');
    }
    
    // Wait for overlay to close, then reset henna pattern
    setTimeout(() => {
      setIsMenuOpen(false);
      document.body.style.overflow = 'auto';
    }, 600);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    closeMenu();
    
    // Wait for menu to close before scrolling
    setTimeout(() => {
      const target = document.querySelector(targetId);
      if (target) {
        const headerHeight = 80; // Account for fixed header
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }, 700);
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scroll-header' : ''}`} id="header">
        <nav className="nav container">
          {/* Left: Hamburger Menu */}
          <div className="nav__toggle" id="nav-toggle" onClick={toggleMenu}>
            <div className={`henna-burger ${isMenuOpen ? 'active' : ''}`}>
              <div className="henna-line henna-line-1"></div>
              <div className="henna-line henna-line-2"></div>
              <div className="henna-line henna-line-3"></div>
              <div className="henna-pattern">
                <div className="henna-dot henna-dot-1"></div>
                <div className="henna-dot henna-dot-2"></div>
                <div className="henna-dot henna-dot-3"></div>
                <div className="henna-curve henna-curve-1"></div>
                <div className="henna-curve henna-curve-2"></div>
                <div className="henna-leaf henna-leaf-1"></div>
                <div className="henna-leaf henna-leaf-2"></div>
              </div>
            </div>
          </div>

          {/* Center: Logo */}
          <a href="#home" className="nav__logo" onClick={(e) => handleNavClick(e, '#home')}>Mehndi Me</a>

          {/* Right: Get Started Button */}
          <Link to="/choose-path" className="nav__cta-button">Get Started</Link>
        </nav>
      </header>

      {/* Full Screen Overlay Menu */}
      <div className="nav__overlay">
        <div className="nav__overlay-content">
          <div className="nav__overlay-header">
            <div className="nav__overlay-logo">Mehndi Me</div>
            <div className="nav__overlay-close" onClick={closeMenu}>
              <div className={`henna-close ${isMenuOpen ? 'active' : ''}`}>
                <div className="henna-close-line henna-close-line-1"></div>
                <div className="henna-close-line henna-close-line-2"></div>
              </div>
            </div>
          </div>
          
          <nav className="nav__overlay-menu">
            <ul className="nav__overlay-list">
              <li className="nav__overlay-item">
                <a href="#home" className="nav__overlay-link" onClick={(e) => handleNavClick(e, '#home')}>
                  <span className="nav__overlay-number">01</span>
                  <span className="nav__overlay-text">Home</span>
                </a>
              </li>
              <li className="nav__overlay-item">
                <a href="#how-it-works" className="nav__overlay-link" onClick={(e) => handleNavClick(e, '#how-it-works')}>
                  <span className="nav__overlay-number">02</span>
                  <span className="nav__overlay-text">How It Works</span>
                </a>
              </li>
              <li className="nav__overlay-item">
                <a href="#about" className="nav__overlay-link" onClick={(e) => handleNavClick(e, '#about')}>
                  <span className="nav__overlay-number">03</span>
                  <span className="nav__overlay-text">About</span>
                </a>
              </li>
              <li className="nav__overlay-item">
                <a href="#discover" className="nav__overlay-link" onClick={(e) => handleNavClick(e, '#discover')}>
                  <span className="nav__overlay-number">04</span>
                  <span className="nav__overlay-text">Discover</span>
                </a>
              </li>
              <li className="nav__overlay-item">
                <a href="#experience" className="nav__overlay-link" onClick={(e) => handleNavClick(e, '#experience')}>
                  <span className="nav__overlay-number">05</span>
                  <span className="nav__overlay-text">Experience</span>
                </a>
              </li>
              <li className="nav__overlay-item">
                <a href="#subscribe" className="nav__overlay-link" onClick={(e) => handleNavClick(e, '#subscribe')}>
                  <span className="nav__overlay-number">06</span>
                  <span className="nav__overlay-text">Subscribe</span>
                </a>
              </li>
              <li className="nav__overlay-item">
                <Link to="/booking" className="nav__overlay-link" onClick={closeMenu}>
                  <span className="nav__overlay-number">07</span>
                  <span className="nav__overlay-text">Book Now</span>
                </Link>
              </li>
              
            </ul>
          </nav>

          <div className="nav__overlay-footer">
            <div className="nav__overlay-theme">
              <span className="nav__overlay-theme-text">Dark mode</span>
              <div className="nav__overlay-theme-toggle" onClick={toggleTheme}>
                <i className="ri-moon-line"></i>
              </div>
            </div>
            
            <div className="nav__overlay-cta">
              <button className="nav__overlay-button">Get Started</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 