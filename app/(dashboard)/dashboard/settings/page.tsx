'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z, ZodError } from "zod"
import { useSession } from "next-auth/react"
import { useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { ProfileImage } from "./components/ProfileImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";

const profileFormSchema = z.object({
  username: z
    .string()
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    })
    .optional(),
  email: z
    .string()
    .email(),
  bio: z.string().max(160).optional(),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")),
      })
    )
    .optional(),
  imageUrl: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  username: "",
  email: "",
  bio: "I own a computer.",
  urls: [
    { value: "https://shadcn.com" },
    { value: "http://twitter.com/shadcn" },
  ],
}

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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({

    name: "urls",
    control: form.control,
  })

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = (await res.json()) as { username: string; bio: string; imageUrl: string; urls: string[] };
            form.reset({
              email: session.user.email || "",
              username: data.username || "",
              bio: data.bio || "",
              imageUrl: data.imageUrl || "",
              urls: data.urls && data.urls.length > 0 ? data.urls.map((url: string) => ({ value: url })) : [{ value: "" }],
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
          toast.error(t('profile.couldNotLoadProfile'));
        }
      };
      fetchProfile();
    }
  }, [session, form, t]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t('profile.profileUpdated'));
      } else {
        toast.error(t('profile.failedToUpdateProfile'));
      }
    } catch (error) {
      toast.error(t('profile.errorOccurred'));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" >
        <ProfileImage />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.username')}</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                {t('profile.usernameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.email')}</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} readOnly />
              </FormControl>
              <FormDescription>
                {t('profile.emailDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('profile.bio')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('profile.bioDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    {t('profile.urls')}
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    {t('profile.urlsDescription')}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            {t('profile.addUrl')}
          </Button>
        </div>
        <Button type="submit">{t('profile.updateProfile')}</Button>
      </form>
    </Form>
  )
}