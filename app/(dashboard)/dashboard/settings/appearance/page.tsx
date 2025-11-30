import { AppearanceForm } from "./appearance-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";

export default function SettingsAppearancePage() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('appearance.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('appearance.subtitle')}
        </p>
      </div>
      <AppearanceForm />
    </div>
  );
}