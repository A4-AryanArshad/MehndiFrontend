import React, { useState } from 'react';
import Header from './Header';

const ProposalsPage = () => {
  const [activeFilter, setActiveFilter] = useState('active');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(1); // Default to first request expanded

  // Mock data for requests
  const [requests] = useState([
    {
      id: 1,
      title: 'Bridal Mehndi for August',
      location: 'London',
      date: '29 July 2025',
      status: 'open',
      proposalCount: 3
    },
    {
      id: 2,
      title: 'Eid Mehndi Party',
      location: 'Birmingham',
      date: '10 April 2025',
      status: 'open',
      proposalCount: 1
    }
  ]);

  // Mock data for proposals
  const [proposals] = useState({
    1: [
      {
        id: 1,
        artistName: 'Newartisttest',
        artistInitials: 'NE',
        rating: 4.5,
        location: 'London',
        price: '£566.00',
        time: '6 hrs',
        status: 'declined'
      },
      {
        id: 2,
        artistName: 'Henna by Aisha',
        artistInitials: 'HE',
        rating: 4.9,
        location: 'London',
        price: '£520.00',
        time: '5 hrs',
        status: 'pending'
      },
      {
        id: 3,
        artistName: 'ArtistryByX',
        artistInitials: 'AR',
        rating: 5.0,
        location: 'London',
        price: '£600.00',
        time: '7 hrs',
        status: 'accepted'
      }
    ],
    2: [
      {
        id: 4,
        artistName: 'Creative Henna',
        artistInitials: 'CH',
        rating: 4.7,
        location: 'Birmingham',
        price: '£300.00',
        time: '4 hrs',
        status: 'pending'
      }
    ]
  });

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleAccept = (proposal) => {
    setSelectedProposal(proposal);
    setShowAcceptModal(true);
  };

  const handleDecline = (proposal) => {
    setSelectedProposal(proposal);
    setShowDeclineModal(true);
  };

  const handleConfirmAccept = () => {
    console.log('Accepted proposal:', selectedProposal);
    setShowAcceptModal(false);
    setSelectedProposal(null);
  };

  const handleConfirmDecline = () => {
    console.log('Declined proposal:', selectedProposal);
    setShowDeclineModal(false);
    setSelectedProposal(null);
  };

  const handleToggleExpanded = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">⏰ Pending</span>;
      case 'accepted':
        return <span className="status-badge accepted">✅ Accepted</span>;
      case 'declined':
        return <span className="status-badge declined">❌ Declined</span>;
      default:
        return <span className="status-badge pending">⏰ Pending</span>;
    }
  };

  const getActionButtons = (proposal) => {
    if (proposal.status === 'pending') {
      return (
        <div className="proposal-actions">
          <button 
            className="accept-btn"
            onClick={() => handleAccept(proposal)}
          >
            Accept
          </button>
          <button 
            className="decline-btn"
            onClick={() => handleDecline(proposal)}
          >
            Decline
          </button>
          <button className="message-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      );
    } else {
      return (
        <div className="proposal-actions">
          <button className="message-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      );
    }
  };

  return (
    <>
      <Header />
      <div className="proposals-page">
        {/* Filter Tabs */}
        <div className="proposals-filters">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Requests (2)
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => handleFilterChange('active')}
            >
              Active (2)
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => handleFilterChange('completed')}
            >
              Completed (0)
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="filter-controls">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search requests" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filters-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="requests-container">
          {requests.map(request => (
            <div key={request.id} className="request-section">
              {/* Request Header */}
              <div className="request-header">
                <div className="request-info">
                  <h3 className="request-title">{request.title}</h3>
                  <p className="request-details">{request.location} • {request.date}</p>
                </div>
                <div className="request-controls">
                  <span className="status-badge open">Open</span>
                  <span className="proposal-count">{request.proposalCount} proposal{request.proposalCount !== 1 ? 's' : ''}</span>
                  <button 
                    className="expand-toggle"
                    onClick={() => handleToggleExpanded(request.id)}
                  >
                    {expandedRequest === request.id ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Collapse
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Expand
                      </>
                    )}
                  </button>
                  <button className="edit-btn">✏️</button>
                  <button className="close-btn">✕</button>
                </div>
              </div>

              {/* Expanded Proposals Table */}
              {expandedRequest === request.id && (
                <div className="proposals-table-section">
                  <div className="proposals-header">
                    <h4>Recent Proposals</h4>
                    <div className="sort-controls">
                      <span>Sort</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                      >
                        <option value="date">Date</option>
                        <option value="price">Price</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  <div className="proposals-table">
                    <div className="table-header">
                      <span className="col-artist">Artist</span>
                      <span className="col-price">Price/Time</span>
                      <span className="col-status">Status</span>
                      <span className="col-actions">Actions</span>
                    </div>

                    {proposals[request.id]?.map(proposal => (
                      <div key={proposal.id} className="table-row">
                        <div className="col-artist">
                          <div className="artist-info">
                            <div className="artist-avatar">
                              {proposal.artistInitials}
                            </div>
                            <div className="artist-details">
                              <span className="artist-name">{proposal.artistName}</span>
                              <div className="artist-meta">
                                <span className="rating">⭐ {proposal.rating}</span>
                                <span className="location">• {proposal.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-price">
                          <span className="price">{proposal.price}</span>
                          <span className="time">{proposal.time}</span>
                        </div>
                        <div className="col-status">
                          {getStatusBadge(proposal.status)}
                        </div>
                        <div className="col-actions">
                          {getActionButtons(proposal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Accept Modal */}
        {showAcceptModal && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h3 className="modal-title">Accept Proposal?</h3>
              <p className="modal-text">
                This will confirm the booking and decline all other proposals for this request.
              </p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleConfirmAccept}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h3 className="modal-title">Decline Proposal?</h3>
              <p className="modal-text">
                This proposal will be marked as declined. You can't undo this action.
              </p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeclineModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn decline"
                  onClick={handleConfirmDecline}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProposalsPage; 