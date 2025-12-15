'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { OrganizationImage } from "../components/OrganizationImage"
import { useLanguage } from "@/contexts/LanguageContext"
import { settingsTranslations } from "@/lib/settings-translations"

const organizationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  timezone: z.string(),
  language: z.string(),
  activeHoursStart: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please select a valid start time"),
  activeHoursEnd: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please select a valid end time")
})

type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export default function OrganizationForm() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      timezone: "",
      language: "",
      activeHoursStart: "",
      activeHoursEnd: "",
    },
  })

  useEffect(() => {
    fetch('/api/organization')
      .then(res => res.json())
      .then((data: unknown) => {
        if (typeof data === 'object' && data && !('error' in data)) {
          form.reset(data);
        }
      })
  }, [form])

  async function onSubmit(data: OrganizationFormValues) {
    const response = await fetch('/api/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success(t("organization.organizationUpdated"));
    } else {
      const errorData = await response.json() as { error?: string };
      toast.error(errorData?.error || "Failed to update organization.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <OrganizationImage />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('organization.organizationName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('organization.organizationNamePlaceholder')} {...field} disabled={!isAdmin} />
              </FormControl>
              <FormDescription>{t('organization.organizationNameDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('organization.timezone')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('organization.selectTimezone')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">{t('organization.saudiArabia')}</SelectItem>
                  <SelectItem value="Asia/Dubai">{t('organization.dubai')}</SelectItem>
                  <SelectItem value="Asia/Kuwait">Kuwait</SelectItem>
                  <SelectItem value="Asia/Qatar">Qatar</SelectItem>
                  <SelectItem value="Asia/Bahrain">Bahrain</SelectItem>
                  <SelectItem value="Asia/Muscat">Oman</SelectItem>
                  <SelectItem value="Asia/Amman">Jordan</SelectItem>
                  <SelectItem value="Asia/Beirut">Lebanon</SelectItem>
                  <SelectItem value="Asia/Damascus">Syria</SelectItem>
                  <SelectItem value="Asia/Baghdad">Iraq</SelectItem>
                  <SelectItem value="Europe/London">{t('organization.uk')}</SelectItem>
                  <SelectItem value="America/New_York">{t('organization.easternTime')}</SelectItem>
                  <SelectItem value="America/Los_Angeles">{t('organization.pacificTime')}</SelectItem>
                  <SelectItem value="Africa/Lagos">Lagos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('organization.language')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!isAdmin}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('organization.selectLanguage')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Populate with languages */}
                  <SelectItem value="en">{t('organization.english')}</SelectItem>
                  <SelectItem value="ar">{t('organization.arabic')}</SelectItem>
                  <SelectItem value="es">{t('organization.spanish')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="activeHoursStart"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('organization.activeHoursStart')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('organization.selectStartTime')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>{t('organization.activeHoursStartDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="activeHoursEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('organization.activeHoursEnd')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('organization.selectEndTime')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>{t('organization.activeHoursEndDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {isAdmin && <Button type="submit">{t('organization.updateOrganization')}</Button>}
      </form>
    </Form>
  )
}