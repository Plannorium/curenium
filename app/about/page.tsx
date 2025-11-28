"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  Lightbulb,
  Award,
  Globe,
  Code,
  Palette,
  Rocket,
  Twitter,
  Linkedin,
  Facebook,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { LandingHeader } from "@/components/LandingHeader";
import { useLanguage } from "@/contexts/LanguageContext";

function AboutPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const team = [
    {
      name: "Ahmad Al-Farsi",
      role: "Founder & CEO",
      description: "Visionary leader with 10+ years in healthcare technology and digital transformation.",
      image: "/team/ahmad.jpg"
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      description: "Former Google engineer specializing in secure healthcare systems and AI.",
      image: "/team/sarah.jpg"
    },
    {
      name: "Dr. Michael Chen",
      role: "Chief Medical Officer",
      description: "Board-certified physician with expertise in digital health and telemedicine.",
      image: "/team/michael.jpg"
    }
  ];

  const values = [
    {
      icon: Target,
      title: t('about.values.missionDriven'),
      description: t('about.values.missionDrivenDesc')
    },
    {
      icon: Lightbulb,
      title: t('about.values.innovation'),
      description: t('about.values.innovationDesc')
    },
    {
      icon: Users,
      title: t('about.values.humanCentered'),
      description: t('about.values.humanCenteredDesc')
    },
    {
      icon: Award,
      title: t('about.values.excellence'),
      description: t('about.values.excellenceDesc')
    }
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
      <section className="relative py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-center lg:text-left text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {t('about.title')}
              </span>
            </h1>
            <p className="text-left text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed lg:max-w-xl">
              {t('about.subtitle')}
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="backdrop-blur-sm bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">10+</div>
                <div className="text-sm text-muted-foreground">{t('about.stats.team')}</div>
              </div>
              <div className="backdrop-blur-sm bg-accent/5 border border-accent/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold dark:text-accent mb-1">6</div>
                <div className="text-sm text-muted-foreground">{t('about.stats.partners')}</div>
              </div>
              <div className="backdrop-blur-sm bg-green-500/5 border border-green-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-500 mb-1">20</div>
                <div className="text-sm text-muted-foreground">{t('about.stats.workflows')}</div>
              </div>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed text-left lg:max-w-xl">
              {t('about.betaText')}
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('about.revolutionizing')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed lg:max-w-xl">
                {t('about.revolutionizingDesc')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -left-4 lg:-left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                <div className="relative p-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">{t('about.overviewFeatures.title')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('about.overviewFeatures.description')}
                  </p>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/features">
                      {t('about.overviewFeatures.learnMore')}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-6 border-t border-border/30 lg:justify-center">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <span className="text-primary font-semibold text-sm">{t('about.tags.secure')}</span>
                </div>
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <span className="text-primary font-semibold text-sm">{t('about.tags.patientCentric')}</span>
                </div>
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <span className="text-primary font-semibold text-sm">{t('about.tags.enterprise')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('about.mission.title')}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('about.mission.desc')}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="text-green-600 dark:text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('about.vision.title')}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('about.vision.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
                <div className="relative">
                  <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-left">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="relative py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('about.globalPresence.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('about.globalPresence.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="text-green-600 dark:text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.globalPresence.universal')}</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                {t('about.globalPresence.universalDesc')}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="text-purple-600 dark:text-purple-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.globalPresence.globalNetwork')}</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                {t('about.globalPresence.globalNetworkDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Diversity */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('about.teamDiversity.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('about.teamDiversity.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-red-600 dark:text-red-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t('about.teamDiversity.healthcare')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  {t('about.teamDiversity.healthcareDesc')}
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="text-blue-600 dark:text-blue-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t('about.teamDiversity.engineers')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  {t('about.teamDiversity.engineersDesc')}
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="text-purple-600 dark:text-purple-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t('about.teamDiversity.designers')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  {t('about.teamDiversity.designersDesc')}
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-teal-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="text-green-600 dark:text-green-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t('about.teamDiversity.innovators')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  {t('about.teamDiversity.innovatorsDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Curenium Advantage */}
      <section className="relative py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('about.advantage.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('about.advantage.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{t('about.advantage.security')}</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                {t('about.advantage.securityDesc')}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="text-green-600 dark:text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{t('about.advantage.technology')}</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                {t('about.advantage.technologyDesc')}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="text-purple-600 dark:text-purple-500 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{t('about.advantage.design')}</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                {t('about.advantage.designDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Mission */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('about.joinMission.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('about.joinMission.subtitle')}
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="mailto:team@plannorium.com">
              {t('about.joinMission.sendResume')}
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t('about.cta.title')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('about.cta.subtitle')}
                </p>
              </div>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/contact">
                   {t('about.cta.contactUs')}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="https://calendly.com/almussanplanner12/curenium-demo">
                   {t('about.cta.requestDemo')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AboutPage;