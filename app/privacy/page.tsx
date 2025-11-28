"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

function PrivacyPage() {
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
      <motion.section
        className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="text-center space-y-8">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t('privacy.hero.title')}
            </span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('privacy.hero.description')}
          </motion.p>
        </div>
      </motion.section>

      {/* Content Sections */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto space-y-12">

          <motion.div
            className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sections.informationWeCollect.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.informationWeCollect.description')}
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>{t('privacy.sections.informationWeCollect.items')[0]}</li>
              <li>{t('privacy.sections.informationWeCollect.items')[1]}</li>
              <li>{t('privacy.sections.informationWeCollect.items')[2]}</li>
              <li>{t('privacy.sections.informationWeCollect.items')[3]}</li>
            </ul>
          </motion.div>

          <motion.div
            className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sections.howWeUse.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.howWeUse.description')}
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>{t('privacy.sections.howWeUse.items')[0]}</li>
              <li>{t('privacy.sections.howWeUse.items')[1]}</li>
              <li>{t('privacy.sections.howWeUse.items')[2]}</li>
              <li>{t('privacy.sections.howWeUse.items')[3]}</li>
              <li>{t('privacy.sections.howWeUse.items')[4]}</li>
            </ul>
          </motion.div>

          <motion.div
            className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sections.dataSecurity.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.dataSecurity.description')}
            </p>
          </motion.div>

          <motion.div
            className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sections.dataSharing.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.dataSharing.description')}
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>{t('privacy.sections.dataSharing.items')[0]}</li>
              <li>{t('privacy.sections.dataSharing.items')[1]}</li>
              <li>{t('privacy.sections.dataSharing.items')[2]}</li>
              <li>{t('privacy.sections.dataSharing.items')[3]}</li>
            </ul>
          </motion.div>

          <motion.div
            className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sections.yourRights.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.yourRights.description')}
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>{t('privacy.sections.yourRights.items')[0]}</li>
              <li>{t('privacy.sections.yourRights.items')[1]}</li>
              <li>{t('privacy.sections.yourRights.items')[2]}</li>
              <li>{t('privacy.sections.yourRights.items')[3]}</li>
            </ul>
          </motion.div>

          <motion.div
            className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sections.contactUs.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.contactUs.description')}
            </p>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {t('privacy.sections.contactUs.contactInfo')}
            </p>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PrivacyPage;