'use client';

import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";

const BillingPage = () => {
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{t('billing.title')}</h1>
      <p className="mt-2 text-gray-600">{t('billing.subtitle')}</p>
    </div>
  );
};

export default BillingPage;