"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ClockIcon,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Bell,
} from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

function LandingPage() {
  const { t, language } = useLanguage();

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
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1
                className={language === 'ar' ? "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" : "text-xl md:text-2xl lg:text-3xl font-bold leading-tight"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {t('landing.hero.title')}
                </span>
                <motion.span
                  className="block text-primary font-extrabold mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {t('landing.hero.subtitle')}
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {t('landing.hero.subtitle')}
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group dark:text-black cursor-pointer"
                  >
                    <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    {t('landing.hero.getStarted')}
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                  >
                    {t('landing.hero.requestDemo')}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.div
                className="flex items-start group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4 group-hover:bg-primary/15 transition-all duration-200">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('landing.hero.secureMessaging')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.hero.secureMessagingDesc')}
                  </p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-start group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4 group-hover:bg-primary/15 transition-all duration-200">
                  <ClockIcon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('landing.hero.realTimeUpdates')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.hero.realTimeUpdatesDesc')}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              className="absolute -top-12 -left-4 lg:-left-12 lg:w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-12 -right-4 lg:-right-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

              <motion.div
                className="relative bg-gradient-to-r from-primary to-primary/90 p-4 text-primary-foreground"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('landing.chatDemo.title')}
                  <motion.div
                    className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t('landing.chatDemo.live')}
                  </motion.div>
                </h3>
              </motion.div>

              <div className="relative p-6 space-y-4">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {t('landing.chatDemo.doctorInitials')}
                    </span>
                  </div>
                  <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      {t('landing.chatDemo.doctorMessage')}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {t('landing.chatDemo.doctorName')} • {t('landing.chatDemo.timeAgo')}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      {t('landing.chatDemo.nurseMessage')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('landing.chatDemo.nurseName')} • {t('landing.chatDemo.justNow')}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center ml-3 flex-shrink-0">
                    <span className="text-accent-foreground font-semibold text-sm">
                      {t('landing.chatDemo.nurseInitials')}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8, type: "spring" }}
                >
                  <motion.div
                    className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-full px-4 py-2 text-xs font-semibold flex items-center shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    animate={{ boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.4)", "0 0 0 4px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0.4)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bell size={12} className="mr-2 animate-pulse" />
                    {t('landing.chatDemo.criticalAlert')}
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                className="relative border-t border-border/30 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
              >
                <div className="flex items-center backdrop-blur-sm bg-background/50 border border-border/60 rounded-full px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                  <input
                    type="text"
                    placeholder={t('landing.chatDemo.placeholder') || "Type your message..."}
                    className="bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground w-full text-sm"
                  />
                  <MessageSquare size={18} className="text-primary ml-2" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <motion.div
                  className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-200"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MessageSquare className="text-primary h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('landing.features.secureMessaging')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('landing.features.secureMessagingDesc')}
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href="/features"
                    className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200"
                  >
                    {t('landing.features.learnMore')} <ArrowRight size={16} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <motion.div
                  className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/15 transition-all duration-200"
                  whileHover={{ rotate: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Bell className="text-red-500 h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('landing.features.criticalAlerts')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('landing.features.criticalAlertsDesc')}
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href="/features"
                    className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200"
                  >
                    Learn more <ArrowRight size={16} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <motion.div
                  className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/15 transition-all duration-200"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ClockIcon className="text-green-600 dark:text-green-500 h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('landing.features.shiftManagement')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('landing.features.shiftManagementDesc')}
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href="/features"
                    className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200"
                  >
                    Learn more <ArrowRight size={16} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Curenium Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('landing.whyCurenium.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('landing.whyCurenium.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {t('landing.whyCurenium.savesLives')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('landing.whyCurenium.savesLivesDesc')}
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {t('landing.whyCurenium.busyPeople')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('landing.whyCurenium.busyPeopleDesc')}
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {t('landing.whyCurenium.gulfReady')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('landing.whyCurenium.gulfReadyDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t('landing.howItWorks.step1')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.howItWorks.step1Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t('landing.howItWorks.step2')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.howItWorks.step2Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t('landing.howItWorks.step3')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.howItWorks.step3Desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-12 -left-4 lg:-left-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12  -right-4 lg:-right-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

              <div className="relative bg-gradient-to-r from-accent to-accent/90 p-4 text-accent-foreground">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('landing.howItWorksChatDemo.title')}
                  <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                    {t('landing.howItWorksChatDemo.active')}
                  </div>
                </h3>
              </div>

              <div className="relative p-6 space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-accent-foreground font-semibold text-sm">
                      {t('landing.howItWorksChatDemo.nurseInitials')}
                    </span>
                  </div>
                  <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      {t('landing.howItWorksChatDemo.nurseMessage')}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      {t('landing.howItWorksChatDemo.nurseName')} • {t('landing.howItWorksChatDemo.timeAgo')}
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-end">
                  <div className="backdrop-blur-sm bg-accent/10 border border-accent/20 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      {t('landing.howItWorksChatDemo.doctorMessage')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('landing.howItWorksChatDemo.doctorName')} • {t('landing.howItWorksChatDemo.justNow')}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center ml-3 flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {t('landing.howItWorksChatDemo.doctorInitials')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-full px-4 py-2 text-xs font-semibold flex items-center shadow-sm">
                    <ClockIcon size={12} className="mr-2 animate-pulse" />
                    {t('landing.howItWorksChatDemo.shiftComplete')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="relative backdrop-blur-xl bg-gradient-to-r from-primary/90 to-primary border border-primary/20 rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('landing.cta.title')}
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t('landing.cta.subtitle')}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    {t('landing.cta.requestDemo')}
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/80 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  {t('landing.cta.contactSales')}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export { LandingPage as LandingPageClient };
