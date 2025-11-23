"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddLabOrderModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onLabOrderAdded: () => void;
}

export const AddLabOrderModal = ({ patientId, isOpen, onClose, onLabOrderAdded }: AddLabOrderModalProps) => {
  const { data: session } = useSession();
  const [tests, setTests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/patients/${patientId}/lab-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tests: tests.split(",").map(t => t.trim()) }),
      });

      if (!res.ok) {
        throw new Error("Failed to create lab order");
      }

      toast.success("Lab order created successfully.");
      onLabOrderAdded();
      onClose();
    } catch (error) {
      toast.error("Failed to create lab order.");
    } finally {
      setIsSubmitting(false);
      setTests("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle>Request Lab Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tests" className="text-right">
                Tests
              </Label>
              <Input
                id="tests"
                value={tests}
                onChange={(e) => setTests(e.target.value)}
                className="col-span-3"
                placeholder="e.g., CBC, TSH, Lipid Panel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !tests.trim()}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};