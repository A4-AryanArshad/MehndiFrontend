import React from 'react';

const Sponsor = () => {
  const sponsors = [
    '/assets/img/sponsors1.png',
    '/assets/img/sponsors2.png',
    '/assets/img/sponsors3.png',
    '/assets/img/sponsors4.png',
    '/assets/img/sponsors5.png'
  ];

  return (
    <section className="sponsor section">
      <div className="sponsor__container container grid">
        {sponsors.map((sponsor, index) => (
          <div key={index} className="sponsor__content">
            <img src={sponsor} alt="" className="sponsor__img" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Sponsor; 