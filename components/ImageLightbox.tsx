import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  images: Array<{ url: string; name: string }>;
  initialIndex?: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleKeyNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', handleKeyNav);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', handleKeyNav);
    };
  }, [onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setScale(1); // Reset zoom on image change
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScale(1); // Reset zoom on image change
    }
  }, [currentIndex, images.length]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg"
      onClick={(e) => {
        if (!isDragging && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-50"
          onClick={onClose}
        >
          <XIcon size={24} />
        </Button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <ZoomOutIcon size={20} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <ZoomInIcon size={20} />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-[90vw] max-h-[90vh] select-none"
          >
            <motion.img
              src={images[currentIndex].url}
              alt={images[currentIndex].name}
              className="max-w-full max-h-[90vh] object-contain"
              style={{ scale }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              whileTap={{ cursor: "grabbing" }}
            />
          </motion.div>
        </AnimatePresence>

        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="absolute left-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <ChevronLeftIcon size={24} />
          </Button>
        )}

        {currentIndex < images.length - 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="absolute right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <ChevronRightIcon size={24} />
          </Button>
        )}

        <div className="absolute bottom-4 text-sm text-foreground/80 bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </motion.div>
  );
};