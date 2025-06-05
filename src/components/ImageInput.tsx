import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { detectWaste } from '../api/detect-waste';

interface ImageInputProps {
  darkMode: boolean;
  onImageProcessed: (wasteName: string) => void;
}

const ImageInput = ({ darkMode, onImageProcessed }: ImageInputProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setImage(base64Image);
        processImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      console.log('Attempting to get camera stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Camera stream obtained.', stream);
      setCameraStream(stream);
      setShowCamera(true);
      console.log('showCamera state set to true, cameraStream set.');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    console.log('Attempting to stop camera...');
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      console.log('Camera stream tracks stopped.');
    }
    setCameraStream(null);
    setShowCamera(false);
    console.log('Camera stream and showCamera state reset.');
  };

  // Effect to assign stream to video element when available
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      console.log('Assigning camera stream to video element.');
      videoRef.current.srcObject = cameraStream;
    } else if (!showCamera && videoRef.current) {
       // Optional: clear srcObject when hiding camera
      videoRef.current.srcObject = null;
    }

    // Cleanup: stop stream when component unmounts or showCamera is false
    return () => {
      if (cameraStream) {
        console.log('Cleaning up camera stream on effect cleanup.');
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, videoRef, cameraStream]); // Dependencies

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Set canvas dimensions to match video feed
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setImage(imageData);
        processImage(imageData);
        stopCamera(); // Stop camera after capturing
      }
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      // Remove the data URL prefix to get just the base64 data
      const base64Data = imageData.split(',')[1];
      
      const result = await detectWaste(base64Data);

      if (!result.success) {
        throw new Error(result.error || 'Failed to detect waste');
      }

      if (!result.wasteName) {
        throw new Error('Could not identify waste item');
      }

      onImageProcessed(result.wasteName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(`${errorMessage}. Please try again.`);
      console.error('Error processing image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setError(null);
  };

  return (
    <div className={`w-full max-w-md mx-auto p-4 rounded-lg ${
      darkMode ? 'bg-gray-800/50' : 'bg-white'
    } shadow-lg`}>
      {!image && !showCamera ? (
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Upload size={20} className="mr-2" />
              Upload Image
            </button>
            <button
              onClick={startCamera}
              className={`flex items-center px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Camera size={20} className="mr-2" />
              Use Camera
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : showCamera ? (
        <div className="space-y-4">
          <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: showCamera ? 'block' : 'none' }}
            />
            <div className="absolute inset-0 border-4 border-white/20 rounded-lg pointer-events-none"></div>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={captureImage}
              className={`px-6 py-3 rounded-lg flex items-center text-lg font-semibold ${
                darkMode
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Camera size={24} className="mr-3" />
              Take Photo
            </button>
            <button
              onClick={stopCamera}
              className={`px-6 py-3 rounded-lg flex items-center text-lg font-semibold ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              <X size={24} className="mr-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={image || undefined}
              alt="Captured waste"
              className="w-full rounded-lg"
            />
            <button
              onClick={clearImage}
              className={`absolute top-2 right-2 p-1 rounded-full ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800'
              }`}
            >
              <X size={20} />
            </button>
          </div>
          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Processing image...
              </p>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className={`mt-4 p-3 rounded-lg ${
          darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
        }`}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageInput; 