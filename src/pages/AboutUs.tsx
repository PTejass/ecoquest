import React from 'react';

interface AboutUsProps {
  darkMode: boolean;
}

const AboutUs = ({ darkMode }: AboutUsProps) => {
  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-stone-900 text-white' : 'bg-stone-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">About Ecoquest</h1>
        
        <div className="space-y-8">
          <section className={`p-6 rounded-xl shadow-lg ${
            darkMode ? 'bg-stone-800/50' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="leading-relaxed">
              At Ecoquest, we're dedicated to making waste disposal smarter and more sustainable. 
              Our mission is to empower individuals and communities with the knowledge and tools 
              they need to make environmentally conscious decisions about waste management.
            </p>
          </section>

          <section className={`p-6 rounded-xl shadow-lg ${
            darkMode ? 'bg-stone-800/50' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">What We Do</h2>
            <p className="leading-relaxed mb-4">
              We provide a tool that uses AI to help you identify waste items and find out how to dispose of them correctly. You can:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Identify waste items by uploading an image or using your camera</li>
              <li>Get basic information on how to dispose of common waste types</li>
              <li>Find nearby recycling centers for specific locations</li>
              <li>Learn about making sustainable waste choices</li>
            </ul>
          </section>

          <section className={`p-6 rounded-xl shadow-lg ${
            darkMode ? 'bg-stone-800/50' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Our Journey</h2>
            <p className="leading-relaxed">
              Ecoquest is a project developed by a team of students passionate about technology and the environment. We're constantly learning and working to improve this tool to make waste management easier and more accessible for everyone. This is a learning project, and we appreciate your understanding and feedback as we grow!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 