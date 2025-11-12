
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Hand, X } from 'lucide-react';

interface GestureControlPopupProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export const GestureControlPopup: React.FC<GestureControlPopupProps> = ({ onEnable, onDismiss }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100]"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
          className="bg-gray-800/90 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-8 m-4 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Hand className="text-primary" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Control with a Wave</h2>
          <p className="text-white/70 mb-6">
            Enable experimental gesture controls to mute, unmute, and control your camera with simple hand movements.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={onEnable} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold">
              Enable Gesture Control
            </Button>
            <Button onClick={onDismiss} size="lg" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
              Dismiss
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};