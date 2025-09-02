import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import { FiUsers } from 'react-icons/fi';
import { LuPalette } from 'react-icons/lu';

const ChoosePathForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleClientContinue = () => {
    const target = '/dashboard';
    if (isAuthenticated) {
      navigate(target);
    } else {
      localStorage.setItem('intendedPath', target);
      localStorage.setItem('selectedUserType', 'client');
      navigate('/login');
    }
  };

  const handleArtistContinue = () => {
    const target = '/artist-dashboard';
    if (isAuthenticated) {
      navigate(target);
    } else {
      localStorage.setItem('intendedPath', target);
      localStorage.setItem('selectedUserType', 'artist');
      navigate('/login');
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.panel}> 
          <div style={styles.content}>
            {/* Header Section */}
            <div style={styles.header}>
              <p style={styles.getStarted}>GET STARTED</p>
              <h1 style={styles.mainTitle}>Choose your path</h1>
            </div>

            {/* Cards Section */}
            <div style={styles.cardsContainer}>
              {/* Client Card */}
              <div style={styles.card}>
                <div style={styles.iconContainer}>
                  <FiUsers size={60} color="#DC7828" />
                </div>
                <h2 style={styles.cardTitle}>For Clients</h2>
                <p style={styles.cardDescription}>
                  Post a request, compare offers, and book with confidence.
                </p>
                <button style={styles.continueButton} onClick={handleClientContinue}>
                  Continue
                </button>
              </div>

              {/* Artist Card */}
              <div style={styles.card}>
                <div style={styles.iconContainer}>
                  <LuPalette size={60} color="#DC7828" />
                </div>
                <h2 style={styles.cardTitle}>For Artists</h2>
                <p style={styles.cardDescription}>
                  Create a profile, apply to bookings, and get paid securely.
                </p>
                <button style={styles.continueButton} onClick={handleArtistContinue}>
                  Continue
                </button>
              </div>
            </div>

            {/* Footer */}
            {!isAuthenticated && (
              <div style={styles.footer}>
                <p style={styles.footerText}>
                  Already have an account? <Link to="/login" style={styles.loginLink}>Log in</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8E1B8 0%, #F0CFA1 50%, #EBC792 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  panel: {
    width: '100%',
    maxWidth: '1200px',
    backgroundColor: '#F9F3EA',
    borderRadius: '28px',
    border: '1px solid #E9DBC7',
    boxShadow: '0 8px 30px rgba(0,0,0,0.06) inset, 0 4px 22px rgba(0,0,0,0.04)',
    padding: '40px 24px',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'center',
  },
  header: {
    marginBottom: '48px',
  },
  getStarted: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#8A7767',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 16px 0',
  },
  mainTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#46321E',
    margin: '0',
    lineHeight: '1.2',
  },
  cardsContainer: {
    display: 'flex',
    gap: '32px',
    justifyContent: 'center',
    marginBottom: '48px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px 30px',
    border: '1px solid #EADFCC',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
    flex: '1',
    minWidth: '320px',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#46321E',
    margin: '0 0 16px 0',
  },
  cardDescription: {
    fontSize: '18px',
    color: '#6B5B4E',
    lineHeight: '1.6',
    margin: '0 0 28px 0',
    maxWidth: '520px',
  },
  continueButton: {
    backgroundColor: '#F08228',
    color: 'white',
    border: 'none',
    borderRadius: '28px',
    padding: '16px 44px',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: '0 6px 18px rgba(240, 130, 40, 0.28)',
  },
  footer: {
    marginTop: '16px',
  },
  footerText: {
    fontSize: '16px',
    color: '#6B5B4E',
    margin: '0',
  },
  loginLink: {
    color: '#DC7828',
    textDecoration: 'none',
    fontWeight: '700',
  },
};

export default ChoosePathForm;
