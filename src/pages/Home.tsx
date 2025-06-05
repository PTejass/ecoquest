import React, { useState } from 'react';
import Header from '../components/Header';
import LocationSelector from '../components/LocationSelector';
import WasteGuide from '../components/WasteGuide';
import SearchBar from '../components/SearchBar';
import ContactForm from '../components/ContactForm';
import RecyclingCenters from '../components/RecyclingCenters';
import ImageInput from '../components/ImageInput';

interface HomeProps {
  darkMode: boolean;
}

const Home = ({ darkMode }: HomeProps) => {
  const [location, setLocation] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageProcessed = (wasteName: string) => {
    setSearchQuery(wasteName);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header darkMode={darkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <LocationSelector
              selectedLocation={location}
              onLocationChange={setLocation}
              darkMode={darkMode}
            />
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              darkMode={darkMode}
            />
          </div>
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Identify Waste with AI
            </h2>
            <ImageInput
              darkMode={darkMode}
              onImageProcessed={handleImageProcessed}
            />
          </div>
        </div>

        <WasteGuide
          location={location}
          searchQuery={searchQuery}
          darkMode={darkMode}
        />

        <div className="mt-12">
          <RecyclingCenters location={location} darkMode={darkMode} />
        </div>

        <div className="mt-12">
          <ContactForm darkMode={darkMode} />
        </div>
      </main>
    </div>
  );
};

export default Home; 