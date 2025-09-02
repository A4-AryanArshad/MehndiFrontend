import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import apiService from '../services/api';

const { jobsAPI, proposalsAPI } = apiService;

const ClientDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userName = user ? user.firstName : 'Client';
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('visa-1234');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, wallet, reviews, messages
  const [showProposalsView, setShowProposalsView] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [proposalsFilter, setProposalsFilter] = useState('active'); // all, active, completed
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  });
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Real proposals data from backend
  const [realProposals, setRealProposals] = useState([]);
  const [clientJobs, setClientJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState('');
  
  // Mock data - this would come from API calls
  const [nextEvent] = useState({
    title: 'Bridal Mehndi',
    date: 'Oct 10, 2025',
    time: '3:00 PM',
    daysLeft: 20,
    location: '123 Celebration Hall, Downtown City',
    artist: 'Zara Henna Arts',
    depositPaid: true,
    finalPaymentDue: 'in 14 days',
    allSet: true
  });

  const [upcomingBookings] = useState([
    {
      id: 1,
      title: 'Eid Mehndi',
      artist: 'Henna by Sana',
      date: 'Sep 15, 2025',
      time: '6:00 PM',
      daysLeft: 25,
      depositSecured: true,
      finalPaymentDue: 'Sep 1, 2025',
      status: 'confirmed'
    }
  ]);

  // Mock data for completed bookings
  const [completedBookings] = useState([
    {
      id: 1,
      title: 'Wedding Mehndi',
      artist: 'Zara Henna Arts',
      date: 'March 15, 2024',
      time: '2:00 PM',
      price: '£450',
      hasReview: false,
      artistImage: 'https://via.placeholder.com/60x60'
    },
    {
      id: 2,
      title: 'Birthday Party Mehndi',
      artist: 'Artistic Henna',
      date: 'February 10, 2024',
      time: '4:00 PM',
      price: '£280',
      hasReview: true,
      rating: 5,
      artistImage: 'https://via.placeholder.com/60x60'
    },
    {
      id: 3,
      title: 'Festival Celebration',
      artist: 'Mehndi Magic',
      date: 'January 20, 2024',
      time: '6:00 PM',
      price: '£320',
      hasReview: false,
      artistImage: 'https://via.placeholder.com/60x60'
    }
  ]);

  // Mock data for conversations
  const [conversations] = useState([
    {
      id: 1,
      artistName: 'Zara Henna Arts',
      artistImage: 'https://via.placeholder.com/50x50',
      lastMessage: 'Thank you for choosing me! I\'m excited to work with you.',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      status: 'online',
      messages: [
        {
          id: 1,
          senderId: 'artist',
          senderName: 'Zara Henna Arts',
          message: 'Hi! I received your booking request for the bridal mehndi.',
          timestamp: '2024-03-15 09:15 AM',
          type: 'text'
        },
        {
          id: 2,
          senderId: 'user',
          senderName: 'Aisha',
          message: 'Hello! Yes, I\'m excited to work with you. Can we discuss the design details?',
          timestamp: '2024-03-15 09:20 AM',
          type: 'text'
        },
        {
          id: 3,
          senderId: 'artist',
          senderName: 'Zara Henna Arts',
          message: 'Absolutely! I have some amazing bridal designs. Would you prefer traditional or modern fusion?',
          timestamp: '2024-03-15 09:25 AM',
          type: 'text'
        },
        {
          id: 4,
          senderId: 'artist',
          senderName: 'Zara Henna Arts',
          message: 'Thank you for choosing me! I\'m excited to work with you.',
          timestamp: '2024-03-15 10:30 AM',
          type: 'text'
        }
      ]
    },
    {
      id: 2,
      artistName: 'Henna by Aisha',
      artistImage: 'https://via.placeholder.com/50x50',
      lastMessage: 'I can adjust the design as per your preference.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      status: 'offline',
      messages: [
        {
          id: 1,
          senderId: 'user',
          senderName: 'Aisha',
          message: 'Hi, I saw your portfolio and loved your work!',
          timestamp: '2024-03-14 02:00 PM',
          type: 'text'
        },
        {
          id: 2,
          senderId: 'artist',
          senderName: 'Henna by Aisha',
          message: 'Thank you so much! I\'d love to work with you. What kind of event is this for?',
          timestamp: '2024-03-14 02:15 PM',
          type: 'text'
        },
        {
          id: 3,
          senderId: 'user',
          senderName: 'Aisha',
          message: 'It\'s for an Eid celebration. I need something elegant but not too heavy.',
          timestamp: '2024-03-14 02:20 PM',
          type: 'text'
        },
        {
          id: 4,
          senderId: 'artist',
          senderName: 'Henna by Aisha',
          message: 'I can adjust the design as per your preference.',
          timestamp: '2024-03-14 02:25 PM',
          type: 'text'
        }
      ]
    },
    {
      id: 3,
      artistName: 'Mehndi Magic',
      artistImage: 'https://via.placeholder.com/50x50',
      lastMessage: 'Let me know if you have any questions!',
      lastMessageTime: '2 days ago',
      unreadCount: 1,
      status: 'away',
      messages: [
        {
          id: 1,
          senderId: 'artist',
          senderName: 'Mehndi Magic',
          message: 'Hello! I saw your inquiry about festival mehndi designs.',
          timestamp: '2024-03-13 11:00 AM',
          type: 'text'
        },
        {
          id: 2,
          senderId: 'artist',
          senderName: 'Mehndi Magic',
          message: 'Let me know if you have any questions!',
          timestamp: '2024-03-13 11:05 AM',
          type: 'text'
        }
      ]
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: 'applications',
      message: '3 artists have applied to your request — check them out!',
      icon: '🎨'
    },
    {
      id: 2,
      type: 'reminder',
      message: 'Your booking is tomorrow at 4 PM — don\'t forget to confirm details',
      icon: '⏰',
      color: 'orange'
    },
    {
      id: 3,
      type: 'payment',
      message: 'Final 50% payment due in 14 days — complete to secure your event',
      icon: '💰',
      color: 'red'
    },
    {
      id: 4,
      type: 'reminder',
      message: 'Reminder: 7 days left to complete your final payment',
      icon: '📅',
      color: 'blue'
    }
  ]);





  // Fetch client's jobs
  const fetchClientJobs = useCallback(async () => {
    if (!isAuthenticated || !user || user.userType !== 'client') {
      console.log('Skipping job fetch - user not authenticated or not a client:', { isAuthenticated, userType: user?.userType });
      return;
    }

    try {
      setJobsLoading(true);
      console.log('=== FETCHING CLIENT JOBS ===');
      console.log('User:', { id: user._id, userType: user.userType, name: `${user.firstName} ${user.lastName}` });
      
      const response = await jobsAPI.getMyJobs();
      console.log('getMyJobs API response:', response);
      
      if (response.success && response.data) {
        console.log('Setting client jobs:', response.data.length, 'jobs found');
        console.log('Job titles:', response.data.map(job => job.title));
        setClientJobs(response.data);
      } else {
        console.log('No jobs data or unsuccessful response:', response);
        setClientJobs([]);
      }
    } catch (error) {
      console.error('Error fetching client jobs:', error);
      console.error('Error details:', error.message, error.stack);
    } finally {
      setJobsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch proposals for a specific job
  const fetchJobProposals = useCallback(async (jobId) => {
    try {
      console.log('Fetching proposals for job:', jobId);
      const response = await proposalsAPI.getJobProposals(jobId);
      
      if (response.success && response.data) {
        console.log('Proposals fetched for job:', jobId, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching job proposals:', error);
      return [];
    }
  }, []);

  // Fetch all proposals for all client jobs
  const fetchAllProposals = useCallback(async () => {
    if (!clientJobs.length) {
      return;
    }

    try {
      setProposalsLoading(true);
      setProposalsError('');
      
      const allProposals = [];
      
      for (const job of clientJobs) {
        const jobProposals = await fetchJobProposals(job._id);
        
        // Transform proposals for display
        const transformedProposals = jobProposals.map(proposal => ({
          id: proposal._id,
          jobId: job._id,
          jobTitle: job.title,
          artistName: proposal.artist ? `${proposal.artist.firstName} ${proposal.artist.lastName}` : 'Artist',
          artistId: proposal.artist?._id,
          price: `£${proposal.pricing?.totalPrice || 0}`,
          duration: `${proposal.timeline?.estimatedDuration?.value || 0} ${proposal.timeline?.estimatedDuration?.unit || 'hours'}`,
          proposal: proposal.message || '',
          experience: proposal.experience?.relevantExperience || '',
          status: proposal.status || 'pending',
          submittedAt: proposal.submittedAt,
          rawData: proposal
        }));
        
        allProposals.push(...transformedProposals);
      }
      
      setRealProposals(allProposals);
      console.log('All proposals fetched:', allProposals);
      
    } catch (error) {
      console.error('Error fetching all proposals:', error);
      setProposalsError('Failed to load proposals');
    } finally {
      setProposalsLoading(false);
    }
  }, [clientJobs, fetchJobProposals]);

  // Accept a proposal
  const acceptProposal = async (proposalId) => {
    try {
      console.log('Accepting proposal:', proposalId);
      const response = await proposalsAPI.acceptProposal(proposalId);
      
      if (response.success) {
        alert('Proposal accepted successfully!');
        // Refresh proposals
        fetchAllProposals();
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal: ' + error.message);
    }
  };

  // Reject a proposal
  const rejectProposal = async (proposalId, message = '') => {
    try {
      console.log('Rejecting proposal:', proposalId);
      const response = await proposalsAPI.rejectProposal(proposalId, message);
      
      if (response.success) {
        alert('Proposal rejected');
        // Refresh proposals
        fetchAllProposals();
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal: ' + error.message);
    }
  };

  // Fetch data when component mounts and when page becomes visible
  useEffect(() => {
    if (isAuthenticated && user && user.userType === 'client') {
      fetchClientJobs();
    }
  }, [isAuthenticated, user, fetchClientJobs]);

  // Refresh data when the page becomes visible (user returns from job creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user && user.userType === 'client') {
        console.log('Page became visible, refreshing client jobs...');
        fetchClientJobs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user, fetchClientJobs]);

  // Fetch proposals when jobs are loaded
  useEffect(() => {
    if (clientJobs.length > 0) {
      fetchAllProposals();
    }
  }, [clientJobs, fetchAllProposals]);

  const handlePayRemaining = () => {
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleConfirmPayment = () => {
    console.log('Payment confirmed with method:', selectedPaymentMethod);
    // Handle payment processing
    setShowPaymentModal(false);
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewProposals = (requestId) => {
    setSelectedRequestId(requestId);
    setShowProposalsView(true);
  };

  // Navigate to job details page
  const handleJobClick = (jobId) => {
    window.open(`/job/${jobId}`,'_blank');
  };

  const handleBackToRequests = () => {
    setShowProposalsView(false);
    setSelectedRequestId(null);
  };

  const handleFilterChange = (filter) => {
    setProposalsFilter(filter);
  };

  const handleWriteReview = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setReviewData({
      rating: 0,
      title: '',
      comment: '',
      images: []
    });
  };

  const handleRatingChange = (rating) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (field, value) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setReviewData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...imageUrls].slice(0, 5) // Max 5 images
    }));
  };

  const handleRemoveImage = (index) => {
    setReviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', reviewData, 'for booking:', selectedBooking);
    // Here you would send the review to your backend
    handleCloseReviewModal();
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read
    console.log('Selected conversation:', conversation.artistName);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message = {
        id: selectedConversation.messages.length + 1,
        senderId: 'user',
        senderName: userName,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleString(),
        type: 'text'
      };
      
      // Add message to conversation (in real app, this would update state properly)
      console.log('Sending message:', message);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Client dashboard</h1>
          <p className="dashboard-subtitle">Dashboard landing page</p>
          
          {/* Traffic Light System */}
          <div className="traffic-light-info">
            <p className="traffic-light-description">The dashboard notifications should use a traffic-light system:</p>
            <ul className="traffic-light-list">
              <li><span className="dot green"></span> Green → Deposit secured / booking confirmed</li>
              <li><span className="dot blue"></span> Blue/Orange → Upcoming reminders and pending payments</li>
              <li><span className="dot red"></span> Red → Urgent / overdue payment alerts</li>
            </ul>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="welcome-section">
                <h2 className="welcome-message">
                  Hi {userName} 👋, your bridal mehndi is coming up soon!
                </h2>
                
                {/* Next Event Card */}
                <div className="next-event-card">
                  <div className="event-header">
                    <span className="event-icon">📅</span>
                    <h3>Next Event: {nextEvent.title} – {nextEvent.date}</h3>
                  </div>
                  
                  <div className="event-details">
                    <div className="event-left">
                      <p><strong>Date & Time:</strong> {nextEvent.date} · {nextEvent.time}</p>
                      <p className="event-countdown">⏰ Event in {nextEvent.daysLeft} days</p>
                      <p><strong>Location:</strong> {nextEvent.location}</p>
                      <p><strong>Artist:</strong> {nextEvent.artist}</p>
                    </div>
                    
                    <div className="event-right">
                      <div className="status-badge deposit-paid">
                        📋 Deposit Paid
                      </div>
                      <div className="payment-progress">
                        <div className="progress-bar">
                          <div className="progress-fill"></div>
                        </div>
                        <p className="payment-text">Final 50% Payment Due {nextEvent.finalPaymentDue}</p>
                      </div>
                      <p className="all-set">You're all set 🎉</p>
                    </div>
                  </div>
                  
                  <button className="view-booking-btn">View Full Booking</button>
                </div>
              </div>

              <div className="dashboard-main">
                {/* Left Column - Bookings */}
                <div className="bookings-section">
                  <h3 className="section-title">📅 Upcoming & Confirmed Bookings</h3>
                  
                  {upcomingBookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-info">
                        <h4 className="booking-title">{booking.title}</h4>
                        <p className="booking-artist">With {booking.artist}</p>
                        <p className="booking-date">{booking.date} · {booking.time}</p>
                        <span className="days-left-badge">{booking.daysLeft} days left</span>
                      </div>
                      
                      <div className="booking-actions">
                        <button className="reschedule-btn">Reschedule</button>
                        <button className="message-btn">Message</button>
                      </div>
                      
                      <div className="payment-status">
                        <div className="payment-item">
                          <span className="payment-icon deposit">📋</span>
                          <span>Deposit Secured</span>
                        </div>
                        <div className="payment-item">
                          <span className="payment-icon warning">⚠️</span>
                          <span>Final 50% due {booking.finalPaymentDue}</span>
                        </div>
                        <button className="pay-remaining-btn" onClick={handlePayRemaining}>Pay Remaining</button>
                      </div>
                      
                      <p className="final-payment-note">Final payment scheduled — due soon ⏳</p>
                    </div>
                  ))}

                  {/* Post New Request Section */}
                  <div className="no-more-bookings">
                    <div className="plus-icon">+</div>
                    <p>No more upcoming bookings</p>
                    <div className="action-buttons">
                      <Link to="/booking" className="post-new-request-btn">
                        Post a New Request
                      </Link>
                
                    </div>
                  </div>
                </div>

                {/* Right Column - Notifications */}
                <div className="notifications-section">
                  <h3 className="section-title">🔔 Notifications</h3>
                  
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.color || 'default'}`}>
                        <span className="notification-icon">{notification.icon}</span>
                        <p className="notification-text">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* My Requests Section */}
              {!showProposalsView ? (
                <div className="requests-section">
                  <h3 className="section-title">Recent Proposals Received</h3>
              
              {/* Quick Proposals Summary */}
              <div className="proposals-summary" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>📩 {realProposals.length} Total Proposals</h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      {realProposals.filter(p => p.status === 'pending').length} Pending • 
                      {realProposals.filter(p => p.status === 'accepted').length} Accepted • 
                      {realProposals.filter(p => p.status === 'rejected').length} Rejected
                    </p>
                  </div>
                  <button 
                    onClick={() => window.open('/proposals','_blank')}
                    onAuxClick={(e) => { if (e.button===1) window.open('/proposals','_blank'); }}
                    style={{ 
                      background: '#d4a574', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    View All Proposals
                  </button>
                </div>
              </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>My Posted Jobs</h3>
                <button 
                  onClick={() => {
                    console.log('Manual refresh jobs clicked');
                    fetchClientJobs();
                  }}
                  style={{
                    background: '#d4a574',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔄 Refresh Jobs
                </button>
              </div>
              
              {/* Real Client Jobs */}
              {jobsLoading ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner" style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '4px solid #f3f3f3', 
                    borderTop: '4px solid #d4a574', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                  }}></div>
                  <p>Loading your jobs...</p>
                </div>
              ) : clientJobs.length > 0 ? (
                <div className="client-jobs-list">
                  {clientJobs.map(job => (
                    <div 
                      key={job._id} 
                      className="client-job-card clickable-job-card" 
                      onClick={() => handleJobClick(job._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="job-card-header">
                        <div className="request-info">
                          <h4 className="job-card-title">{job.title}</h4>
                          <div className="job-card-meta">
                            <span className="request-date">
                              📅 {job.eventDetails?.eventDate ? new Date(job.eventDetails.eventDate).toLocaleDateString('en-GB') : 'Date TBD'}
                            </span>
                            <span className="request-location">
                              📍 {job.location?.city || 'Location not specified'}
                            </span>
                            <span className="request-budget">
                              💰 £{job.budget?.min || 0}-{job.budget?.max || 0}
                            </span>
                          </div>
                          <p className="request-description">{job.description}</p>
                          <div className="click-hint">
                            👁️ Click to view full details and proposals
                          </div>
                        </div>
                        <div className="job-card-actions">
                          <span className={`status-badge ${job.status}`}>
                            {job.status || 'open'}
                          </span>
                          <div className="job-proposals-info">
                            <p className="proposals-count">
                              {realProposals.filter(p => p.jobId === job._id).length} proposals
                            </p>
                            <button 
                              className="view-proposals-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/job/${job._id}`,'_blank');
                              }}
                            >
                              View Proposals
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Job Details */}
                      <div className="job-additional-info">
                        <div className="job-info-grid">
                          <div className="job-info-item">
                            <span className="job-info-label">Event Type:</span>
                            <span className="job-info-value">{job.eventDetails?.eventType || 'Not specified'}</span>
                          </div>
                          <div className="job-info-item">
                            <span className="job-info-label">Guest Count:</span>
                            <span className="job-info-value">{job.eventDetails?.guestCount || 'Not specified'}</span>
                          </div>
                          <div className="job-info-item">
                            <span className="job-info-label">Duration:</span>
                            <span className="job-info-value">{job.eventDetails?.duration?.estimated || 'Not specified'} hours</span>
                          </div>
                          <div className="job-info-item">
                            <span className="job-info-label">Posted:</span>
                            <span className="job-info-value">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-GB') : 'Unknown'}</span>
                          </div>
                        </div>
                        {job.requirements?.designStyle && (
                          <div className="job-requirements-info">
                            <span className="job-info-label">Required Style:</span>
                            <span className="job-info-value">{job.requirements.designStyle.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-jobs-state" style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No jobs found</h3>
                  <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                    {isAuthenticated && user ? 
                      `User: ${user.firstName} ${user.lastName} (${user.userType})` :
                      'Please check authentication status'
                    }
                  </p>
                  <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                    Check the browser console (F12) and backend logs for debugging information.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => {
                        console.log('Debug refresh clicked');
                        console.log('User state:', { isAuthenticated, user });
                        fetchClientJobs();
                      }}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Debug Refresh
                    </button>
                    <Link 
                      to="/booking-form" 
                      style={{
                        background: '#d4a574',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      Post New Job
                    </Link>
                  </div>
                </div>
              )}


                </div>
              ) : (
                /* Proposals View */
                <div className="proposals-view">
                  {/* Header with Back Button */}
                  <div className="proposals-header">
                    <button className="back-btn" onClick={handleBackToRequests}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      Back to Requests
                    </button>
                    <h3 className="proposals-title">
                      {selectedRequestId ? 
                        `Proposals for: ${clientJobs.find(job => job._id === selectedRequestId)?.title || 'Job'}` :
                        'All Proposals'
                      }
                    </h3>
                  </div>

                  {/* Filter Tabs */}
                  <div className="proposals-filters">
                    <button 
                      className={`filter-tab ${proposalsFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      All Requests (2)
                    </button>
                    <button 
                      className={`filter-tab ${proposalsFilter === 'active' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('active')}
                    >
                      Active (2)
                    </button>
                    <button 
                      className={`filter-tab ${proposalsFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('completed')}
                    >
                      Completed (0)
                    </button>
                    
                    {/* Search and Filter */}
                    <div className="proposals-controls">
                      <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <input type="text" placeholder="Search requests" />
                      </div>
                      <button className="filters-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Filters
                      </button>
                    </div>
                  </div>

                  {/* Proposals List */}
                  <div className="proposals-list">
                    {proposalsLoading ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading proposals...</p>
                      </div>
                    ) : proposalsError ? (
                      <div className="error-state">
                        <p className="error-message">{proposalsError}</p>
                        <button onClick={fetchAllProposals} className="retry-btn">Try Again</button>
                      </div>
                    ) : realProposals.filter(p => selectedRequestId ? p.jobId === selectedRequestId : true).length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>
                        </div>
                        <h3>No proposals received yet</h3>
                        <p>Artists will send proposals for your posted jobs.</p>
                      </div>
                    ) : realProposals
                        .filter(p => selectedRequestId ? p.jobId === selectedRequestId : true)
                        .filter(p => proposalsFilter === 'all' ? true : 
                                   proposalsFilter === 'active' ? p.status === 'pending' : 
                                   proposalsFilter === 'completed' ? ['accepted', 'rejected'].includes(p.status) : true)
                        .map(proposal => (
                                              <div key={proposal.id} className="proposal-card">
                          <div className="proposal-header">
                            <div className="artist-info">
                              <div className="artist-avatar">
                                <img src="https://via.placeholder.com/60x60" alt={proposal.artistName} />
                              </div>
                              <div className="artist-details">
                                <h4 className="artist-name">{proposal.artistName}</h4>
                                <div className="artist-stats">
                                  <span className="job-title">For: {proposal.jobTitle}</span>
                                  <span className="duration">Duration: {proposal.duration}</span>
                                  <span className="status">Status: {proposal.status}</span>
                                </div>
                              </div>
                            </div>
                            <div className="proposal-price">
                              <span className="price">{proposal.price}</span>
                              <span className="experience">{proposal.experience}</span>
                            </div>
                          </div>

                          <div className="proposal-content">
                            <p className="proposal-text">{proposal.proposal}</p>
                            
                            <div className="proposal-meta">
                              <span className="submitted-date">
                                Submitted: {proposal.submittedAt ? new Date(proposal.submittedAt).toLocaleDateString() : 'N/A'}
                              </span>
                              <div className="proposal-actions">
                                <button className="message-artist-btn">Message Artist</button>
                                {proposal.status === 'pending' && (
                                  <>
                                    <button 
                                      className="reject-btn"
                                      onClick={() => rejectProposal(proposal.id)}
                                      style={{
                                        background: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '8px'
                                      }}
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      className="accept-btn"
                                      onClick={() => acceptProposal(proposal.id)}
                                      style={{
                                        background: '#27ae60',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Accept Proposal
                                    </button>
                                  </>
                                )}
                                {proposal.status === 'accepted' && (
                                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✅ Accepted</span>
                                )}
                                {proposal.status === 'rejected' && (
                                  <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>❌ Rejected</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Wallet View */}
          {activeTab === 'wallet' && (
            <div className="wallet-section">
              <h2 className="wallet-title">Your Wallet</h2>
              
              {/* Wallet Overview Cards */}
              <div className="wallet-overview">
                <div className="wallet-card total-paid">
                  <h3 className="wallet-card-title">Total Paid</h3>
                  <p className="wallet-card-amount green">£250.00</p>
                </div>
                
                <div className="wallet-card remaining-balance">
                  <h3 className="wallet-card-title">Remaining Balance</h3>
                  <p className="wallet-card-amount orange">£250.00</p>
                </div>
                
                <div className="wallet-card next-payment">
                  <h3 className="wallet-card-title">Next Payment Due</h3>
                  <p className="wallet-card-amount blue">1 Sep 2025</p>
                </div>
              </div>

              {/* Payment Status Bar */}
              <div className="payment-status-bar">
                <div className="status-progress">
                  <div className="progress-indicator"></div>
                </div>
                <p className="status-text">Final 50% due soon ⏳</p>
              </div>

              {/* Booking Details */}
              <div className="wallet-booking-details">
                <h3 className="booking-details-title">Bridal Mehndi – Oct 10, 2025</h3>
                
                <div className="payment-breakdown">
                  <div className="payment-item">
                    <span className="payment-label">Deposit Paid:</span>
                    <span className="payment-value">£250.00 (1 Aug 2025 · Visa 1234)</span>
                  </div>
                  
                  <div className="payment-item">
                    <span className="payment-label">Remaining:</span>
                    <span className="payment-value">£250.00 due 1 Sep 2025</span>
                  </div>
                </div>

                <button className="pay-remaining-btn wallet-pay-btn" onClick={handlePayRemaining}>
                  Pay Remaining
                </button>
              </div>

              {/* Transaction History */}
              <div className="transaction-history">
                <h3 className="section-title">Transaction History</h3>
                
                <div className="transaction-table">
                  <div className="table-header">
                    <span className="col-event">Event</span>
                    <span className="col-type">Type</span>
                    <span className="col-date">Date</span>
                    <span className="col-amount">Amount</span>
                    <span className="col-method">Method</span>
                    <span className="col-status">Status</span>
                    <span className="col-receipt">Receipt</span>
                  </div>
                  
                  <div className="table-row">
                    <span className="col-event">Bridal Mehndi</span>
                    <span className="col-type">Deposit Paid</span>
                    <span className="col-date">1 Aug 2025</span>
                    <span className="col-amount">£250.00</span>
                    <span className="col-method">Visa 1234</span>
                    <span className="col-status paid">Paid</span>
                    <span className="col-receipt">
                      <button className="receipt-btn download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15L7 10H10V3H14V10H17L12 15Z" fill="currentColor"/>
                          <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button className="receipt-btn email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                  
                  <div className="table-row">
                    <span className="col-event">Bridal Mehndi</span>
                    <span className="col-type">Final Payment</span>
                    <span className="col-date">1 Sep 2025</span>
                    <span className="col-amount">£250.00</span>
                    <span className="col-method">—</span>
                    <span className="col-status pending">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      Pending
                    </span>
                    <span className="col-receipt">
                      <button className="receipt-btn download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15L7 10H10V3H14V10H17L12 15Z" fill="currentColor"/>
                          <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button className="receipt-btn email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices & Receipts */}
              <div className="invoices-receipts">
                <h3 className="section-title">Invoices & Receipts</h3>
                
                <div className="receipts-list">
                  <div className="receipt-item">
                    <div className="receipt-info">
                      <span className="receipt-title">Bridal Mehndi Deposit Receipt</span>
                    </div>
                    <div className="receipt-actions">
                      <button className="receipt-btn download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15L7 10H10V3H14V10H17L12 15Z" fill="currentColor"/>
                          <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button className="receipt-btn email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="receipt-item">
                    <div className="receipt-info">
                      <span className="receipt-title">Final Payment Receipt (Pending)</span>
                    </div>
                    <div className="receipt-actions">
                      <button className="receipt-btn download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15L7 10H10V3H14V10H17L12 15Z" fill="currentColor"/>
                          <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button className="receipt-btn email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="payment-security-info">
                  <div className="security-item">
                    <div className="security-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#f39c12" strokeWidth="2" fill="none"/>
                        <path d="M9 12L11 14L15 10" stroke="#f39c12" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <span className="security-text">All payments are securely processed via Stripe.</span>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#f39c12" strokeWidth="2" fill="none"/>
                        <polyline points="14,2 14,8 20,8" stroke="#f39c12" strokeWidth="2" fill="none"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="#f39c12" strokeWidth="2"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="#f39c12" strokeWidth="2"/>
                        <polyline points="10,9 9,9 8,9" stroke="#f39c12" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <span className="security-text">Refunds and cancellations follow our <span className="policy-link">policy</span>.</span>
                  </div>
                </div>
              </div>

              {/* Saved Payment Methods */}
              <div className="saved-payment-methods">
                <h3 className="section-title">Saved Payment Methods</h3>
                
                <div className="payment-methods-list">
                  <div className="payment-method-item active">
                    <div className="method-info">
                      <div className="method-icon visa">
                        <svg width="24" height="16" viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="26" rx="4" fill="#1434CB"/>
                          <path d="M16.3 7.8H13.6L12 18.2H14.7L16.3 7.8Z" fill="white"/>
                          <path d="M23.7 8C23.1 7.8 22.2 7.6 21.1 7.6C18.5 7.6 16.7 8.9 16.7 10.8C16.7 12.2 18 12.9 19 13.4C20 13.8 20.4 14.1 20.4 14.6C20.4 15.3 19.5 15.6 18.7 15.6C17.5 15.6 16.9 15.4 15.9 14.9L15.5 14.7L15.1 17.4C15.8 17.7 17.1 18 18.4 18C21.2 18 22.9 16.7 22.9 14.7C22.9 13.6 22.3 12.8 20.9 12.1C19.9 11.6 19.3 11.3 19.3 10.7C19.3 10.2 19.9 9.7 21.2 9.7C22.2 9.7 22.9 9.9 23.4 10.1L23.7 10.2L24.1 7.6L23.7 8Z" fill="white"/>
                          <path d="M29.6 7.8H27.5C26.8 7.8 26.3 8 26 8.7L22.3 18.2H25.1L25.7 16.6H29L29.4 18.2H31.8L29.6 7.8ZM26.5 14.4L27.8 11L28.5 14.4H26.5Z" fill="white"/>
                          <path d="M11.8 7.8L9.2 15.6L8.9 14.1C8.4 12.4 6.9 10.5 5.2 9.6L7.6 18.2H10.4L14.6 7.8H11.8Z" fill="white"/>
                        </svg>
                      </div>
                      <span className="method-text">Visa ending in 1234</span>
                    </div>
                    <div className="method-status verified">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#27ae60"/>
                        <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="payment-method-item disabled">
                    <div className="method-info">
                      <div className="method-icon apple">
                        <svg width="20" height="24" viewBox="0 0 384 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M318.7 268.7C315.4 283.7 306.4 296.9 295.4 306.5C275.2 324.7 249.4 334.7 222.9 334.7C180.7 334.7 138.1 334.7 95.9 334.7C73.2 334.7 52.4 324.1 35.1 306.5C24.1 296.9 15.1 283.7 11.8 268.7C4.1 239.1 4.1 207.9 11.8 178.3C15.1 163.3 24.1 150.1 35.1 140.5C52.4 122.9 73.2 112.3 95.9 112.3C138.1 112.3 180.7 112.3 222.9 112.3C249.4 112.3 275.2 122.3 295.4 140.5C306.4 150.1 315.4 163.3 318.7 178.3C326.4 207.9 326.4 239.1 318.7 268.7Z" fill="#000000"/>
                          <path d="M267.2 152.5C258.9 143.5 248.1 139.9 236.8 141.3C235.1 155.2 239.5 169.4 248.1 179.8C256.2 189.6 267.6 194.5 278.6 193.6C280.8 179.6 275.7 163.5 267.2 152.5Z" fill="#000000"/>
                          <path d="M310.6 304.2C308.4 309.8 305.8 314.8 302.8 319.3C297.1 328.4 290.5 335.3 282.9 335.3C278.6 335.3 273.0 333.8 266.2 330.8C259.5 327.7 251.1 326.2 242.2 326.2C232.8 326.2 223.9 327.9 216.7 331.2C208.9 334.8 202.8 336.6 198.4 336.6C189.7 336.6 182.6 329.2 176.4 319.3C168.9 307.3 163.7 292.4 160.9 276.7C157.8 259.2 157.8 242.5 160.9 226.8C164.7 207.1 172.9 190.8 185.1 178.5C194.4 169.1 206.1 164.3 219.1 164.5C224.7 164.6 231.3 166.1 239.1 169.0C246.8 171.8 252.5 173.3 256.1 173.3C258.8 173.3 263.5 171.9 270.1 169.0C276.8 166.1 284.8 164.6 294.1 164.5C304.8 164.6 314.5 167.4 322.9 172.9C313.7 179.1 308.6 188.2 307.1 199.2C308.2 211.8 312.4 222.5 319.7 231.1C323.2 235.1 327.1 238.6 331.4 241.5C329.8 246.0 327.9 250.3 325.7 254.4C321.6 262.2 316.7 268.7 310.6 304.2Z" fill="#000000"/>
                        </svg>
                      </div>
                      <span className="method-text">Apple Pay (Coming Soon)</span>
                    </div>
                  </div>
                  
                  <div className="payment-method-item disabled">
                    <div className="method-info">
                      <div className="method-icon paypal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.98-.15c-.291-.016-.615-.024-.973-.024H15.83c-.524 0-.968.382-1.05.9L13.856 12.5c-.082.518.302.9.825.9h2.38c3.256 0 5.739-1.194 6.825-4.657.516-1.647.402-3.051-.164-4.326z" fill="#253B80"/>
                          <path d="M6.739 6.53c-.082.518.302.9.825.9h2.38c3.256 0 5.739-1.194 6.825-4.657.516-1.647.402-3.051-.164-4.326A3.35 3.35 0 0 0 15.625-.703c-.291-.016-.615-.024-.973-.024H10.214c-.524 0-.968.382-1.05.9L6.739 6.53z" fill="#179BD7"/>
                          <path d="M6.914 6.53c-.082.518.302.9.825.9h2.38c3.256 0 5.739-1.194 6.825-4.657.516-1.647.402-3.051-.164-4.326-.203-.464-.474-.8-.812-1.029C16.445 3.05 15.831 6.468 6.914 6.53z" fill="#222D65"/>
                        </svg>
                      </div>
                      <span className="method-text">PayPal (Coming Soon)</span>
                    </div>
                  </div>
                  
                  <div className="payment-method-item add-new">
                    <div className="method-info">
                      <div className="method-icon add">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
                          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <span className="method-text">Add New Card</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews View */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <div className="reviews-header">
                <h2 className="section-title">Your Reviews</h2>
                <p className="reviews-subtitle">Review your completed bookings and help other clients</p>
              </div>

              <div className="reviews-stats">
                <div className="stats-card">
                  <h3>Total Reviews</h3>
                  <span className="stats-number">{completedBookings.filter(b => b.hasReview).length}</span>
                </div>
                <div className="stats-card">
                  <h3>Pending Reviews</h3>
                  <span className="stats-number">{completedBookings.filter(b => !b.hasReview).length}</span>
                </div>
                <div className="stats-card">
                  <h3>Average Rating</h3>
                  <span className="stats-number">
                    {completedBookings.filter(b => b.hasReview).length > 0 
                      ? (completedBookings.filter(b => b.hasReview).reduce((acc, b) => acc + (b.rating || 0), 0) / completedBookings.filter(b => b.hasReview).length).toFixed(1)
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              <div className="completed-bookings">
                <h3 className="section-subtitle">Completed Bookings</h3>
                
                {completedBookings.map(booking => (
                  <div key={booking.id} className="completed-booking-card">
                    <div className="booking-main-info">
                      <div className="artist-section">
                        <div className="artist-avatar">
                          <img src={booking.artistImage} alt={booking.artist} />
                        </div>
                        <div className="artist-details">
                          <h4 className="artist-name">{booking.artist}</h4>
                          <p className="booking-title">{booking.title}</p>
                          <p className="booking-date">{booking.date} • {booking.time}</p>
                        </div>
                      </div>
                      
                      <div className="booking-price">
                        <span className="price-label">Total Paid</span>
                        <span className="price-amount">{booking.price}</span>
                      </div>
                    </div>

                    <div className="review-section">
                      {booking.hasReview ? (
                        <div className="review-completed">
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`star ${i < booking.rating ? 'filled' : ''}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="review-status">Review Completed</span>
                          <button className="view-review-btn">View Review</button>
                        </div>
                      ) : (
                        <div className="review-pending">
                          <span className="review-status">Review Pending</span>
                          <button 
                            className="write-review-btn"
                            onClick={() => handleWriteReview(booking)}
                          >
                            Write Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages View */}
          {activeTab === 'messages' && (
            <div className="messages-section">
              <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-sidebar">
                  <div className="conversations-header">
                    <h3 className="conversations-title">Messages</h3>
                    <div className="conversations-count">
                      {conversations.reduce((total, conv) => total + conv.unreadCount, 0)} unread
                    </div>
                  </div>
                  
                  <div className="conversations-list">
                    {conversations.map(conversation => (
                      <div 
                        key={conversation.id} 
                        className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="conversation-avatar">
                          <img src={conversation.artistImage} alt={conversation.artistName} />
                          <div className={`status-indicator ${conversation.status}`}></div>
                        </div>
                        
                        <div className="conversation-info">
                          <div className="conversation-header">
                            <h4 className="artist-name">{conversation.artistName}</h4>
                            <span className="message-time">{conversation.lastMessageTime}</span>
                          </div>
                          <div className="conversation-preview">
                            <p className="last-message">{conversation.lastMessage}</p>
                            {conversation.unreadCount > 0 && (
                              <span className="unread-badge">{conversation.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="chat-header">
                        <div className="chat-artist-info">
                          <img src={selectedConversation.artistImage} alt={selectedConversation.artistName} />
                          <div>
                            <h3>{selectedConversation.artistName}</h3>
                            <span className={`status-text ${selectedConversation.status}`}>
                              {selectedConversation.status === 'online' ? 'Online' : 
                               selectedConversation.status === 'away' ? 'Away' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="chat-actions">
                          <button className="chat-action-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h4.09a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                          </button>
                          <button className="chat-action-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                          </button>
                          <button className="chat-action-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Messages List */}
                      <div className="messages-list">
                        {selectedConversation.messages.map(message => (
                          <div 
                            key={message.id} 
                            className={`message ${message.senderId === 'user' ? 'sent' : 'received'}`}
                          >
                            <div className="message-content">
                              <p>{message.message}</p>
                            </div>
                            <div className="message-meta">
                              <span className="message-time">{message.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="message-input-area">
                        <div className="message-input-container">
                          <button className="attachment-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21.44 11.05L12.25 20.24a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 17.41a2 2 0 1 1-2.83-2.83l8.49-8.49" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                          </button>
                          
                          <textarea
                            className="message-input"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows="1"
                          />
                          
                          <button 
                            className="send-btn"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2"/>
                              <polygon points="22,2 15,22 11,13 2,9 22,2" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-conversation-selected">
                      <div className="no-chat-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <h3>Select a conversation</h3>
                      <p>Choose a conversation from the sidebar to start messaging with artists.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="dashboard-bottom-nav">
          <div className={`nav-tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => handleTabChange('wallet')}>
            <div className="nav-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span className="nav-tab-number">1</span>
            </div>
            <h3 className="nav-tab-title">Wallet / Payments</h3>
          </div>

          <div className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')}>
            <div className="nav-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              <span className="nav-tab-number">2</span>
            </div>
            <h3 className="nav-tab-title">Reviews</h3>
          </div>

          <div className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => handleTabChange('messages')}>
            <div className="nav-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="nav-tab-number">3</span>
            </div>
            <h3 className="nav-tab-title">Messages</h3>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={handleClosePaymentModal}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Complete Your Payment</h2>
                <button className="modal-close" onClick={handleClosePaymentModal}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="payment-details">
                  <h3 className="payment-event">Event: Eid Mehndi – Sep 15, 2025</h3>
                  
                  <div className="payment-amount">
                    <span className="amount-label">Amount Due:</span>
                    <span className="amount-value">£250.00 <span className="amount-percentage">(50%)</span></span>
                  </div>
                  
                  <div className="payment-due-date">
                    <span className="due-label">Due Date:</span>
                    <span className="due-value">Sep 1, 2025</span>
                  </div>
                </div>

                <div className="payment-methods">
                  <div className="payment-method-option">
                    <input
                      type="radio"
                      id="visa-1234"
                      name="paymentMethod"
                      value="visa-1234"
                      checked={selectedPaymentMethod === 'visa-1234'}
                      onChange={() => handlePaymentMethodChange('visa-1234')}
                      className="payment-radio"
                    />
                    <label htmlFor="visa-1234" className="payment-method-label">
                      <span className="card-icon">💳</span>
                      Visa ending in 1234
                    </label>
                  </div>

                  <div className="payment-method-option">
                    <input
                      type="radio"
                      id="add-new-card"
                      name="paymentMethod"
                      value="add-new-card"
                      checked={selectedPaymentMethod === 'add-new-card'}
                      onChange={() => handlePaymentMethodChange('add-new-card')}
                      className="payment-radio"
                    />
                    <label htmlFor="add-new-card" className="payment-method-label">
                      <span className="card-icon">➕</span>
                      Add New Card
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="cancel-btn" onClick={handleClosePaymentModal}>
                    Cancel
                  </button>
                  <button className="confirm-pay-btn" onClick={handleConfirmPayment}>
                    Confirm & Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="modal-overlay">
            <div className="review-modal">
              <div className="modal-header">
                <h3 className="modal-title">Write a Review</h3>
                <button className="modal-close" onClick={handleCloseReviewModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              {selectedBooking && (
                <div className="modal-content">
                  <div className="booking-info">
                    <div className="artist-info">
                      <img src={selectedBooking.artistImage} alt={selectedBooking.artist} className="artist-photo" />
                      <div>
                        <h4>{selectedBooking.artist}</h4>
                        <p>{selectedBooking.title}</p>
                        <p>{selectedBooking.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="review-form">
                    {/* Rating Section */}
                    <div className="form-group">
                      <label className="form-label">Overall Rating</label>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= reviewData.rating ? 'active' : ''}`}
                            onClick={() => handleRatingChange(star)}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="form-group">
                      <label className="form-label">Review Title</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Summary of your experience"
                        value={reviewData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>

                    {/* Review Comment */}
                    <div className="form-group">
                      <label className="form-label">Your Review</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Tell others about your experience with this artist..."
                        rows="4"
                        value={reviewData.comment}
                        onChange={(e) => handleInputChange('comment', e.target.value)}
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                      <label className="form-label">Add Photos (Optional)</label>
                      <div className="image-upload-section">
                        <div className="image-upload-area">
                          <input
                            type="file"
                            id="image-upload"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="file-input"
                          />
                          <label htmlFor="image-upload" className="upload-label">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14.2857 5.71429H9.71429C9.32 5.71429 9 6.03429 9 6.42857V9H15V6.42857C15 6.03429 14.68 5.71429 14.2857 5.71429Z" fill="currentColor"/>
                              <path d="M18 7.71429V17.1429C18 18.1543 17.1543 19 16.1429 19H7.85714C6.84571 19 6 18.1543 6 17.1429V7.71429H18ZM16.5 9.42857H7.5V17.1429C7.5 17.325 7.675 17.5 7.85714 17.5H16.1429C16.325 17.5 16.5 17.325 16.5 17.1429V9.42857Z" fill="currentColor"/>
                              <path d="M12 11.5714L8.78571 14.7857H15.2143L12 11.5714Z" fill="currentColor"/>
                            </svg>
                            <span>Click to add photos</span>
                            <small>Upload up to 5 images</small>
                          </label>
                        </div>

                        {reviewData.images.length > 0 && (
                          <div className="uploaded-images">
                            {reviewData.images.map((image, index) => (
                              <div key={index} className="image-preview">
                                <img src={image} alt={`Upload ${index + 1}`} />
                                <button
                                  type="button"
                                  className="remove-image"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={handleCloseReviewModal}>
                      Cancel
                    </button>
                    <button 
                      className="submit-review-btn" 
                      onClick={handleSubmitReview}
                      disabled={reviewData.rating === 0 || !reviewData.comment.trim()}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientDashboard; 