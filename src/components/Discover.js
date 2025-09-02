import React, { useEffect } from 'react';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Discover = () => {
  useEffect(() => {
    const swiper = new Swiper('.discover__container', {
      modules: [Navigation, Pagination, Autoplay],
      spaceBetween: 30,
      slidesPerView: 1,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
    });

    return () => {
      if (swiper) {
        swiper.destroy();
      }
    };
  }, []);

  const discoverData = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1556536088-f010a312a8d3?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Bridal Mehndi',
      description: '150+ artists available'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1566829682463-2aa5f6c8afd8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Party Mehndi',
      description: '80+ artists available'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1572969147844-920fff94e326?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Festival Mehndi',
      description: '120+ artists available'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1628834556809-fd4d8acad67c?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Arabic Mehndi',
      description: '90+ artists available'
    }
  ];

  return (
    <section className="discover section" id="discover">
      <h2 className="section__title">Discover the most <br /> popular mehndi styles</h2>
      
      <div className="discover__container container swiper-container">
        <div className="swiper-wrapper">
          {discoverData.map((item) => (
            <div key={item.id} className="discover__card swiper-slide">
              <img src={item.image} alt="" className="discover__img" />
              <div className="discover__data">
                <h2 className="discover__title">{item.title}</h2>
                <span className="discover__description">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Swiper Navigation */}
        <div className="swiper-button-next"></div>
        <div className="swiper-button-prev"></div>
        
        {/* Swiper Pagination */}
        <div className="swiper-pagination"></div>
      </div>
    </section>
  );
};

export default Discover; 