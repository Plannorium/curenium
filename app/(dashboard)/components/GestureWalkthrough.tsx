import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MicOff, ThumbsUp, ThumbsDown, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GestureWalkthroughProps {
  onClose: () => void;
}

const gestureSteps = [
  {
    title: 'Mute & Unmute',
    description: "Bring your index finger to your lips to mute. Move your hand away to unmute.",
    icon: (
      <div className="flex items-center justify-center gap-4">
        <Hand className="w-12 h-12 sm:w-16 sm:h-16 text-sky-300" />
        <MicOff className="w-12 h-12 sm:w-16 sm:h-16 text-sky-300" />
      </div>
    ),
  },
  {
    title: 'Camera Off',
    description: "Make a 'thumbs down' gesture to turn your camera off.",
    icon: <ThumbsDown className="w-20 h-20 sm:w-24 sm:h-24 text-sky-300" />,
  },
  {
    title: 'Camera On',
    description: "Make a 'thumbs up' gesture to turn your camera on.",
    icon: <ThumbsUp className="w-20 h-20 sm:w-24 sm:h-24 text-sky-300" />,
  },
  {
    title: 'Raise Hand',
    description: 'Raise your hand to signal you want to speak.',
    icon: <Hand className="w-20 h-20 sm:w-24 sm:h-24 text-sky-300" />,
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
      className="fixed inset-0 bg-gray-950/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-gray-900/60 ring-1 ring-white/10"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_120%_at_50%_0%,_#0c4a6e20_0%,_transparent_100%)]"></div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-gray-400 transition-colors hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </Button>

        <div className="relative p-6 pt-12 sm:p-8 sm:pt-14 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
              className="flex flex-col items-center"
            >
              <div className="mb-6 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center">
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gray-800/50 ring-1 ring-white/10">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-sky-500/10 to-transparent"></div>
                  <div className="relative z-10">{currentStep.icon}</div>
                </div>
              </div>
              <h2 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight">{currentStep.title}</h2>
              <p className="mx-auto max-w-xs text-gray-300 text-sm sm:text-base">{currentStep.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {step > 0 && (
              <Button
                onClick={handlePrev}
                variant="outline"
                className="w-full rounded-full border-white/20 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="w-full rounded-full bg-sky-600 font-semibold text-white shadow-lg shadow-sky-600/20 transition-all hover:bg-sky-500 hover:shadow-sky-500/30 hover:scale-[1.02]"
            >
              {step === gestureSteps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>

          <div className="flex justify-center space-x-2 pt-4">
            {gestureSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  i === step ? 'w-5 bg-sky-400' : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GestureWalkthrough;