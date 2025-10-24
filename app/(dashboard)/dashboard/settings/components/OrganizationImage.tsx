'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const OrganizationImage = () => {
  const { data: _session } = useSession();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json() as { image?: string, name?: string };
          if (data.image) {
            setImage(data.image);
          }
          if (data.name) {
            setOrgName(data.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch organization data", error);
      }
    };

    fetchOrgData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
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
      const res = await fetch('/api/organization/image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { imageUrl } = await res.json() as { imageUrl: string };
        setImage(imageUrl);
        toast.success('Organization image updated successfully.');
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
      <h3 className="text-lg font-medium">Organization Image</h3>
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={image || undefined} alt="Organization image" />
          <AvatarFallback>{orgName?.[0]}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          id="org-image-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="org-image-upload" className="cursor-pointer">
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