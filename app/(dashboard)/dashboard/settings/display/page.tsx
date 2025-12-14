'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const displayFormSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  calendarType: z.enum(['gregorian', 'hijri']),
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

export default function SettingsDisplayPage() {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[currentLanguage as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [settings, setSettings] = useState<DisplayFormValues>({
    language: 'en',
    timezone: 'UTC',
    calendarType: 'gregorian',
  });

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/display');
        if (response.ok) {
          const data: DisplayFormValues = await response.json();
          setSettings(data);
          form.reset(data);
        }
      } catch (error) {
        console.error('Failed to fetch display settings', error);
      }
    };
    fetchSettings();
  }, [form]);

  async function onSubmit(data: DisplayFormValues) {
    try {
      const response = await fetch('/api/settings/display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t ? t('display.displayUpdated') : 'Display settings updated successfully.');
        if (data.language !== currentLanguage) {
          setLanguage(data.language as 'en' | 'ar');
        }
      } else {
        toast.error(t ? t('display.failedToUpdateDisplay') : 'Failed to update display settings.');
      }
    } catch (error) {
      toast.error(t ? t('display.errorUpdatingDisplay') : 'An error occurred while updating display settings.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('display.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('display.subtitle')}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('display.language')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('display.languageDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('display.timezone')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                    <SelectItem value="Africa/Lagos">Lagos</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('display.timezoneDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="calendarType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('display.calendarType')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gregorian">{t('display.gregorian')}</SelectItem>
                    <SelectItem value="hijri">{t('display.hijri')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('display.calendarTypeDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{t('display.updateDisplaySettings')}</Button>
        </form>
      </Form>
    </div>
  );
}