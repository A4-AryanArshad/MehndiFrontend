import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const dataRef = useRef(null);
  const imagesRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate text content from left
      gsap.fromTo(dataRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animate images from right
      gsap.fromTo(imagesRef.current,
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          },
          delay: 0.3
        }
      );

      // Add hover animations to images
      const images = imagesRef.current.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('mouseenter', () => {
          gsap.to(img, { scale: 1.1, duration: 0.3, ease: "power2.out" });
        });

        img.addEventListener('mouseleave', () => {
          gsap.to(img, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about section" id="about" ref={sectionRef}>
      <div className="about__container container grid">
        <div className="about__data" ref={dataRef}>
          <h2 className="section__title about__title">More Information <br /> About Our Mehndi Platform</h2>
          <p className="about__description">
            Connect with the most talented and skilled mehndi artists at the best 
            prices with verified profiles. Whether you're a client looking for beautiful designs or an artist wanting to grow your business, we'll guide you all the way. Join our community now.
          </p>
          <a href="#" className="button">Find Artists</a>
        </div>

        <div className="about__img" ref={imagesRef}>
          <div className="about__img-overlay">
            <img src="https://images.unsplash.com/photo-1525135850648-b42365991054?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="about__img-one" />
          </div>

          <div className="about__img-overlay">
            <img src="https://plus.unsplash.com/premium_photo-1661896237419-6e232b54eefc?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="about__img-two" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 