import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQProps {
  darkMode: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = ({ darkMode }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "What is Ecoquest?",
      answer: "Ecoquest is a smart waste disposal guide that helps you find the right way to dispose of different types of waste. We provide detailed information about proper waste disposal methods and connect you with local recycling facilities."
    },
    {
      question: "What types of waste can Ecoquest help me dispose of?",
      answer: "Ecoquest provides guidance for various types of waste including plastics, paper, glass, metal, electronic waste, organic waste, and hazardous materials. Each category comes with specific disposal instructions and local guidelines."
    },
    {
      question: "How do I find disposal information for my waste?",
      answer: "You can use our AI image detection feature by uploading a picture or using your camera, or simply use our search bar to look up the type of waste."
    },
    {
      question: "How does the AI image detection work?",
      answer: "Our tool uses a basic AI model to analyze the image you provide and identify the main waste item in it. It's trained to recognize common disposable items."
    },
    {
      question: "What if the AI doesn't recognize the waste item?",
      answer: "The AI is still learning and might not recognize all items. If it can't identify the waste, you can still try searching for it using keywords in the search bar."
    },
    {
      question: "How do I find recycling centers in my area?",
      answer: "The Recycling Centers section on the Home page allows you to select your location to see a list of known recycling facilities in that area."
    },
    {
      question: "What if my city is not listed for recycling centers?",
      answer: "Currently, we have data for a limited number of major cities. We hope to expand our coverage in the future. If your city isn't listed, you can try searching online or contacting your local municipality for recycling options."
    },
    {
      question: "How can I contribute to Ecoquest?",
      answer: "You can help improve Ecoquest by submitting new disposal tips or suggestions through our contact form. Your input helps us make the platform more comprehensive and useful for everyone."
    },
    {
      question: "Is Ecoquest available in my area?",
      answer: "Ecoquest is currently focused on providing waste disposal information for major cities. We're continuously working to expand our coverage to include more locations. Check our platform for the most up-to-date information about your area."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-stone-900 text-white' : 'bg-stone-50 text-gray-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                darkMode ? 'bg-stone-800/50' : 'bg-white'
              }`}
            >
              <button
                className={`w-full px-6 py-4 text-left flex justify-between items-center ${
                  darkMode ? 'hover:bg-stone-700/50' : 'hover:bg-stone-50'
                }`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold">{item.question}</span>
                {openIndex === index ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              
              {openIndex === index && (
                <div className={`px-6 pb-4 ${
                  darkMode ? 'text-stone-200' : 'text-gray-600'
                }`}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ; 