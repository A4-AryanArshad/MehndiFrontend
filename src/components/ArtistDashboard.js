import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import apiService from '../services/api';

const { jobsAPI, proposalsAPI, authAPI } = apiService;

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const artistName = user ? `${user.firstName} ${user.lastName}` : 'Artist';
  
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, proposals, messages, profile
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [proposalData, setProposalData] = useState({
    message: '',
    price: '',
    duration: '',
    experience: ''
  });
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Real data from backend
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Real proposals data from backend
  const [sentProposals, setSentProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  // Fetch sent proposals from backend
  const fetchSentProposals = useCallback(async () => {
    console.log('=== FETCH SENT PROPOSALS START ===');
    console.log('Auth status:', { isAuthenticated, user: user ? { id: user._id, userType: user.userType, name: `${user.firstName} ${user.lastName}` } : null });
    console.log('🔍 Current User Full Object:', user);
    
    if (!isAuthenticated || !user || user.userType !== 'artist') {
      console.log('Skipping proposal fetch - user not authenticated or not an artist:', { isAuthenticated, user: user?.userType });
      return;
    }

    try {
      setProposalsLoading(true);
      console.log('Fetching sent proposals for artist...');
      
      // First test if we're properly authenticated
      try {
        const authTest = await authAPI.getProfile();
        console.log('Auth test successful:', authTest);
      } catch (authError) {
        console.error('Auth test failed:', authError);
        setSentProposals([]);
        return;
      }
      
      const response = await proposalsAPI.getMyProposals();
      console.log('Proposals API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Raw proposals data:', response.data);
        console.log('✅ Number of proposals found:', response.data.length);
        
        // Transform proposals data for display
        const transformedProposals = response.data.map(proposal => ({
          id: proposal._id,
          jobTitle: proposal.job?.title || 'Job Title Not Available',
          client: proposal.job?.client ? `${proposal.job.client.firstName || ''} ${proposal.job.client.lastName || ''}`.trim() : 'Client',
          proposedPrice: `£${proposal.pricing?.totalPrice || 0}`,
          proposedDuration: `${proposal.timeline?.estimatedDuration?.value || 0} ${proposal.timeline?.estimatedDuration?.unit || 'hours'}`,
          message: proposal.message || '',
          status: proposal.status || 'pending',
          sentDate: proposal.submittedAt ? new Date(proposal.submittedAt).toLocaleDateString('en-GB') : '',
          responseDate: proposal.clientResponse?.respondedAt ? new Date(proposal.clientResponse.respondedAt).toLocaleDateString('en-GB') : null,
          rawData: proposal
        }));
        
        console.log('✅ Setting transformed proposals:', transformedProposals);
        console.log('✅ Number of proposals to display:', transformedProposals.length);
        setSentProposals(transformedProposals);
      } else {
        console.log('❌ No proposals data or unsuccessful response:', response);
        setSentProposals([]);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      console.error('Error details:', error.message, error.stack);
      
      // If it's an authentication error, show a more helpful message
      if (error.message.includes('401') || error.message.includes('Not authorized')) {
        console.log('Authentication failed - user may need to log in again');
        setError('Authentication expired. Please refresh the page and log in again.');
      } else {
        setError(`Failed to load proposals: ${error.message}`);
      }
      
      // Keep existing proposals if fetch fails
    } finally {
      setProposalsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch available jobs from backend
  const fetchAvailableJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching available jobs...');
      const response = await jobsAPI.getAllJobs();
      
      console.log('Jobs response:', response);
      console.log('Jobs data array:', response.data);
      console.log('Jobs data length:', response.data ? response.data.length : 'No data');
      
      // Check if response has data
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response data:', response);
        setAvailableJobs([]);
        return;
      }
      
      // Transform the data to match the component's expected format
      const transformedJobs = response.data.map((job, index) => {
        console.log(`Transforming job ${index}:`, job);
        
        try {
          return {
            id: job._id,
            title: job.title || 'Untitled Job',
            client: job.client ? `${job.client.firstName || ''} ${job.client.lastName || ''}`.trim() : 'Client',
            location: job.location?.city || 'Location not specified',
            date: job.eventDetails?.eventDate ? new Date(job.eventDetails.eventDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'Date TBD',
            time: job.eventDetails?.eventTime || 'Time TBD',
            budget: job.budget ? `£${job.budget.min || 0}-${job.budget.max || 0}` : 'Budget TBD',
            description: job.description || 'No description available',
            requirements: job.requirements?.designStyle || ['Traditional designs'],
            postedDate: getTimeAgo(job.createdAt),
            proposalsCount: job.applicationsCount || 0,
            status: job.status || 'open',
            rawData: job // Keep original data for proposal submission
          };
        } catch (transformError) {
          console.error(`Error transforming job ${index}:`, transformError, job);
          return null;
        }
      }).filter(job => job !== null); // Remove any failed transformations
      
      console.log('Transformed jobs:', transformedJobs);
      console.log('Setting available jobs to:', transformedJobs.length, 'items');
      setAvailableJobs(transformedJobs);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setError(`Failed to load available jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available jobs and proposals when component mounts and user is authenticated
  useEffect(() => {
    console.log('Artist Dashboard useEffect:', {
      isAuthenticated,
      user: user ? { userType: user.userType, name: `${user.firstName} ${user.lastName}` } : null
    });
    
    if (isAuthenticated) {
      console.log('User is authenticated, fetching jobs and proposals...');
      // Small delay to ensure all auth context is properly set
      setTimeout(() => {
        fetchAvailableJobs();
        fetchSentProposals();
      }, 100);
    } else {
      console.log('User not authenticated');
      setLoading(false); // Stop loading if conditions aren't met
    }
  }, [isAuthenticated, user, fetchAvailableJobs, fetchSentProposals]);

  // Use real jobs or show empty state
  const displayJobs = availableJobs;

  // Mock data for artist conversations
  const [artistConversations] = useState([
    {
      id: 1,
      clientName: 'Aisha Khan',
      clientImage: 'https://via.placeholder.com/50x50',
      lastMessage: 'Thank you for your proposal! Can we discuss the design details?',
      lastMessageTime: '30 min ago',
      unreadCount: 1,
      status: 'online',
      messages: [
        {
          id: 1,
          senderId: 'client',
          senderName: 'Aisha Khan',
          message: 'Hi! I saw your proposal for my bridal mehndi. Your work looks amazing!',
          timestamp: '2024-03-15 09:15 AM',
          type: 'text'
        },
        {
          id: 2,
          senderId: 'artist',
          senderName: 'Zara Henna Arts',
          message: 'Thank you so much! I\'d love to work with you. I have some beautiful bridal designs in mind.',
          timestamp: '2024-03-15 09:25 AM',
          type: 'text'
        },
        {
          id: 3,
          senderId: 'client',
          senderName: 'Aisha Khan',
          message: 'Thank you for your proposal! Can we discuss the design details?',
          timestamp: '2024-03-15 10:00 AM',
          type: 'text'
        }
      ]
    },
    {
      id: 2,
      clientName: 'Fatima Ali',
      clientImage: 'https://via.placeholder.com/50x50',
      lastMessage: 'Perfect! Looking forward to working with you.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      status: 'offline',
      messages: [
        {
          id: 1,
          senderId: 'artist',
          senderName: 'Zara Henna Arts',
          message: 'Hello! I saw your Eid celebration request. I\'d love to help make it special!',
          timestamp: '2024-03-14 02:00 PM',
          type: 'text'
        },
        {
          id: 2,
          senderId: 'client',
          senderName: 'Fatima Ali',
          message: 'Hi! Your portfolio is beautiful. Can you handle 6 people in 4 hours?',
          timestamp: '2024-03-14 02:15 PM',
          type: 'text'
        },
        {
          id: 3,
          senderId: 'artist',
          senderName: 'Zara Henna Arts',
          message: 'Absolutely! I can create elegant designs that work well for family events.',
          timestamp: '2024-03-14 02:20 PM',
          type: 'text'
        },
        {
          id: 4,
          senderId: 'client',
          senderName: 'Fatima Ali',
          message: 'Perfect! Looking forward to working with you.',
          timestamp: '2024-03-14 02:25 PM',
          type: 'text'
        }
      ]
    }
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // If switching to proposals tab, fetch the latest proposals
    if (tab === 'proposals') {
      console.log('Switching to proposals tab - fetching proposals...');
      fetchSentProposals();
    }
  };

  const handleSendProposal = (job) => {
    setSelectedJob(job);
    setShowProposalModal(true);
  };

  const handleCloseProposalModal = () => {
    setShowProposalModal(false);
    setSelectedJob(null);
    setProposalData({
      message: '',
      price: '',
      duration: '',
      experience: ''
    });
  };

  const handleProposalInputChange = (field, value) => {
    setProposalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitProposal = async () => {
    if (!selectedJob || !proposalData.price || !proposalData.message) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingProposal(true);
      setError('');

      // Prepare proposal data according to backend API schema
      const proposalPayload = {
        jobId: selectedJob.id,
        message: proposalData.message,
        pricing: {
          totalPrice: parseFloat(proposalData.price.replace(/[£,]/g, '')), // Remove currency symbols
          currency: 'GBP'
        },
        timeline: {
          estimatedDuration: {
            value: parseFloat(proposalData.duration.replace(/[^0-9.]/g, '')), // Extract numeric value
            unit: proposalData.duration.toLowerCase().includes('day') ? 'days' : 'hours'
          }
        },
        experience: {
          relevantExperience: proposalData.experience,
          yearsOfExperience: 0 // You might want to add this to the form
        },
        coverLetter: proposalData.message // Use message as cover letter for now
      };

      console.log('Submitting proposal:', proposalPayload);
      
      const response = await proposalsAPI.createProposal(proposalPayload);
      
      if (response.success) {
        console.log('Proposal submitted successfully:', response.data);
        
        // Show success message
        alert('Proposal submitted successfully!');
        
        // Close modal and reset form
        handleCloseProposalModal();
        
        // Refresh the proposals list and jobs list with a small delay to ensure backend has processed
        setTimeout(async () => {
          console.log('Refreshing data after successful proposal submission...');
          await fetchSentProposals();
          await fetchAvailableJobs();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setError(error.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message = {
        id: selectedConversation.messages.length + 1,
        senderId: 'artist',
        senderName: artistName,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleString(),
        type: 'text'
      };
      
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

  const getProposalStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="proposal-status pending">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="proposal-status accepted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="proposal-status declined">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Declined
          </span>
        );
      default:
        return (
          <span className="proposal-status pending">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Pending
          </span>
        );
    }
  };

  return (
    <>
            <Header />
      <div className="artist-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="artist-welcome">
            <h1>Welcome back, {artistName}! 🎨</h1>
            <p>Manage your henna business and connect with clients</p>
          </div>
          
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>Active Jobs</h3>
                <span className="stat-number">{displayJobs.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>Sent Proposals</h3>
                <span className="stat-number">{sentProposals.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>Messages</h3>
                <span className="stat-number">{artistConversations.reduce((total, conv) => total + conv.unreadCount, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Available Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="jobs-section">
              <div className="section-header">
                <h2>Available Jobs</h2>
                <div className="jobs-filter">
                  <select className="filter-select">
                    <option value="all">All Jobs</option>
                    <option value="new">New Today</option>
                    <option value="budget">High Budget</option>
                    <option value="nearby">Nearby</option>
                  </select>
                </div>
              </div>

              <div className="jobs-list">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading available jobs...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchAvailableJobs} className="retry-btn">Try Again</button>
                  </div>
                ) : displayJobs.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <h3>No jobs available yet</h3>
                    <p>New job opportunities will appear here when clients post them.</p>
                    <button onClick={fetchAvailableJobs} className="refresh-btn">Refresh</button>
                  </div>
                ) : displayJobs.map(job => (
                  <div 
                    key={job._id || job.id} 
                    className="job-card"
                    onClick={() => window.open(`/job/${job._id || job.id}`,'_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="job-header">
                      <div className="job-title-section">
                        <h3 className="job-title">{job.title}</h3>
                        <div className="job-meta">
                          <span className="client-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {job.client}
                          </span>
                          <span className="job-location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {job.location}
                          </span>
                          <span className="job-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {job.date}
                          </span>
                        </div>
                      </div>
                      <div className="job-budget">
                        <span className="budget-label">Budget</span>
                        <span className="budget-amount">{job.budget}</span>
                      </div>
                    </div>

                    <div className="job-description">
                      <p>{job.description}</p>
                    </div>

                    <div className="job-requirements">
                      <h4>Requirements:</h4>
                      <ul>
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="job-footer">
                      <div className="job-stats">
                        <span className="posted-time">Posted {job.postedDate}</span>
                        <span className="proposals-count">{job.proposalsCount} proposals</span>
                      </div>
                      {(() => {
                        const hasProposal = sentProposals.some(proposal => 
                          proposal.rawData?.job?._id === job.id || 
                          proposal.rawData?.job === job.id
                        );
                        
                        return hasProposal ? (
                          <button 
                            className="send-proposal-btn"
                            disabled
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          >
                            Proposal Sent
                          </button>
                        ) : (
                          <button 
                            className="send-proposal-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleSendProposal(job);
                            }}
                          >
                            Send Proposal
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className="proposals-section">
              <div className="section-header">
                <h2>My Proposals</h2>
                <div className="proposals-stats">
                  <span className="pending-count">
                    {sentProposals.filter(p => p.status === 'pending').length} Pending
                  </span>
                  <span className="accepted-count">
                    {sentProposals.filter(p => p.status === 'accepted').length} Accepted
                  </span>
                  <button 
                    onClick={() => {
                      console.log('Manual refresh proposals clicked');
                      fetchSentProposals();
                    }}
                    className="refresh-btn"
                    disabled={proposalsLoading}
                    style={{ 
                      marginLeft: '10px', 
                      padding: '5px 10px', 
                      background: '#d4a574',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: proposalsLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {proposalsLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="proposals-list">
                {proposalsLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your proposals...</p>
                  </div>
                ) : sentProposals.length === 0 ? (
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
                    <h3>No proposals sent yet</h3>
                    <p>Start applying to jobs to see your proposals here.</p>
                  </div>
                ) : sentProposals.map(proposal => (
                  <div key={proposal.id} className="proposal-card">
                    <div className="proposal-header">
                      <div className="proposal-info">
                        <h3 className="proposal-job-title">{proposal.jobTitle}</h3>
                        <p className="proposal-client">Client: {proposal.client}</p>
                      </div>
                      <div className="proposal-status-section">
                        {getProposalStatusBadge(proposal.status)}
                      </div>
                    </div>

                    <div className="proposal-details">
                      <div className="proposal-pricing">
                        <div className="price-item">
                          <label>Proposed Price:</label>
                          <span>{proposal.proposedPrice}</span>
                        </div>
                        <div className="price-item">
                          <label>Duration:</label>
                          <span>{proposal.proposedDuration}</span>
                        </div>
                      </div>
                      
                      <div className="proposal-message">
                        <label>Your Message:</label>
                        <p>"{proposal.message}"</p>
                      </div>
                    </div>

                    <div className="proposal-footer">
                      <div className="proposal-dates">
                        <span>Sent: {proposal.sentDate}</span>
                        {proposal.responseDate && (
                          <span>Response: {proposal.responseDate}</span>
                        )}
                      </div>
                      
                      <div className="proposal-actions">
                        {proposal.status === 'accepted' && (
                          <button className="contact-client-btn">Contact Client</button>
                        )}
                        {proposal.status === 'pending' && (
                          <button className="edit-proposal-btn">Edit Proposal</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab - Similar to client messages but for artist */}
          {activeTab === 'messages' && (
            <div className="messages-section">
              <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-sidebar">
                  <div className="conversations-header">
                    <h3 className="conversations-title">Client Messages</h3>
                    <div className="conversations-count">
                      {artistConversations.reduce((total, conv) => total + conv.unreadCount, 0)} unread
                    </div>
                  </div>
                  
                  <div className="conversations-list">
                    {artistConversations.map(conversation => (
                      <div 
                        key={conversation.id} 
                        className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="conversation-avatar">
                          <img src={conversation.clientImage} alt={conversation.clientName} />
                          <div className={`status-indicator ${conversation.status}`}></div>
                        </div>
                        
                        <div className="conversation-info">
                          <div className="conversation-header">
                            <h4 className="client-name">{conversation.clientName}</h4>
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
                        <div className="chat-client-info">
                          <img src={selectedConversation.clientImage} alt={selectedConversation.clientName} />
                          <div>
                            <h3>{selectedConversation.clientName}</h3>
                            <span className={`status-text ${selectedConversation.status}`}>
                              {selectedConversation.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Messages List */}
                      <div className="messages-list">
                        {selectedConversation.messages.map(message => (
                          <div 
                            key={message.id} 
                            className={`message ${message.senderId === 'artist' ? 'sent' : 'received'}`}
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
                      <p>Choose a client conversation to start messaging.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="artist-bottom-nav">
          <div className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => handleTabChange('jobs')}>
            <div className="nav-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
                              <span className="nav-tab-number">{displayJobs.length}</span>
            </div>
            <h3 className="nav-tab-title">Available Jobs</h3>
          </div>

          <div className={`nav-tab ${activeTab === 'proposals' ? 'active' : ''}`} onClick={() => handleTabChange('proposals')}>
            <div className="nav-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span className="nav-tab-number">{sentProposals.filter(p => p.status === 'pending').length}</span>
            </div>
            <h3 className="nav-tab-title">My Proposals</h3>
          </div>

          <div className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => handleTabChange('messages')}>
            <div className="nav-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="nav-tab-number">{artistConversations.reduce((total, conv) => total + conv.unreadCount, 0)}</span>
            </div>
            <h3 className="nav-tab-title">Messages</h3>
          </div>
        </div>

        {/* Proposal Modal */}
        {showProposalModal && (
          <div className="modal-overlay">
            <div className="proposal-modal">
              <div className="modal-header">
                <h3 className="modal-title">Send Proposal</h3>
                <button className="modal-close" onClick={handleCloseProposalModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              {selectedJob && (
                <div className="modal-content">
                  <div className="job-summary">
                    <h4>{selectedJob.title}</h4>
                    <p>Client: {selectedJob.client} • {selectedJob.location}</p>
                    <p>Budget: {selectedJob.budget}</p>
                  </div>

                  <div className="proposal-form">
                    {error && (
                      <div className="error-message" style={{
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '4px',
                        padding: '10px',
                        marginBottom: '15px',
                        color: '#c33'
                      }}>
                        {error}
                      </div>
                    )}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Your Price *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="£450"
                          value={proposalData.price}
                          onChange={(e) => handleProposalInputChange('price', e.target.value)}
                          disabled={submittingProposal}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Duration *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="4 hours"
                          value={proposalData.duration}
                          onChange={(e) => handleProposalInputChange('duration', e.target.value)}
                          disabled={submittingProposal}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Experience</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="8+ years of bridal mehndi experience"
                        value={proposalData.experience}
                        onChange={(e) => handleProposalInputChange('experience', e.target.value)}
                        disabled={submittingProposal}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Proposal Message *</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Explain why you're the best fit for this job... (minimum 50 characters)"
                        rows="4"
                        value={proposalData.message}
                        onChange={(e) => handleProposalInputChange('message', e.target.value)}
                        disabled={submittingProposal}
                      />
                      <small style={{ 
                        color: proposalData.message.length < 50 ? '#e74c3c' : '#27ae60', 
                        fontSize: '12px',
                        fontWeight: proposalData.message.length < 50 ? 'bold' : 'normal'
                      }}>
                        {proposalData.message.length}/50 characters minimum
                        {proposalData.message.length < 50 && (
                          <span style={{ display: 'block', marginTop: '2px' }}>
                            Please write at least {50 - proposalData.message.length} more characters
                          </span>
                        )}
                      </small>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="cancel-btn" 
                      onClick={handleCloseProposalModal}
                      disabled={submittingProposal}
                    >
                      Cancel
                    </button>
                    <button 
                      className="submit-proposal-btn" 
                      onClick={handleSubmitProposal}
                      disabled={!proposalData.price || !proposalData.message || !proposalData.duration || proposalData.message.length < 50 || submittingProposal}
                      title={
                        !proposalData.price ? 'Please enter your price' :
                        !proposalData.duration ? 'Please enter duration' :
                        !proposalData.message ? 'Please enter a proposal message' :
                        proposalData.message.length < 50 ? `Message too short. Need ${50 - proposalData.message.length} more characters` :
                        submittingProposal ? 'Submitting proposal...' :
                        'Send your proposal'
                      }
                    >
                      {submittingProposal ? 'Sending...' : 'Send Proposal'}
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

export default ArtistDashboard; 