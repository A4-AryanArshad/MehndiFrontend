import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const numbersRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animate numbers with counter effect
      numbersRef.current.forEach((numberElement, index) => {
        if (numberElement) {
          const finalNumber = numberElement.textContent;
          numberElement.textContent = "0";

          gsap.fromTo(numberElement,
            { opacity: 0, scale: 0.5 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: numberElement,
                start: "top 85%",
                toggleActions: "play none none reverse"
              },
              delay: index * 0.2,
              onComplete: () => {
                // Animate the number counting up
                const obj = { number: 0 };
                const target = parseInt(finalNumber.replace(/[^0-9]/g, '')) || 0;
                const suffix = finalNumber.replace(/[0-9]/g, '');
                
                gsap.to(obj, {
                  number: target,
                  duration: 2,
                  ease: "power2.out",
                  onUpdate: () => {
                    numberElement.textContent = Math.round(obj.number) + suffix;
                  }
                });
              }
            }
          );
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToNumbersRef = (el) => {
    if (el && !numbersRef.current.includes(el)) {
      numbersRef.current.push(el);
    }
  };

  return (
    <section className="experience section" ref={sectionRef}>
      <h2 className="section__title" ref={titleRef}>With Our Platform <br /> We Connect You Perfectly</h2>

      <div className="experience__container container grid">
        <div className="experience__content grid">
          <div className="experience__data">
            <h2 className="experience__number" ref={addToNumbersRef}>500+</h2>
            <span className="experience__description">Verified <br /> Artists</span>
          </div>

          <div className="experience__data">
            <h2 className="experience__number" ref={addToNumbersRef}>2K+</h2>
            <span className="experience__description">Completed <br /> Bookings</span>
          </div>

          <div className="experience__data">
            <h2 className="experience__number" ref={addToNumbersRef}>50+</h2>
            <span className="experience__description">Cities <br /> Covered</span>
          </div>
        </div>

        <div className="experience__img grid">
          <div className="experience__overlay">
            <img src="https://images.unsplash.com/photo-1680490964820-7afb13f2e35c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="experience__img-one" />
          </div>
          
          <div className="experience__overlay">
            <img src="https://images.unsplash.com/photo-1716672042560-c59ebb0805e6?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="experience__img-two" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience; 