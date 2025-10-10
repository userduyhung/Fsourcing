import React from 'react';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Our Services</h1>
        <p className="text-gray-700 mb-4">We offer a range of services to help buyers and suppliers succeed: supplier verification, trade assurance, logistics support, and market insights.</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Supplier Verification & Audits</li>
          <li>Trade Assurance & Payment Solutions</li>
          <li>Logistics & Shipping Support</li>
          <li>Market Intelligence & Insights</li>
        </ul>
      </div>
    </div>
  );
};

export default Services;
