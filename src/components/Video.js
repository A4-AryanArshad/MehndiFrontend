import React from 'react';

const Video = () => {
  return (
    <section className="video section">
      <h2 className="section__title">Video Tour</h2>

      <div className="video__container container">
        <p className="video__description">Find out more about our destinations</p>

        <div className="video__content">
          <video id="video-file">
            <source src="/assets/video/video.mp4" type="video/mp4" />
          </video>

          <button className="video__button" id="video-button">
            <i className="ri-play-line" id="video-icon"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Video; 