"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, Clock, AlertTriangle } from "lucide-react";

interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBreak: (breakType: string, breakNotes: string) => void;
}

const BreakModal = ({ isOpen, onClose, onStartBreak }: BreakModalProps) => {
  const [breakType, setBreakType] = useState("");
  const [customBreakType, setCustomBreakType] = useState("");
  const [breakNotes, setBreakNotes] = useState("");

  const breakOptions = [
    { value: "lunch", label: "Lunch Break", icon: "🍽️" },
    { value: "rest", label: "Rest Break", icon: "🛋️" },
    { value: "meeting", label: "Meeting", icon: "👥" },
    { value: "emergency", label: "Emergency", icon: "🚨" },
    { value: "training", label: "Training", icon: "📚" },
    { value: "personal", label: "Personal", icon: "👤" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const handleSubmit = () => {
    const finalBreakType = breakType === "other" ? customBreakType.trim() || "other" : breakType;
    const finalNotes = breakNotes.trim() || `${finalBreakType.charAt(0).toUpperCase() + finalBreakType.slice(1)} break`;

    onStartBreak(finalBreakType, finalNotes);

    // Reset form
    setBreakType("");
    setCustomBreakType("");
    setBreakNotes("");
    onClose();
  };

  const isValid = breakType && (breakType !== "other" || customBreakType.trim());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-orange-500" />
            Start Break
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="breakType">Break Type</Label>
            <Select value={breakType} onValueChange={setBreakType}>
              <SelectTrigger>
                <SelectValue placeholder="Select break type" />
              </SelectTrigger>
              <SelectContent>
                {breakOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {breakType === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customBreakType">Specify Break Type</Label>
              <Input
                id="customBreakType"
                value={customBreakType}
                onChange={(e) => setCustomBreakType(e.target.value)}
                placeholder="e.g., Doctor appointment, Family emergency..."
                maxLength={50}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="breakNotes">Notes (Optional)</Label>
            <Textarea
              id="breakNotes"
              value={breakNotes}
              onChange={(e) => setBreakNotes(e.target.value)}
              placeholder="Any additional notes about this break..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {breakNotes.length}/200 characters
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your break will be automatically tracked. Remember to end your break when you return.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Start Break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BreakModal;