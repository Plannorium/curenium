import { motion } from 'framer-motion';
import { EmojiClickData } from 'emoji-picker-react';

interface ReactionPickerProps {
  onEmojiClick: (emoji: string) => void;
  onClose: () => void;
}

const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const ReactionPicker = ({ onEmojiClick, onClose }: ReactionPickerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className="absolute z-10 bottom-full mb-2 bg-card border border-border/40 rounded-full p-2 shadow-lg flex gap-1"
    >
      {reactions.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiClick(emoji)}
          className="text-2xl hover:scale-125 transition-transform duration-150"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};