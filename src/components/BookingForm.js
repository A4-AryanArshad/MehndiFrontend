import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import apiService from '../services/api';

const { jobsAPI } = apiService;

const BookingForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    // Contact Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Event Details
    eventType: [],
    otherEvent: '',
    eventDate: '',
    preferredTime: [],
    location: '',
    artistTravel: '',
    duration: '',
    guestCount: '',
    
    // Style Details
    designStyle: '',
    complexity: '',
    bodyParts: [],
    inspiration: '',
    
    // Budget
    budgetMin: '',
    budgetMax: '',
    
    // Additional Info
    additionalRequests: '',
    venueName: '',
    coveragePreference: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const steps = [
    { id: 1, name: 'Contact' },
    { id: 2, name: 'Event' },
    { id: 3, name: 'Style' },
    { id: 4, name: 'Budget' },
    { id: 5, name: 'Review' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'eventType' || name === 'preferredTime' || name === 'bodyParts') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form submission started...');
    console.log('Current form data:', formData);
    console.log('Is authenticated:', isAuthenticated);

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please log in to submit a booking request');
      return;
    }

    // Validate required fields - more flexible validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone',
      'eventType', 'eventDate', 'budgetMin', 'budgetMax'
    ];

    // Check which fields are missing
    const missingFields = [];
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      
      // Navigate to the step with missing fields
      if (missingFields.some(field => ['firstName', 'lastName', 'email', 'phone'].includes(field))) {
        setCurrentStep(1);
        setError('Please complete the Contact Details in Step 1');
      } else if (missingFields.some(field => ['eventType', 'eventDate'].includes(field))) {
        setCurrentStep(2);
        setError('Please complete the Event Details in Step 2');
      } else if (missingFields.some(field => ['budgetMin', 'budgetMax'].includes(field))) {
        setCurrentStep(4);
        setError('Please complete the Budget information in Step 4');
      } else {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }
      return;
    }

    if (parseInt(formData.budgetMax) <= parseInt(formData.budgetMin)) {
      setError('Maximum budget must be greater than minimum budget');
      return;
    }

    // Check if event date is in the future
    const eventDate = new Date(formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    if (eventDate <= today) {
      setCurrentStep(2);
      setError('Event date must be in the future. Please select a date after today.');
      return;
    }

    setIsLoading(true);

    try {
      // Transform form data to match backend schema
      const baseDescription = `${formData.inspiration || 'Beautiful henna design requested'} ${formData.additionalRequests ? `. Additional requirements: ${formData.additionalRequests}` : ''}`;
      
      // Ensure description is at least 50 characters (backend requirement)
      const description = baseDescription.length < 50 
        ? baseDescription + '. Looking forward to beautiful traditional henna designs for this special event.'
        : baseDescription;
      
      const jobData = {
        title: `${formData.eventType.join(', ')} - ${formData.designStyle || 'Henna Design'}`,
        description,
        category: getJobCategory(formData.designStyle),
        
        eventDetails: {
          eventType: getEventType(formData.eventType[0]),
          eventDate: new Date(formData.eventDate + 'T12:00:00'),
          eventTime: formatEventTime(formData.preferredTime[0]) || '10:00',
          duration: {
            estimated: parseInt(formData.duration) || 3
          },
          guestCount: parseInt(formData.guestCount) || 1
        },
        
        location: {
          address: formData.address || 'To be confirmed',
          city: formData.city || 'London',
          postalCode: formData.postalCode || 'SW1A 1AA',
          country: 'UK'
        },
        
        budget: {
          min: parseInt(formData.budgetMin),
          max: parseInt(formData.budgetMax),
          currency: 'GBP',
          negotiable: true
        },
        
        requirements: {
          designStyle: formData.designStyle ? [formData.designStyle.toLowerCase()] : ['traditional'],
          designComplexity: (formData.complexity || 'medium').toLowerCase(),
          specialInstructions: formData.additionalRequests || ''
        },
        
        status: 'open',
        priority: 'medium',
        visibility: 'public'
      };

      console.log('Submitting job data:', jobData);
      console.log('Job data JSON:', JSON.stringify(jobData, null, 2));

      const response = await jobsAPI.createJob(jobData);
      
      console.log('Job created successfully:', response);
      setSuccess('Your booking request has been posted successfully! Artists will start sending you proposals soon.');
      
      // Clear form
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        eventType: [], otherEvent: '', eventDate: '', preferredTime: [],
        location: '', artistTravel: '', duration: '', guestCount: '',
        designStyle: '', complexity: '', bodyParts: [], inspiration: '',
        budgetMin: '', budgetMax: '', additionalRequests: '', venueName: '',
        coveragePreference: '', address: '', city: '', postalCode: ''
      });
      
      // Reset to first step
      setCurrentStep(1);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Job creation error:', error);
      
      // If it's a validation error, show more specific information
      if (error.message.includes('Validation errors')) {
        setError('Please check all required fields. Make sure budget amounts are filled in correctly.');
      } else {
        setError(error.message || 'Failed to submit booking request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to map form data to backend enums
  const getJobCategory = (designStyle) => {
    const categoryMap = {
      'traditional': 'traditional',
      'modern': 'modern',
      'arabic': 'arabic',
      'indian': 'indian',
      'bridal': 'bridal'
    };
    return categoryMap[designStyle?.toLowerCase()] || 'other';
  };

  const getEventType = (eventType) => {
    const eventMap = {
      'wedding': 'wedding',
      'engagement': 'engagement',
      'birthday': 'birthday',
      'festival': 'festival',
      'corporate': 'corporate',
      'baby shower': 'baby_shower'
    };
    return eventMap[eventType?.toLowerCase()] || 'other';
  };

  const formatEventTime = (timeString) => {
    if (!timeString) return '10:00';
    
    // If it's already in HH:MM format, return as is
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }
    
    // Convert common time formats to HH:MM
    const timeMap = {
      'morning': '10:00',
      'afternoon': '14:00',
      'evening': '18:00',
      'night': '20:00'
    };
    
    return timeMap[timeString?.toLowerCase()] || '10:00';
  };

  return (
    <>
      <Header />
      <div className="booking-container">
        <div className="booking-header">
          <p className="booking-notice">To post a request - client must sign in or sign up</p>
          <h1 className="booking-title">Post a Mehndi Request (Booking Form)</h1>
          <p className="booking-subtitle">
            Tell Us What You Need – Artists Will Apply to You!
          </p>
          <p className="booking-description">
            Sit back and let artists send you offers based on your event, budget, and style.
          </p>
        </div>

        <div className="booking-form-container">
          {/* Progress Bar */}
          <div className="progress-bar">
            {steps.map((step, index) => (
              <div key={step.id} className="progress-step-container">
                <div 
                  className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
                >
                  <span className="step-number">{step.id}</span>
                  <span className="step-name">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`progress-line ${currentStep > step.id ? 'completed' : ''}`}></div>
                )}
              </div>
            ))}
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            {/* Step 1: Contact Details */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="step-header">
                  <h2 className="step-title">Contact Details</h2>
                  <p className="step-subtitle">We need your contact information to get started</p>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="step-header">
                  <h2 className="step-title">🎉 Event Details</h2>
                  <p className="step-subtitle">Tell us about your special occasion</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Type *</label>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="eventType"
                        value="Wedding"
                        checked={formData.eventType.includes('Wedding')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Wedding</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="eventType"
                        value="Eid"
                        checked={formData.eventType.includes('Eid')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Eid</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="eventType"
                        value="Party"
                        checked={formData.eventType.includes('Party')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Party</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="eventType"
                        value="Festival"
                        checked={formData.eventType.includes('Festival')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Festival</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    name="otherEvent"
                    className="form-input"
                    placeholder="Other:"
                    value={formData.otherEvent}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    className="form-input"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time Slot *</label>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="preferredTime"
                        value="Morning"
                        checked={formData.preferredTime.includes('Morning')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Morning</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="preferredTime"
                        value="Afternoon"
                        checked={formData.preferredTime.includes('Afternoon')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Afternoon</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="preferredTime"
                        value="Evening"
                        checked={formData.preferredTime.includes('Evening')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Evening</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="preferredTime"
                        value="Flexible"
                        checked={formData.preferredTime.includes('Flexible')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Flexible</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Postcode *</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="Enter your location or postcode"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Do you want the artist to come to you? *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="artistTravel"
                        value="yes"
                        checked={formData.artistTravel === 'yes'}
                        onChange={handleInputChange}
                        className="radio-input"
                      />
                      <span className="radio-text">Yes, I'd like the artist to travel to my home</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="artistTravel"
                        value="no"
                        checked={formData.artistTravel === 'no'}
                        onChange={handleInputChange}
                        className="radio-input"
                      />
                      <span className="radio-text">No, I can travel to the artist</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Style Details */}
            {currentStep === 3 && (
              <div className="form-step">
                <div className="step-header">
                  <h2 className="step-title">Style Preferences</h2>
                  <p className="step-subtitle">Help us understand your desired henna style</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Design Style *</label>
                  <select
                    name="designStyle"
                    className="form-input"
                    value={formData.designStyle}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a style</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Modern">Modern</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Indian">Indian</option>
                    <option value="Moroccan">Moroccan</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Bridal">Bridal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Design Complexity *</label>
                  <select
                    name="complexity"
                    className="form-input"
                    value={formData.complexity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select complexity</option>
                    <option value="Simple">Simple</option>
                    <option value="Medium">Medium</option>
                    <option value="Complex">Complex</option>
                    <option value="Very Complex">Very Complex</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Body Parts to be decorated *</label>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="bodyParts"
                        value="Hands"
                        checked={formData.bodyParts.includes('Hands')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Hands</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="bodyParts"
                        value="Feet"
                        checked={formData.bodyParts.includes('Feet')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Feet</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="bodyParts"
                        value="Arms"
                        checked={formData.bodyParts.includes('Arms')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Arms</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="bodyParts"
                        value="Back"
                        checked={formData.bodyParts.includes('Back')}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Back</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Design Inspiration</label>
                  <textarea
                    name="inspiration"
                    className="form-textarea"
                    placeholder="Describe your vision or any specific design elements you'd like..."
                    value={formData.inspiration}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {currentStep === 4 && (
              <div className="form-step">
                <div className="step-header">
                  <h2 className="step-title">Budget Range</h2>
                  <p className="step-subtitle">Help artists provide accurate quotes</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Minimum Budget (£) *</label>
                    <input
                      type="number"
                      name="budgetMin"
                      className="form-input"
                      placeholder="50"
                      value={formData.budgetMin}
                      onChange={handleInputChange}
                      min="50"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Maximum Budget (£) *</label>
                    <input
                      type="number"
                      name="budgetMax"
                      className="form-input"
                      placeholder="500"
                      value={formData.budgetMax}
                      onChange={handleInputChange}
                      min="50"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (Hours) *</label>
                    <input
                      type="number"
                      name="duration"
                      className="form-input"
                      placeholder="3"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of People *</label>
                    <input
                      type="number"
                      name="guestCount"
                      className="form-input"
                      placeholder="5"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Address *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      placeholder="London"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-input"
                      placeholder="SW1A 1AA"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Requests</label>
                  <textarea
                    name="additionalRequests"
                    className="form-textarea"
                    placeholder="Any special requirements, allergies, or additional information..."
                    value={formData.additionalRequests}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Venue Name (Optional)</label>
                  <input
                    type="text"
                    name="venueName"
                    className="form-input"
                    placeholder="Enter venue name if applicable"
                    value={formData.venueName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Coverage Preference (for bridal) (Optional)</label>
                  <select
                    name="coveragePreference"
                    className="form-input"
                    value={formData.coveragePreference}
                    onChange={handleInputChange}
                  >
                    <option value="">Select coverage</option>
                    <option value="Light">Light Coverage</option>
                    <option value="Medium">Medium Coverage</option>
                    <option value="Full">Full Coverage</option>
                    <option value="Bridal Package">Bridal Package</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="form-step">
                <div className="step-header">
                  <h2 className="step-title">Review Your Request</h2>
                  <p className="step-subtitle">Please review your details before submitting</p>
                </div>

                <div className="review-section">
                  <h3>Contact Information</h3>
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                </div>

                <div className="review-section">
                  <h3>Event Details</h3>
                  <p><strong>Event Type:</strong> {formData.eventType.join(', ')} {formData.otherEvent}</p>
                  <p><strong>Date:</strong> {formData.eventDate}</p>
                  <p><strong>Time:</strong> {formData.preferredTime.join(', ')}</p>
                  <p><strong>Location:</strong> {formData.location}</p>
                  <p><strong>Artist Travel:</strong> {formData.artistTravel === 'yes' ? 'Yes' : 'No'}</p>
                </div>

                <div className="review-section">
                  <h3>Style Preferences</h3>
                  <p><strong>Style:</strong> {formData.designStyle}</p>
                  <p><strong>Complexity:</strong> {formData.complexity}</p>
                  <p><strong>Body Parts:</strong> {formData.bodyParts.join(', ')}</p>
                  {formData.inspiration && <p><strong>Inspiration:</strong> {formData.inspiration}</p>}
                </div>

                <div className="review-section">
                  <h3>Budget & Additional Info</h3>
                  <p><strong>Budget:</strong> £{formData.budgetMin || 0} - £{formData.budgetMax || 0}</p>
                  <p><strong>Duration:</strong> {formData.duration || 3} hours</p>
                  <p><strong>Number of People:</strong> {formData.guestCount || 1}</p>
                  {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                  {formData.city && <p><strong>City:</strong> {formData.city}</p>}
                  {formData.postalCode && <p><strong>Postal Code:</strong> {formData.postalCode}</p>}
                  {formData.additionalRequests && <p><strong>Additional Requests:</strong> {formData.additionalRequests}</p>}
                  {formData.venueName && <p><strong>Venue:</strong> {formData.venueName}</p>}
                  {formData.coveragePreference && <p><strong>Coverage:</strong> {formData.coveragePreference}</p>}
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="error-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                {success}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                >
                  Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="loading-spinner" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookingForm; 