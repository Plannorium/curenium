import { motion, AnimatePresence } from 'framer-motion';
import { MicOff, VideoOff, Video, PhoneOff, Mic, X } from 'lucide-react';
import { Gesture } from '../../lib/use-gesture-control';

interface GestureFeedbackProps {
  gesture: Gesture | null;
}

const gestureIcons = {
  mute: <MicOff className="w-12 h-12 text-red-400" />,
  unmute: <Mic className="w-12 h-12 text-green-400" />,
  camera_off: <VideoOff className="w-12 h-12 text-red-400" />,
  camera_on: <Video className="w-12 h-12 text-green-400" />,
  end_call: <X className="w-12 h-12 text-red-600 rotate-45" />,
};

const GestureFeedback = ({ gesture }: GestureFeedbackProps) => {
  return (
    <AnimatePresence>
      {gesture && (
        <motion.div
          key={gesture}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md rounded-full p-6 z-[100]"
        >
          {gestureIcons[gesture as keyof typeof gestureIcons]}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GestureFeedback;