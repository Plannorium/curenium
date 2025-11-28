"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background blur effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t('terms.hero.title')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t('terms.hero.description')}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto space-y-12">

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.acceptanceOfTerms.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.acceptanceOfTerms.description')}
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.useLicense.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.useLicense.description')}
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>{t('terms.sections.useLicense.restrictions')[0]}</li>
              <li>{t('terms.sections.useLicense.restrictions')[1]}</li>
              <li>{t('terms.sections.useLicense.restrictions')[2]}</li>
              <li>{t('terms.sections.useLicense.restrictions')[3]}</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.userResponsibilities.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.userResponsibilities.description')}
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>{t('terms.sections.userResponsibilities.responsibilities')[0]}</li>
              <li>{t('terms.sections.userResponsibilities.responsibilities')[1]}</li>
              <li>{t('terms.sections.userResponsibilities.responsibilities')[2]}</li>
              <li>{t('terms.sections.userResponsibilities.responsibilities')[3]}</li>
              <li>{t('terms.sections.userResponsibilities.responsibilities')[4]}</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.healthcareCompliance.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.healthcareCompliance.description')}
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.serviceAvailability.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.serviceAvailability.description')}
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.limitationOfLiability.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.limitationOfLiability.description')}
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.sections.contactInformation.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.contactInformation.description')}
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default TermsPage;