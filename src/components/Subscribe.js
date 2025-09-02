import React, { useState } from 'react';

const Subscribe = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Subscribing with email:', email);
    setEmail('');
  };

  return (
    <section className="subscribe section" id="subscribe">
      <div className="subscribe__container container">
        <h2 className="section__title">Subscribe Our <br /> Newsletter</h2>
        <p className="subscribe__description">
          Subscribe to our newsletter and get special offers, mehndi tips, artist spotlights, and updates 
          about the latest trends in mehndi designs and our platform.
        </p>
        
        <form onSubmit={handleSubmit} className="subscribe__form">
          <input
            type="email"
            placeholder="Enter your email"
            className="subscribe__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="button">Subscribe</button>
        </form>
      </div>
    </section>
  );
};

export default Subscribe; 