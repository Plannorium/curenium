'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StickyNote, Plus, Loader2, MessageSquare, User } from 'lucide-react';

interface Note {
  _id: string;
  content: string;
  author: {
    _id: string;
    fullName: string;
    avatar?: string;
    initials?: string;
  };
  createdAt?: string;
}

interface NotesModalProps {
  shift: {
    _id: string;
    user: {
      fullName: string;
    };
  } | null;
  onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ shift, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    if (!shift) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notes?shiftId=${shift._id}`);
      const data = await res.json() as Note[];
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [shift, fetchNotes]);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote, shift: shift?._id }),
      });

      if (res.ok) {
        setNewNote('');
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={!!shift} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl max-w-2xl max-h-[80vh] flex flex-col">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
        
        <DialogHeader className="relative pb-4 border-b border-border/30">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 mr-3">
              <StickyNote className="h-4 w-4 text-primary" />
            </div>
            Notes for {shift?.user.fullName}&apos;s Shift
            <div className="ml-auto">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 flex flex-col space-y-4 py-4 min-h-0">
          {/* Notes List */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading notes...</span>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No notes yet</p>
                <p className="text-xs text-muted-foreground/70">Add the first note below</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
                {notes.map((note: Note) => (
                  <div 
                    key={note._id} 
                    className="group flex items-start gap-3 p-4 rounded-xl backdrop-blur-sm bg-card/50 border border-border/30 hover:bg-card/70 hover:border-border/50 transition-all duration-300 hover:shadow-md"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-border/20 transition-all duration-200 group-hover:ring-primary/30">
                      <AvatarImage src={note.author.avatar} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {note.author.initials || note.author.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground text-sm group-hover:text-foreground/90 transition-colors">
                          {note.author.fullName}
                        </p>
                        {note.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed break-words">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Note Section */}
          <div className="border-t border-border/30 pt-4 space-y-3">
            <div className="flex items-center text-sm font-medium text-foreground mb-2">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Add New Note
            </div>
            <div className="space-y-3">
              <Textarea 
                placeholder="Write your note here... (Ctrl+Enter to submit)"
                value={newNote} 
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Press Ctrl+Enter to submit quickly
                </span>
                <Button 
                  onClick={handleSubmit} 
                  size="sm"
                  disabled={!newNote.trim() || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;