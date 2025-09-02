import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import apiService from '../services/api';

const { jobsAPI, proposalsAPI } = apiService;

console.log('JobDetails - proposalsAPI:', proposalsAPI);
console.log('JobDetails - apiService:', apiService);

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalData, setProposalData] = useState({
    message: '',
    price: '',
    duration: '',
    experience: ''
  });

  // New state for proposals
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchJobProposals();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await jobsAPI.getJob(jobId);
      console.log('Job details response:', response);
      
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobProposals = async () => {
    try {
      setProposalsLoading(true);
      setProposalsError('');
      
      const response = await proposalsAPI.getJobProposals(jobId);
      console.log('Job proposals response:', response);
      
      if (response.success && response.data) {
        setProposals(response.data);
      } else {
        setProposals([]);
      }
    } catch (error) {
      console.error('Error fetching job proposals:', error);
      setProposalsError('Failed to load proposals.');
      setProposals([]);
    } finally {
      setProposalsLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      console.log('Accepting proposal:', proposalId);
      const response = await proposalsAPI.acceptProposal(proposalId);
      
      if (response.success) {
        alert('Proposal accepted successfully!');
        fetchJobProposals(); // Refresh proposals
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal: ' + error.message);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    const reason = prompt('Please provide a reason for rejecting this proposal (optional):');
    try {
      console.log('Rejecting proposal:', proposalId);
      const response = await proposalsAPI.rejectProposal(proposalId, reason);
      
      if (response.success) {
        alert('Proposal rejected');
        fetchJobProposals(); // Refresh proposals
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal: ' + error.message);
    }
  };

  const handleProposalInputChange = (field, value) => {
    setProposalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendProposal = async () => {
    if (!proposalData.price || !proposalData.message || !proposalData.duration || proposalData.message.length < 50) {
      setError('Please fill in all required fields. Message must be at least 50 characters.');
      return;
    }

    try {
      setSubmittingProposal(true);
      setError('');

      // Prepare proposal data according to backend API schema
      const proposalPayload = {
        jobId: jobId,
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
        setShowProposalModal(false);
        setProposalData({
          message: '',
          price: '',
          duration: '',
          experience: ''
        });
        
        // Refresh job details and proposals to update counts
        fetchJobDetails();
        fetchJobProposals();
      }
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setError(error.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="job-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <Header />
        <div className="job-details-error">
          <p className="error-message">{error || 'Job not found'}</p>
          <button 
            onClick={() => navigate(user?.userType === 'client' ? '/client-dashboard' : '/artist-dashboard')} 
            className="back-btn"
          >
            Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="job-details">
        <div className="job-details-container">
          {/* Back Button */}
          <button 
            onClick={() => navigate(user?.userType === 'client' ? '/client-dashboard' : '/artist-dashboard')} 
            className="back-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>

          {/* Job Header */}
          <div className="job-header">
            <div className="job-title-section">
              <h1 className="job-title">{job.title}</h1>
              <div className="job-meta">
                <span className="client-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {job.client ? `${job.client.firstName} ${job.client.lastName}` : 'Client'}
                </span>
                <span className="job-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {job.location?.city}
                </span>
                <span className="posted-date">
                  Posted {getTimeAgo(job.createdAt)}
                </span>
              </div>
            </div>
            <div className="job-budget">
              <span className="budget-label">Budget</span>
              <span className="budget-amount">£{job.budget?.min}-{job.budget?.max}</span>
            </div>
          </div>

          {/* Job Content */}
          <div className="job-content">
            <div className="job-main-info">
              <div className="job-section">
                <h3>Job Description</h3>
                <p className="job-description">{job.description}</p>
              </div>

              <div className="job-section">
                <h3>Event Details</h3>
                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(job.eventDetails?.eventDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{job.eventDetails?.eventTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{job.eventDetails?.duration?.estimated} hours</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Guest Count:</span>
                    <span className="detail-value">{job.eventDetails?.guestCount} people</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Event Type:</span>
                    <span className="detail-value">{job.eventDetails?.eventType}</span>
                  </div>
                </div>
              </div>

              <div className="job-section">
                <h3>Location</h3>
                <div className="location-details">
                  <p>{job.location?.address}</p>
                  <p>{job.location?.city}, {job.location?.postalCode}</p>
                </div>
              </div>

              <div className="job-section">
                <h3>Requirements</h3>
                <div className="requirements">
                  <div className="requirement-item">
                    <span className="requirement-label">Design Style:</span>
                    <span className="requirement-value">
                      {job.requirements?.designStyle?.join(', ') || 'Traditional'}
                    </span>
                  </div>
                  <div className="requirement-item">
                    <span className="requirement-label">Complexity:</span>
                    <span className="requirement-value">{job.requirements?.designComplexity}</span>
                  </div>
                  {job.requirements?.specialInstructions && (
                    <div className="requirement-item">
                      <span className="requirement-label">Special Instructions:</span>
                      <span className="requirement-value">{job.requirements.specialInstructions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="job-sidebar">
              {/* Only show Send Proposal section for artists */}
              {user?.userType !== 'client' && (
              <div className="proposal-card">
                <h3>Send Proposal</h3>
                <p>Interested in this job? Send a proposal to the client.</p>
                                       <button
                         onClick={() => {
                           console.log('Send Proposal button clicked, isAuthenticated:', isAuthenticated);
                           console.log('About to open modal...');
                           setError(''); // Clear any previous errors
                           setShowProposalModal(true);
                         }}
                         className="send-proposal-btn"
                         disabled={!isAuthenticated}
                       >
                         Send Proposal
                       </button>
                <div className="proposal-stats">
                  <p>{job.applicationsCount || 0} proposals received</p>
                </div>
              </div>
              )}

              <div className="job-stats">
                <h4>Job Information</h4>
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className={`stat-value status-${job.status}`}>{job.status}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Category:</span>
                  <span className="stat-value">{job.category}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Priority:</span>
                  <span className="stat-value">{job.priority}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Proposals Section */}
          <div className="proposals-section">
            <div className="proposals-header">
              <h2>Proposals Received ({proposals.length})</h2>
              <p>Here are all the proposals submitted for this job.</p>
            </div>
            
            {proposalsLoading ? (
              <div className="proposals-loading">
                <div className="loading-spinner"></div>
                <p>Loading proposals...</p>
              </div>
            ) : proposalsError ? (
              <div className="proposals-error">
                <p>{proposalsError}</p>
                <button onClick={fetchJobProposals} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : proposals.length === 0 ? (
              <div className="no-proposals">
                <div className="no-proposals-icon">📝</div>
                <h3>No proposals yet</h3>
                <p>This job hasn't received any proposals yet. Artists can submit proposals using the form above.</p>
              </div>
            ) : (
              <div className="proposals-list">
                {proposals.map((proposal) => (
                  <div key={proposal._id} className="proposal-item">
                    <div className="proposal-header">
                      <div className="artist-info">
                        <div className="artist-avatar">
                          {proposal.artist?.firstName?.charAt(0)}{proposal.artist?.lastName?.charAt(0)}
                        </div>
                        <div className="artist-details">
                          <h4 className="artist-name">
                            {proposal.artist?.firstName} {proposal.artist?.lastName}
                          </h4>
                          <p className="artist-location">{proposal.artist?.location?.city || 'Location not specified'}</p>
                        </div>
                      </div>
                      <div className="proposal-meta">
                        <span className="proposal-price">£{proposal.pricing?.totalPrice}</span>
                        <span className={`proposal-status ${proposal.status}`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="proposal-content">
                      <div className="proposal-message">
                        <h5>Proposal Message</h5>
                        <p>{proposal.message || proposal.coverLetter}</p>
                      </div>
                      
                      <div className="proposal-details">
                        <div className="proposal-detail-item">
                          <strong>Duration:</strong> {proposal.timeline?.estimatedDuration?.value} {proposal.timeline?.estimatedDuration?.unit}
                        </div>
                        <div className="proposal-detail-item">
                          <strong>Experience:</strong> {proposal.experience?.relevantExperience} years
                        </div>
                        <div className="proposal-detail-item">
                          <strong>Submitted:</strong> {new Date(proposal.submittedAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      
                      {user?.userType === 'client' && proposal.status === 'pending' && (
                        <div className="proposal-actions">
                          <button 
                            className="accept-proposal-btn"
                            onClick={() => handleAcceptProposal(proposal._id)}
                          >
                            Accept Proposal
                          </button>
                          <button 
                            className="reject-proposal-btn"
                            onClick={() => handleRejectProposal(proposal._id)}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

                       {/* Proposal Modal */}
               {showProposalModal && (
                 <div className="modal-overlay" onClick={() => console.log('Modal overlay clicked')}>
            <div className="modal">
              <div className="modal-header">
                <h3>Send Proposal</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowProposalModal(false);
                    setError('');
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="job-summary">
                  <h4>{job.title}</h4>
                  <p>Client: {job.client ? `${job.client.firstName} ${job.client.lastName}` : 'Client'} • {job.location?.city}</p>
                  <p>Budget: £{job.budget?.min}-{job.budget?.max}</p>
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
                    className="btn-secondary"
                    onClick={() => {
                      setShowProposalModal(false);
                      setError('');
                    }}
                    disabled={submittingProposal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSendProposal}
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
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JobDetails; 