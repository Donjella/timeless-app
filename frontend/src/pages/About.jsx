import React from 'react';
import '../styles/about.css';

const About = () => {
  return (
    <div className="about-page">
      <h1>About Timeless</h1>

      <section>
        <h2>Our Story</h2>
        <p>
          Founded in 2025 by Brendon and Stephen, Timeless was born from a
          passion for luxury watches and the belief that extraordinary
          timepieces should be accessible to everyone. We recognized that many
          watch enthusiasts dream of experiencing premium watches without the
          hefty price tag of ownership.
        </p>
      </section>

      <section>
        <h2>Our Mission</h2>
        <p>
          At Timeless, our mission is to democratize luxury watch experiences.
          We curate an exceptional collection of high-end timepieces, allowing
          our customers to rent and enjoy world-class watches for any occasion.
        </p>
      </section>

      <section>
        <h2>What Sets Us Apart</h2>
        <ul>
          <li>Carefully selected, premium watch collection</li>
          <li>Flexible rental periods</li>
          <li>Seamless online experience</li>
          <li>Expert customer support</li>
          <li>Competitive and transparent pricing</li>
        </ul>
      </section>

      <section>
        <h2>Our Commitment</h2>
        <p>
          We are committed to providing an unparalleled service that combines
          luxury, convenience, and affordability. Whether you&apos;re attending
          a special event, want to try before you buy, or simply love
          experiencing different timepieces, Timeless is your premier watch
          rental destination.
        </p>
      </section>
    </div>
  );
};

export default About;
