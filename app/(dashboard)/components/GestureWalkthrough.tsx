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
        <Hand className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
        <MicOff className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
      </div>
    ),
  },
  {
    title: 'Camera Off',
    description: "Make a 'thumbs down' gesture to turn your camera off.",
    icon: <ThumbsDown className="w-20 h-20 sm:w-24 sm:h-24 text-primary" />,
  },
  {
    title: 'Camera On',
    description: "Make a 'thumbs up' gesture to turn your camera on.",
    icon: <ThumbsUp className="w-20 h-20 sm:w-24 sm:h-24 text-primary" />,
  },
  {
    title: 'Raise Hand',
    description: 'Raise your hand to signal you want to speak.',
    icon: <Hand className="w-20 h-20 sm:w-24 sm:h-24 text-primary" />,
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
      className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-card border"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_120%_at_50%_0%,_hsl(var(--primary)/0.1)_0%,_transparent_100%)]"></div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        >
          <X size={20} />
        </Button>

        <div className="relative p-6 pt-12 sm:p-8 sm:pt-14 text-center">
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
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-muted/50 ring-1 ring-border">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 to-transparent"></div>
                  <div className="relative z-10">{currentStep.icon}</div>
                </div>
              </div>
              <h2 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{currentStep.title}</h2>
              <p className="mx-auto max-w-xs text-muted-foreground text-sm sm:text-base">{currentStep.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {step > 0 && (
              <Button
                onClick={handlePrev}
                variant="outline"
                className="w-full sm:w-auto flex-1 rounded-full"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto flex-1 rounded-full bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 hover:scale-[1.02]"
            >
              {step === gestureSteps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>

          <div className="flex justify-center space-x-2 pt-4">
            {gestureSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card ${
                  i === step ? 'w-5 bg-primary' : 'w-2 bg-muted hover:bg-muted/80'
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