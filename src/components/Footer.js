import React from 'react';

const Footer = () => {
  return (
    <footer className="footer section">
      <div className="footer__container container grid">
        <div className="footer__content footer__brand">
          <a href="/" className="footer__logo">
            Mehndi Me
          </a>
          <p className="footer__description">
            Connect with talented mehndi artists and discover beautiful designs. Your trusted platform for authentic mehndi experiences.
          </p>
          <div className="footer__contact">
            <p className="footer__email">
              <i className="ri-mail-line"></i>
              <a href="mailto:team.mehndime@gmail.com" className="footer__email-link">team.mehndime@gmail.com</a>
            </p>
          </div>
          <div className="footer__social">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="footer__social-link">
              <i className="ri-instagram-fill"></i>
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="footer__social-link">
              <i className="ri-facebook-fill"></i>
            </a>
            <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" className="footer__social-link">
              <i className="ri-pinterest-fill"></i>
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" className="footer__social-link">
              <i className="ri-youtube-fill"></i>
            </a>
          </div>
        </div>

        <div className="footer__content">
          <h3 className="footer__title">For Mehndi Artists</h3>
          <ul className="footer__list">
            <li><a href="#" className="footer__link">Earn as a Mehndi Artist</a></li>
            <li><a href="#" className="footer__link">Browse Bookings</a></li>
            <li><a href="#" className="footer__link">Artist Dashboard</a></li>
            <li><a href="#" className="footer__link">FAQs for Artists</a></li>
          </ul>
        </div>

        <div className="footer__content">
          <h3 className="footer__title">For Clients</h3>
          <ul className="footer__list">
            <li><a href="#" className="footer__link">Request an Artist</a></li>
            <li><a href="#" className="footer__link">Log In / Sign Up</a></li>
            <li><a href="#" className="footer__link">FAQs for Clients</a></li>
            <li><a href="#" className="footer__link">Blog</a></li>
          </ul>
        </div>

        <div className="footer__content">
          <h3 className="footer__title">Trust & Transparency</h3>
          <ul className="footer__list">
            <li><a href="#" className="footer__link">Privacy Policy</a></li>
            <li><a href="#" className="footer__link">Terms & Conditions</a></li>
            <li><a href="#" className="footer__link">Code of Conduct</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__info container">
        <div className="footer__card">
          <div className="footer__card-box">
            <i className="ri-customer-service-2-line"></i>
            <div>
              <h3 className="footer__card-title">24/7 Support</h3>
              <p className="footer__card-description">Always here to help</p>
            </div>
          </div>
        </div>

        <div className="footer__card">
          <div className="footer__card-box">
            <i className="ri-shield-check-line"></i>
            <div>
              <h3 className="footer__card-title">Verified Artists</h3>
              <p className="footer__card-description">Trusted professionals</p>
            </div>
          </div>
        </div>

        <div className="footer__card">
          <div className="footer__card-box">
            <i className="ri-secure-payment-line"></i>
            <div>
              <h3 className="footer__card-title">Secure Payment</h3>
              <p className="footer__card-description">Safe transactions</p>
            </div>
          </div>
        </div>

        <div className="footer__card">
          <div className="footer__card-box">
            <i className="ri-medal-line"></i>
            <div>
              <h3 className="footer__card-title">Quality Guarantee</h3>
              <p className="footer__card-description">100% satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom container">
        <div className="footer__legal">
          <div className="footer__copy">
            <p>&copy; 2024 Mehndi Me. All rights reserved</p>
          </div>
          <div className="footer__terms">
            <a href="#" className="footer__terms-link">Privacy Policy</a>
            <a href="#" className="footer__terms-link">Terms of Service</a>
            <a href="#" className="footer__terms-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 