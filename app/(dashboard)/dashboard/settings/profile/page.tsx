'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
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
import { useLanguage } from "@/contexts/LanguageContext"

const profileFormSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name."),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const { t } = useLanguage();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  })

  useEffect(() => {
    const { reset } = form;
    async function fetchProfile() {
      try {
        const response = await fetch("/api/settings/profile");
        if (response.ok) {
          const data = await response.json() as ProfileFormValues;
          reset(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (_error) {
        console.error("Error fetching profile:", _error);
      }
    }

    fetchProfile();
  }, []);

  async function onSubmit(data: ProfileFormValues) {
    try {
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
    }
  }

  return (
    <Form {...form}>
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
        <Button type="submit">{t('profile.updateProfile')}</Button>
      </form>
    </Form>
  )
}