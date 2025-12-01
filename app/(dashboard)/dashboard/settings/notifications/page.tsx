'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";

const notificationsFormSchema = z.object({
  type: z.enum(["all", "mentions", "none"], { message: "You need to select a notification type." }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  type: "mentions",
  mobile: false,
  communication_emails: false,
  marketing_emails: false,
  social_emails: true,
  security_emails: true,
}

export default function NotificationsForm() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/notifications");
        if (response.ok) {
          const data = (await response.json()) as NotificationsFormValues;
          form.reset(data);
        } else {
          console.error("Failed to fetch notification settings");
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      }
    };

    fetchSettings();
  }, [form]);

  async function onSubmit(data: NotificationsFormValues) {
    try {
      const response = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t('notifications.notificationsUpdated'));
      } else {
        toast.error(t('notifications.failedToUpdateNotifications'));
      }
    } catch (error) {
      toast.error(t('notifications.errorUpdatingNotifications'));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-foreground">{t('notifications.notifyMeAbout')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="all" className="backdrop-blur-lg bg-card/80 border border-border/60 rounded-lg" />
                    </FormControl>
                    <FormLabel className="font-normal text-muted-foreground">{t('notifications.allNewMessages')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mentions" className="backdrop-blur-lg bg-card/80 border border-border/60 rounded-lg" />
                    </FormControl>
                    <FormLabel className="font-normal text-muted-foreground">{t('notifications.directMessagesAndMentions')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="none" className="backdrop-blur-lg bg-card/80 border border-border/60 rounded-lg" />
                    </FormControl>
                    <FormLabel className="font-normal text-muted-foreground">{t('notifications.nothing')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <h3 className="mb-4 text-lg font-medium text-foreground">{t('notifications.emailNotifications')}</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="communication_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 backdrop-blur-lg bg-card/80 border-border/50 shadow-lg">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">{t('notifications.communicationEmails')}</FormLabel>
                    <FormDescription className="text-muted-foreground">
                      {t('notifications.communicationEmailsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marketing_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 backdrop-blur-lg bg-card/80 border-border/50 shadow-lg">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">{t('notifications.marketingEmails')}</FormLabel>
                    <FormDescription className="text-muted-foreground">
                      {t('notifications.marketingEmailsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="social_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 backdrop-blur-lg bg-card/80 border-border/50 shadow-lg">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">{t('notifications.socialEmails')}</FormLabel>
                    <FormDescription className="text-muted-foreground">
                      {t('notifications.socialEmailsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="security_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 backdrop-blur-lg bg-card/80 border-border/50 shadow-lg">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">{t('notifications.securityEmails')}</FormLabel>
                    <FormDescription className="text-muted-foreground">
                      {t('notifications.securityEmailsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                      className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200"
                />
              </FormControl>
              <div className="space-y-2 leading-tight">
                <FormLabel className="text-foreground">{t('notifications.useDifferentSettingsForMobile')}</FormLabel>
                <FormDescription className="text-muted-foreground">
                  {t('notifications.mobileSettingsDescription')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          {t('notifications.updateNotifications')}
        </Button>
      </form>
    </Form>
  )
}