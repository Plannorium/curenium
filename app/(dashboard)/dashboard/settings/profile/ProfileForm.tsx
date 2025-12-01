'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { settingsTranslations } from "@/lib/settings-translations";
import { useLanguage } from "@/contexts/LanguageContext"
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name."),
  imageUrl: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  const { data: session, update } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      imageUrl: '',
    },
  });

  const { reset } = form;
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profileData: ProfileFormValues = await response.json();
          reset(profileData);
        } else {
          toast.error("Failed to fetch profile data.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching profile data.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const { watch, setValue } = form;
  const imageUrl = watch('imageUrl');

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

  const handleImageSubmit = async () => {
    if (!file) return;

    setSubmitLoading(true);
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
      setSubmitLoading(false);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    try {
      setSubmitLoading(true);
      const response = await fetch("/api/settings/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (_error) {
      toast.error("An error occurred while updating profile.");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium">{t('profile.profileImage.title')}</h3>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={imageUrl || undefined} alt={t('profile.profileImage.alt')} />
              <AvatarFallback>
                {form.getValues('fullName')?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Controller
              control={form.control}
              name="imageUrl"
              render={() => (
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              )}
            />
            <label htmlFor="profile-image-upload" className={buttonVariants({ variant: "outline" })}>
              {t('profile.profileImage.change')}
            </label>
            {file && (
              <Button onClick={handleImageSubmit} disabled={submitLoading}>
                {submitLoading ? (
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.fullNamePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>{t('profile.fullNameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitLoading}>
            {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('profile.updateProfile')}</Button>
        </form>
      </Form>
    </div>
  );
}