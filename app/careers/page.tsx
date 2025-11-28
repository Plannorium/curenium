"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  Twitter,
  Linkedin,
  Facebook,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { LandingHeader } from "@/components/LandingHeader";

function CareersPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const benefits = [
    { icon: Heart, key: 'health' },
    { icon: Users, key: 'flexible' },
    { icon: GraduationCap, key: 'learning' },
    { icon: Briefcase, key: 'compensation' },
    { icon: Users, key: 'culture' },
    { icon: Zap, key: 'innovation' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background blur effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <LandingHeader/>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t('careers.hero.title')}
            </span>
            <span className="block text-primary font-extrabold mt-2">
              {t('careers.hero.subtitle')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('careers.hero.description')}
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('careers.whyJoin.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('careers.whyJoin.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
                  <div className="relative">
                    <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-200">
                      <IconComponent className="text-primary h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {t(`careers.benefits.${benefit.key}.title`)}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {t(`careers.benefits.${benefit.key}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('careers.openPositions.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('careers.openPositions.subtitle')}
          </p>
        </div>

        <div className="text-center py-16">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-12 shadow-xl max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-primary h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('careers.openPositions.comingSoon')}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                {t('careers.openPositions.comingSoonDesc')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('careers.openPositions.resumeText')}
              </p>
              {/* <div className="mt-8">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  Send Your Resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('careers.culture.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('careers.culture.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">{t('careers.culture.innovation.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('careers.culture.innovation.description')}
                </p>
              </div>

              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">{t('careers.culture.workLife.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('careers.culture.workLife.description')}
                </p>
              </div>

              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">{t('careers.culture.learning.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('careers.culture.learning.description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -left-4 lg:-left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                <div className="relative p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6">{t('careers.culture.values.title')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Users className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{t('careers.culture.values.collaboration')}</h4>
                        <p className="text-sm text-muted-foreground">{t('careers.culture.values.collaborationDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Zap className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{t('careers.culture.values.excellence')}</h4>
                        <p className="text-sm text-muted-foreground">{t('careers.culture.values.excellenceDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Heart className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{t('careers.culture.values.empathy')}</h4>
                        <p className="text-sm text-muted-foreground">{t('careers.culture.values.empathyDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-gradient-to-r from-primary/90 to-primary border border-primary/20 rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {t('careers.cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              {t('careers.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('careers.cta.viewPositions')}
              </Button>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  {t('careers.cta.contactUs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default CareersPage;