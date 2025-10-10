import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">About Fsourcing</h1>
        <p className="text-gray-700 mb-4">Fsourcing is a global B2B marketplace connecting buyers with verified suppliers. Our mission is to make sourcing simple, transparent, and reliable for businesses worldwide.</p>
        <h2 className="text-2xl font-semibold mb-2">Our Story</h2>
        <p className="text-gray-700">Founded by industry experts, we combine technology with a global network to help businesses find the right suppliers and products quickly.</p>
      </div>
    </div>
  );
};

export default About;
