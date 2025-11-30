"use client";
import React, { useEffect } from "react";
// import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";


const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"], { message: "Please select a theme." }),
  // font: z.enum(["inter", "manrope", "system"], { message: "Please select a font." }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export function AppearanceForm() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const { setFont: _setFont, setTheme, theme, font } = useTheme();
  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
  });

  async function onSubmit(data: AppearanceFormValues) {
    try {
      const response = await fetch("/api/settings/appearance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { font: _font } = (await response.json()) as { font?: string };
        toast.success(t('appearance.appearanceUpdated'));
        // setFont(data.font);
      } else {
        toast.error(t('appearance.failedToUpdateAppearance'));
      }
    } catch (_error) {
      toast.error(t('appearance.errorUpdatingAppearance'));
    }
  }

  useEffect(() => {
    form.reset({
      theme: theme,
      // font: font,
    });
  }, [theme, font, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* <FormField
          control={form.control}
          name="font"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-lg font-semibold text-foreground">Font</FormLabel>
              <FormDescription className="text-sm text-muted-foreground">
                Set the font you want to use in the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid max-w-md grid-cols-2 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="inter" className="sr-only" />
                    </FormControl>
                    <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-md p-2 hover:border-accent transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faFont} className="text-primary h-6 w-6" />
                        <span className="text-foreground">Inter</span>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="manrope" className="sr-only" />
                    </FormControl>
                    <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-md p-2 hover:border-accent transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faItalic} className="text-primary h-6 w-6" />
                        <span className="text-foreground">Manrope</span>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="system" className="sr-only" />
                    </FormControl>
                    <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-md p-2 hover:border-accent transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faBold} className="text-primary h-6 w-6" />
                        <span className="text-foreground">System</span>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>{t('appearance.theme')}</FormLabel>
              <FormDescription>
                {t('appearance.themeDescription')}
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value);
                  setTheme(value as "light" | "dark");
                }}
                defaultValue={field.value}
                className="grid max-w-md grid-cols-1 lg:grid-cols-2 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="light" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      {t('appearance.light')}
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="dark" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted bg-slate-950 p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-slate-800 p-2">
                        <div className="space-y-2 rounded-md bg-slate-900 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-900 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-900 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      {t('appearance.dark')}
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />


        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          {t('appearance.updatePreferences')}
        </Button>
      </form>
    </Form>
  );
}