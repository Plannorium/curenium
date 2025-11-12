
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface ImageLightboxProps {
  images: Array<{ url: string; name: string }>;
  initialIndex?: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, onClose]);

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full max-w-4xl max-h-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/controls
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 bg-black/30 dark:bg-gray-800/50 rounded-full p-2"
          >
            <XIcon size={24} />
          </button>

          <div className="relative flex items-center justify-center w-full h-full">
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-4 text-white/70 hover:text-white transition-colors bg-black/30 dark:bg-gray-800/50 rounded-full p-3 z-10"
              >
                <ChevronLeftIcon size={28} />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={currentImage.url}
                alt={currentImage.name}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                }}
                className="absolute right-4 text-white/70 hover:text-white transition-colors bg-black/30 dark:bg-gray-800/50 rounded-full p-3 z-10"
              >
                <ChevronRightIcon size={28} />
              </button>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 dark:bg-gray-900/60 text-white/90 rounded-lg px-4 py-2 text-center text-sm">
            <p className="font-semibold">{currentImage.name}</p>
            <p className="text-xs">{currentIndex + 1} / {images.length}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};