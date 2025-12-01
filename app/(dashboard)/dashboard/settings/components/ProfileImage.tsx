'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { settingsTranslations } from "@/lib/settings-translations";

export const ProfileImage = ({ language }: { language: 'en' | 'ar' }) => {
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
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
        toast.success(t('profile.profileImage.toast.success'));
      } else {
        toast.error(t('profile.profileImage.toast.error'));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(t('profile.profileImage.toast.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('profile.profileImage.title')}</h3>
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={imageUrl || undefined} alt={t('profile.profileImage.alt')} />
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
            <span>{t('profile.profileImage.change')}</span>
          </Button>
        </label>
        {file && (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('profile.uploading')}
              </>
            ) : (
              t('profile.save')
            )}
          </Button>
        )}
      </div>
    </div>
  );
};