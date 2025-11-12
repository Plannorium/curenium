import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MicOff, VideoOff, Video, ThumbsUp, ThumbsDown, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GestureWalkthroughProps {
  onClose: () => void;
}

const gestureSteps = [
  {
    title: 'Mute & Unmute',
    description: "Bring your index finger to your lips in a 'shhh' gesture to mute. Move your hand away to unmute.",
    icon: (
      <div className="flex items-center justify-center gap-4">
        <Hand className="w-16 h-16 text-white" />
        <MicOff className="w-16 h-16 text-white" />
      </div>
    ),
  },
  {
    title: 'Camera Off',
    description: "Make a 'thumbs down' gesture to turn your camera off.",
    icon: <ThumbsDown className="w-24 h-24 text-white" />,
  },
  {
    title: 'Camera On',
    description: "Make a 'thumbs up' gesture to turn your camera on.",
    icon: <ThumbsUp className="w-24 h-24 text-white" />,
  },
];

const GestureWalkthrough = ({ onClose }: GestureWalkthroughProps) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < gestureSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = gestureSteps[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="bg-gray-900/50 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 text-white relative"
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </Button>

        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="h-32 flex items-center justify-center mb-6">
                {currentStep.icon}
              </div>
              <h2 className="text-3xl font-bold mb-2">{currentStep.title}</h2>
              <p className="text-white/70 max-w-xs mx-auto">{currentStep.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center mt-8 space-x-4">
          {step > 0 && (
            <Button onClick={handlePrev} variant="outline" className="bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:text-white">
              Previous
            </Button>
          )}
          <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            {step === gestureSteps.length - 1 ? 'Got it!' : 'Next'}
          </Button>
        </div>

        <div className="flex justify-center mt-6 space-x-2">
          {gestureSteps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step ? 'bg-white w-4' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GestureWalkthrough;