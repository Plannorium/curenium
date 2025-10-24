'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ProfileImage = () => {
  const { data: session, update } = useSession();
  const { watch, setValue } = useFormContext();
  const imageUrl = watch('imageUrl');

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { imageUrl } = await res.json() as { imageUrl: string };
        setValue('imageUrl', imageUrl, { shouldDirty: true });
        await update({ image: imageUrl });
        toast.success('Profile image updated successfully.');
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('An error occurred while uploading the image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Profile Image</h3>
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={imageUrl || undefined} alt="User profile image" />
          <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          id="profile-image-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="profile-image-upload" className="cursor-pointer">
          <Button asChild variant="outline">
            <span>Change</span>
          </Button>
        </label>
        {file && (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Uploading...' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  );
};