import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('artists');
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const pathRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reset stepsRef for new activeTab
      stepsRef.current = [];

      // Set initial states for all elements
      gsap.set([headerRef.current, tabsRef.current], {
        opacity: 0,
        y: 50
      });

      // Create main timeline
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          onEnter: () => {
            // Animate header first
            gsap.to(headerRef.current, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out"
            });

            // Then animate tabs
            gsap.to(tabsRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: 0.3
            });

            // Start path animation
            if (pathRef.current) {
              const pathLength = pathRef.current.getTotalLength();
              gsap.set(pathRef.current, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                opacity: 0
              });

              gsap.to(pathRef.current, {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 2.5,
                ease: "power2.inOut",
                delay: 0.8
              });
            }

            // Animate steps after a delay
            setTimeout(() => {
              stepsRef.current.forEach((step, index) => {
                if (step) {
                  gsap.fromTo(step,
                    { 
                      opacity: 0, 
                      scale: 0.3, 
                      y: 100,
                      rotation: 15 
                    },
                    {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotation: 0,
                      duration: 1,
                      ease: "back.out(1.7)",
                      delay: index * 0.3
                    }
                  );
                }
              });
            }, 1200);
          },
          onLeave: () => {
            // Reverse animations when leaving
            gsap.to([headerRef.current, tabsRef.current], {
              opacity: 0,
              y: -30,
              duration: 0.5,
              ease: "power2.in"
            });
          },
          onEnterBack: () => {
            // Re-animate when scrolling back
            gsap.to([headerRef.current, tabsRef.current], {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out"
            });
          }
        }
      });

      // Add individual step scroll triggers
      stepsRef.current.forEach((step, index) => {
        if (step) {
          // Add hover animations
          step.addEventListener('mouseenter', () => {
            gsap.to(step, { 
              scale: 1.08, 
              y: -10,
              duration: 0.4, 
              ease: "power2.out",
              boxShadow: "0 20px 60px rgba(139, 115, 85, 0.3)"
            });
          });

          step.addEventListener('mouseleave', () => {
            gsap.to(step, { 
              scale: 1, 
              y: 0,
              duration: 0.4, 
              ease: "power2.out",
              boxShadow: "0 12px 40px rgba(139, 115, 85, 0.15)"
            });
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [activeTab]);

  const addToStepsRef = (el) => {
    if (el && !stepsRef.current.includes(el)) {
      stepsRef.current.push(el);
    }
  };

  const artistsSteps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Add styles, coverage, portfolio, and pricing ranges.",
      icon: "👤"
    },
    {
      number: 2,
      title: "Discover Requests",
      description: "Browse client requests that match your expertise.",
      icon: "📧"
    },
    {
      number: 3,
      title: "Send Proposals",
      description: "Submit tailored offers with your pricing and availability.",
      icon: "💬"
    },
    {
      number: 4,
      title: "Get Booked",
      description: "Connect with clients and grow your business.",
      icon: "🔗"
    }
  ];

  const clientsSteps = [
    {
      number: 1,
      title: "Post Your Request",
      description: "Tell us the date, location, style, and coverage.",
      icon: "👤"
    },
    {
      number: 2,
      title: "Receive Offers",
      description: "Artists send tailored proposals with pricing ranges.",
      icon: "📧"
    },
    {
      number: 3,
      title: "Compare & Chat",
      description: "View portfolios, message artists, and refine details.",
      icon: "💬"
    },
    {
      number: 4,
      title: "Book Securely",
      description: "Confirm the artist you love and pay safely.",
      icon: "🔗"
    }
  ];

  const currentSteps = activeTab === 'artists' ? artistsSteps : clientsSteps;

  return (
    <section className="how-it-works" id="how-it-works" ref={sectionRef}>
      <div className="how-it-works__container container">
        {/* Toggle Tabs */}
        <div className="how-it-works__tabs" ref={tabsRef}>
          <button 
            className={`how-it-works__tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <span className="tab-icon">👥</span>
            Clients
          </button>
          <button 
            className={`how-it-works__tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            <span className="tab-icon">🎨</span>
            Artists
          </button>
        </div>

        {/* Section Title */}
        <div className="how-it-works__header" ref={headerRef}>
          <h2 className="how-it-works__title">
            How It Works — For {activeTab === 'artists' ? 'Artists' : 'Clients'}
          </h2>
          <p className="how-it-works__subtitle">
            {activeTab === 'artists' 
              ? 'Build your mehndi business and connect with clients in four simple steps.'
              : 'Simple steps to find and book your perfect mehndi artist.'
            }
          </p>
        </div>

        {/* Steps with Flowing Path */}
        <div className="how-it-works__flow">
          <svg className="how-it-works__path" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
            {/* Complete rope path: Circle 1 → Circle 2 → Down → Circle 3 → Circle 4 */}
            <path 
              ref={pathRef}
              className="vine-path"
              d="M 150,120 Q 400,80 650,120 Q 800,150 850,200 Q 880,250 850,300 Q 820,350 750,380 Q 650,420 550,460 Q 450,500 350,580 Q 280,615 220,600 Q 160,585 120,550 Q 80,515 100,470 Q 120,425 170,400 Q 220,375 280,380 Q 340,385 400,410 Q 460,435 520,470 Q 580,505 640,550 Q 700,595 760,640 Q 820,685 870,730"
              fill="none"
              stroke="#A0522D"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Small oval leaf decorations following the complete path */}
            <g className="vine-decorations">
              {/* Leaves on the 1→2 path - precisely on the horizontal curve */}
              <ellipse cx="350" cy="95" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(5 350 95)"/>
              <ellipse cx="550" cy="88" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(-8 550 88)"/>
              
              {/* Leaves on the 2→3 path - exactly on the downward curve */}
              <ellipse cx="850" cy="160" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(35 850 160)"/>
              <ellipse cx="820" cy="220" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(50 820 220)"/>
              <ellipse cx="650" cy="340" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(-25 650 340)"/>
              
              {/* Leaves on the 3→4 path - on the curve to circle 4 */}
              <ellipse cx="180" cy="410" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(-30 180 410)"/>
              <ellipse cx="320" cy="450" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(10 320 450)"/>
              <ellipse cx="480" cy="500" rx="8" ry="4" fill="#CD853F" opacity="0.8" transform="rotate(20 480 500)"/>
            </g>
          </svg>

          {/* Step Circles */}
          <div className="how-it-works__steps">
            {currentSteps.map((step, index) => (
              <div 
                key={step.number}
                ref={addToStepsRef}
                className={`how-it-works__step step-${step.number}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="step__circle-container">
                  <div className="step__circle">
                    <div className="step__number">{step.number}</div>

                    <div className="step__content-inside">
                      <h3 className="step__title-inside">{step.title}</h3>
                      <p className="step__description-inside">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 