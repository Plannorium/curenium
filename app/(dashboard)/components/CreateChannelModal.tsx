"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onChannelCreated,
}) => {
  const [channelName, setChannelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setChannelName("");
      setError("");
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isCreating) onClose();
  };

  const handleCreate = async () => {
    if (!channelName.trim()) {
      setError("Channel name cannot be empty.");
      return;
    }
    setError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: channelName }),
      });

      if (response.ok) {
        onChannelCreated();
        onClose();
        setChannelName("");
      } else {
        const data: { message?: string } = await response.json();
        setError(data.message || "Failed to create channel.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="
          sm:max-w-[460px] 
          p-6
          backdrop-blur-2xl 
          bg-gradient-to-br from-background/60 via-card/70 to-background/50
          dark:from-gray-900/70 dark:via-gray-800/80 dark:to-gray-900/70
          border border-border/40 dark:border-gray-700/50
          rounded-2xl 
          shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)]
          transition-all duration-300
        "
      >
        <DialogHeader>
          <DialogTitle
            className="
              flex items-center gap-2 
              text-lg font-semibold text-foreground/90
              tracking-tight
            "
          >
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Plus size={18} />
            </div>
            Create New Channel
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="channel-name"
              className="text-right text-muted-foreground/80"
            >
              Name
            </Label>
            <Input
              id="channel-name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g., patient-updates"
              className="
                col-span-3 
                bg-background/50 dark:bg-gray-800/50
                border border-border/30 dark:border-gray-700/60
                rounded-xl 
                focus:ring-2 focus:ring-primary/30
                shadow-inner
              "
            />
          </div>
          {error && (
            <p className="col-span-4 text-center text-sm text-destructive/90">
              {error}
            </p>
          )}
        </motion.div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
            className="
              border-border/30 
              hover:bg-background/60 
              transition-all duration-200 
              rounded-xl shadow-sm cursor-pointer
            "
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !channelName.trim()}
            className="
              bg-primary/90 
              hover:bg-primary 
              text-primary-foreground 
              rounded-xl 
              shadow-[0_4px_16px_-4px_var(--primary)]
              transition-all duration-200 cursor-pointer
            "
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};