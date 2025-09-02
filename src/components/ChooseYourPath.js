import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const ChooseYourPath = () => {
  const { isAuthenticated } = useAuth();

  const handleClientContinue = () => {
    // Navigate to signup page (could be expanded to go directly to client signup)
    console.log('Client path selected');
  };

  const handleArtistContinue = () => {
    // Navigate to signup page (could be expanded to go directly to artist signup)
    console.log('Artist path selected');
  };

  return (
    <>
      <Header />
      <div className="choose-path">
        <div className="choose-path__container">
        <div className="choose-path__header">
          <p className="choose-path__subtitle">GET STARTED</p>
          <h1 className="choose-path__title">Choose your path</h1>
        </div>

        <div className="choose-path__cards">
          <div className="choose-path__card">
            <div className="choose-path__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11l-3 3-3-3"/>
              </svg>
            </div>
            <h2 className="choose-path__card-title">For Clients</h2>
            <p className="choose-path__card-description">
              Post a request, compare offers, and book with confidence.
            </p>
            <Link 
              to="/choose-path"
              className="choose-path__card-button"
              onClick={handleClientContinue}
            >
              Continue
            </Link>
          </div>

          <div className="choose-path__card">
            <div className="choose-path__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2L20 7.5L7 20.5L2 22L3.5 17L16.5 4Z"/>
                <path d="M8.5 17.5L15.5 10.5"/>
                <circle cx="18" cy="6" r="2"/>
              </svg>
            </div>
            <h2 className="choose-path__card-title">For Artists</h2>
            <p className="choose-path__card-description">
              Create a profile, apply to bookings, and get paid securely.
            </p>
            <Link 
              to="/choose-path"
              className="choose-path__card-button"
              onClick={handleArtistContinue}
            >
              Continue
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="choose-path__footer">
            <p className="choose-path__login-text">
              Already have an account? <Link to="/login" className="choose-path__login-link">Log in</Link>
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default ChooseYourPath;
