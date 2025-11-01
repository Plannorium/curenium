"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initAudio, playSound } from '@/lib/sound/soundGenerator';
import { Volume2, PlayCircle } from 'lucide-react';

const soundEvents = [
  { name: 'messageSent', description: 'Message sent or received' },
  { name: 'notification', description: 'General notification' },
  { name: 'callStart', description: 'Outgoing/incoming call starts' },
  { name: 'callEnd', description: 'Call has ended' },
  { name: 'mute', description: 'Microphone muted' },
  { name: 'unmute', description: 'Microphone unmuted' },
  { name: 'success', description: 'Action successful (e.g., save)' },
  { name: 'alert', description: 'System alert or warning' },
  { name: 'error', description: 'Action failed or error occurred' },
];

export const SoundPalette = () => {
  useEffect(() => {
    // It's best practice to initialize audio on a user gesture.
    // This button serves that purpose for the palette.
    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const handlePlaySound = (soundName: string) => {
    playSound(soundName);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-primary" />
          <CardTitle>Sound Palette & Audio Settings</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Preview and test the application's UI sounds. Click to play.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {soundEvents.map((event) => (
            <div
              key={event.name}
              className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-foreground capitalize">
                  {event.name.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {event.description}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handlePlaySound(event.name)}>
                <PlayCircle className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundPalette;