import React from 'react';

const Place = () => {
  const placesData = [
    {
      id: 1,
      image: '/assets/img/place1.jpg',
      title: 'Singapore',
      subtitle: 'Singapore',
      price: '$6,500',
      rating: '4.8',
      location: 'Singapore'
    },
    {
      id: 2,
      image: '/assets/img/place2.jpg',
      title: 'Bora Bora',
      subtitle: 'French Polynesia',
      price: '$8,500',
      rating: '4.8',
      location: 'French Polynesia'
    },
    {
      id: 3,
      image: '/assets/img/place3.jpg',
      title: 'Nusa Penida',
      subtitle: 'Indonesia',
      price: '$6,500',
      rating: '4.8',
      location: 'Indonesia'
    },
    {
      id: 4,
      image: '/assets/img/place4.jpg',
      title: 'Cape Town',
      subtitle: 'South Africa',
      price: '$4,500',
      rating: '4.8',
      location: 'South Africa'
    },
    {
      id: 5,
      image: '/assets/img/place5.jpg',
      title: 'Yosemite',
      subtitle: 'United States',
      price: '$6,500',
      rating: '4.8',
      location: 'United States'
    }
  ];

  return (
    <section className="place section" id="place">
      <h2 className="section__title">Choose Your Place <br /> And Start Your Journey</h2>

      <div className="place__container container grid">
        {placesData.map((place) => (
          <div key={place.id} className="place__card">
            <img src={place.image} alt="" className="place__img" />
            <div className="place__content">
              <span className="place__rating">
                <i className="ri-star-s-fill"></i> {place.rating}
              </span>
              <div className="place__data">
                <h3 className="place__title">{place.title}</h3>
                <span className="place__subtitle">{place.subtitle}</span>
                <span className="place__price">{place.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Place; 