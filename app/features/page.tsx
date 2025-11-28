"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ClockIcon,
  MessageSquare,
  Bell,
  ArrowRight,
  Sparkles,
  FileText,
  Beaker,
  CheckCircle,
  Pill,
  Heart,
  Stethoscope,
  Activity,
  Brain,
  Calendar,
  Search,
  Users,
  Settings,
  BarChart3,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

function FeaturesPage() {
  const { t } = useLanguage();
  const [currentPharmacyIndex, setCurrentPharmacyIndex] = useState(0);
  const [currentNursingIndex, setCurrentNursingIndex] = useState(0);
  const [currentAdminIndex, setCurrentAdminIndex] = useState(0);

  const coreFeatures = [
    { key: 'realTimeCommunication', icon: MessageSquare, gradient: 'from-blue-500/5 via-transparent to-primary/5', bg: 'bg-primary/10', border: 'border-primary/20', iconColor: 'text-primary' },
    { key: 'criticalAlerts', icon: Bell, gradient: 'from-red-500/5 via-transparent to-amber-500/5', bg: 'bg-red-500/10', border: 'border-red-500/20', iconColor: 'text-red-500' },
    { key: 'ehrSystem', icon: FileText, gradient: 'from-green-500/5 via-transparent to-blue-500/5', bg: 'bg-green-500/10', border: 'border-green-500/20', iconColor: 'text-green-600 dark:text-green-500' },
    { key: 'shiftManagement', icon: ClockIcon, gradient: 'from-purple-500/5 via-transparent to-pink-500/5', bg: 'bg-purple-500/10', border: 'border-purple-500/20', iconColor: 'text-purple-500' },
    { key: 'labIntegration', icon: Beaker, gradient: 'from-cyan-500/5 via-transparent to-teal-500/5', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', iconColor: 'text-cyan-500' },
    { key: 'complianceSecurity', icon: ShieldCheck, gradient: 'from-orange-500/5 via-transparent to-yellow-500/5', bg: 'bg-orange-500/10', border: 'border-orange-500/20', iconColor: 'text-orange-500' },
  ];

  // Auto-cycle through dashboards
  useEffect(() => {
    const pharmacyInterval = setInterval(() => {
      setCurrentPharmacyIndex((prev) => (prev + 1) % 3);
    }, 4000);

    const nursingInterval = setInterval(() => {
      setCurrentNursingIndex((prev) => (prev + 1) % 3);
    }, 4500);

    const adminInterval = setInterval(() => {
      setCurrentAdminIndex((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(pharmacyInterval);
      clearInterval(nursingInterval);
      clearInterval(adminInterval);
    };
  }, []);

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
        <div className="text-center mb-16 space-y-4">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t('features.hero.title')}
            </span>
            <motion.span
              className="block text-primary font-extrabold mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('features.hero.subtitle')}
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {t('features.hero.description')}
          </motion.p>
        </div>
      </motion.section>

      {/* Core Features Grid */}
      <motion.section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.key}
                className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl pointer-events-none`}></div>
                <div className="relative">
                  <motion.div
                    className={`backdrop-blur-sm ${feature.bg} ${feature.border} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:${feature.bg.replace('/10', '/15')} transition-all duration-200`}
                    whileHover={{ rotate: index % 2 === 0 ? 5 : -5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className={`${feature.iconColor} h-6 w-6`} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {t(`features.coreFeatures.${feature.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {t(`features.coreFeatures.${feature.key}.description`)}
                  </p>
                  <div className="space-y-3">
                    {(t(`features.coreFeatures.${feature.key}.features`) as unknown as any[]).map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Dashboard Previews Section */}
      <motion.section
        className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('features.dashboards.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('features.dashboards.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-16">
            {/* Operational Dashboards Section */}
            <div className="relative">
              <div className="absolute -top-12 -left-4 lg:-left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-12  -right-4 lg:-right-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

                <AnimatePresence mode="wait">
                  {currentPharmacyIndex === 0 && (
                    <motion.div
                      key="pharmacy"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-primary to-primary/90 p-4 text-primary-foreground">
                        <h3 className="font-semibold flex items-center">
                          <Pill className="mr-2 h-4 w-4" />
                          {t('features.dashboards.operational.pharmacy.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.operational.pharmacy.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.pharmacy.metrics.activeRx')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">18</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.pharmacy.metrics.completed')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">3</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.pharmacy.metrics.cancelled')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.pharmacy.metrics.totalRx')}</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>{t('features.dashboards.operational.pharmacy.table.patient')}</span>
                              <span>{t('features.dashboards.operational.pharmacy.table.medication')}</span>
                              <span>{t('features.dashboards.operational.pharmacy.table.dose')}</span>
                              <span>{t('features.dashboards.operational.pharmacy.table.status')}</span>
                            </div>
                            <div className="space-y-2">
                              {(t('features.dashboards.operational.pharmacy.data.patients') as unknown as any[]).map((patient, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 ${idx < 2 ? 'border-b border-border/20' : ''}`}>
                                  <span className="text-sm">{patient.name}</span>
                                  <span className="text-sm font-medium">{patient.medication}</span>
                                  <span className="text-sm">{patient.dose}</span>
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">{patient.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentPharmacyIndex === 1 && (
                    <motion.div
                      key="lab"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <Beaker className="mr-2 h-4 w-4" />
                          {t('features.dashboards.operational.lab.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.operational.lab.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">156</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.lab.metrics.testsToday')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">142</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.lab.metrics.completed')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">12</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.lab.metrics.pending')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">2</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.operational.lab.metrics.critical')}</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>{t('features.dashboards.operational.lab.table.patient')}</span>
                              <span>{t('features.dashboards.operational.lab.table.testType')}</span>
                              <span>{t('features.dashboards.operational.lab.table.status')}</span>
                              <span>{t('features.dashboards.operational.lab.table.result')}</span>
                            </div>
                            <div className="space-y-2">
                              {(t('features.dashboards.operational.lab.data.patients') as unknown as any[]).map((patient, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 ${idx < 2 ? 'border-b border-border/20' : ''}`}>
                                  <span className="text-sm">{patient.name}</span>
                                  <span className="text-sm font-medium">{patient.testType}</span>
                                  <Badge className={`bg-${patient.status === 'Normal' ? 'green' : patient.status === 'Abnormal' ? 'yellow' : 'blue'}-100 text-${patient.status === 'Normal' ? 'green' : patient.status === 'Abnormal' ? 'yellow' : 'blue'}-800 dark:bg-${patient.status === 'Normal' ? 'green' : patient.status === 'Abnormal' ? 'yellow' : 'blue'}-900/20 dark:text-${patient.status === 'Normal' ? 'green' : patient.status === 'Abnormal' ? 'yellow' : 'blue'}-400`}>{patient.status}</Badge>
                                  <span className="text-sm">{patient.result}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentPharmacyIndex === 2 && (
                    <motion.div
                      key="reception"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Reception Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Patient Flow
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">28</div>
                            <div className="text-xs text-muted-foreground">Waiting</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                            <div className="text-xs text-muted-foreground">In Room</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
                            <div className="text-xs text-muted-foreground">Checked Out</div>
                          </div>
                          <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</div>
                            <div className="text-xs text-muted-foreground">No Show</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>Patient</span>
                              <span>Appointment</span>
                              <span>Status</span>
                              <span>Room</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Anna Martinez</span>
                                <span className="text-sm font-medium">10:00 AM</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Room</Badge>
                                <span className="text-sm">204</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Robert Lee</span>
                                <span className="text-sm font-medium">10:30 AM</span>
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Waiting</Badge>
                                <span className="text-sm">-</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Maria Garcia</span>
                                <span className="text-sm font-medium">11:00 AM</span>
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">Checked In</Badge>
                                <span className="text-sm">-</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Clinical Dashboards Section */}
            <div className="relative">
              <div className="absolute -top-12  -right-4 lg:-right-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-12 -left-4 lg:-left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>

                <AnimatePresence mode="wait">
                  {currentNursingIndex === 0 && (
                    <motion.div
                      key="nursing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-accent to-accent/90 p-4 text-accent-foreground">
                        <h3 className="font-semibold flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          {t('features.dashboards.clinical.nursing.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.clinical.nursing.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          {(t('features.dashboards.clinical.nursing.workflowSteps') as unknown as any[]).map((step, idx) => {
                            const icons = [Stethoscope, Activity, Pill, FileText, Heart];
                            const colors = ['text-blue-600 dark:text-blue-400', 'text-green-600 dark:text-green-400', 'text-purple-600 dark:text-purple-400', 'text-orange-600 dark:text-orange-400', 'text-pink-600 dark:text-pink-400'];
                            const bgColors = ['bg-blue-500/10 border-blue-500/20', 'bg-green-500/10 border-green-500/20', 'bg-purple-500/10 border-purple-500/20', 'bg-orange-500/10 border-orange-500/20', 'bg-pink-500/10 border-pink-500/20'];
                            const IconComponent = icons[idx];
                            return (
                              <div key={idx} className={`backdrop-blur-sm ${bgColors[idx]} rounded-lg p-3 text-center`}>
                                <IconComponent className={`h-6 w-6 ${colors[idx]} mx-auto mb-2`} />
                                <div className="text-xs font-medium">{step}</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-green-600" />
                              {t('features.dashboards.clinical.nursing.sections.vitalSigns')}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">{t('features.dashboards.clinical.nursing.vitals.bloodPressure')}</span>
                                <span className="text-sm font-medium">120/80 mmHg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">{t('features.dashboards.clinical.nursing.vitals.heartRate')}</span>
                                <span className="text-sm font-medium">72 bpm</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">{t('features.dashboards.clinical.nursing.vitals.temperature')}</span>
                                <span className="text-sm font-medium">98.6°F</span>
                              </div>
                            </div>
                          </div>
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Pill className="h-4 w-4 mr-2 text-purple-600" />
                              {t('features.dashboards.clinical.nursing.sections.currentMedications')}
                            </h4>
                            <div className="space-y-2">
                              {(t('features.dashboards.clinical.nursing.medications') as unknown as any[]).map((med, idx) => (
                                <div key={idx} className="text-sm">• {med}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentNursingIndex === 1 && (
                    <motion.div
                      key="doctor"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <Stethoscope className="mr-2 h-4 w-4" />
                          {t('features.dashboards.clinical.physician.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.clinical.physician.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          {(t('features.dashboards.clinical.physician.workflowSteps') as unknown as any[]).map((step, idx) => {
                            const icons = [Stethoscope, Brain, Pill, FileText, Calendar];
                            const colors = ['text-blue-600 dark:text-blue-400', 'text-purple-600 dark:text-purple-400', 'text-green-600 dark:text-green-400', 'text-orange-600 dark:text-orange-400', 'text-pink-600 dark:text-pink-400'];
                            const bgColors = ['bg-blue-500/10 border-blue-500/20', 'bg-purple-500/10 border-purple-500/20', 'bg-green-500/10 border-green-500/20', 'bg-orange-500/10 border-orange-500/20', 'bg-pink-500/10 border-pink-500/20'];
                            const IconComponent = icons[idx];
                            return (
                              <div key={idx} className={`backdrop-blur-sm ${bgColors[idx]} rounded-lg p-3 text-center`}>
                                <IconComponent className={`h-6 w-6 ${colors[idx]} mx-auto mb-2`} />
                                <div className="text-xs font-medium">{step}</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-orange-600" />
                              {t('features.dashboards.clinical.physician.sections.recentDiagnoses')}
                            </h4>
                            <div className="space-y-2">
                              {(t('features.dashboards.clinical.physician.diagnoses') as unknown as any[]).map((diagnosis, idx) => (
                                <div key={idx} className="text-sm">• {diagnosis}</div>
                              ))}
                            </div>
                          </div>
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                              {t('features.dashboards.clinical.physician.sections.upcomingAppointments')}
                            </h4>
                            <div className="space-y-2">
                              {(t('features.dashboards.clinical.physician.appointments') as unknown as any[]).map((appointment, idx) => (
                                <div key={idx} className="text-sm">• {appointment}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentNursingIndex === 2 && (
                    <motion.div
                      key="sales"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-rose-500 to-rose-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('features.dashboards.clinical.sales.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.clinical.sales.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">47</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.clinical.sales.metrics.activeLeads')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.clinical.sales.metrics.converted')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.clinical.sales.metrics.meetings')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$2.4M</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.clinical.sales.metrics.pipeline')}</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>{t('features.dashboards.clinical.sales.table.organization')}</span>
                              <span>{t('features.dashboards.clinical.sales.table.contact')}</span>
                              <span>{t('features.dashboards.clinical.sales.table.status')}</span>
                              <span>{t('features.dashboards.clinical.sales.table.value')}</span>
                            </div>
                            <div className="space-y-2">
                              {(t('features.dashboards.clinical.sales.data.leads') as unknown as any[]).map((lead, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 ${idx < 2 ? 'border-b border-border/20' : ''}`}>
                                  <span className="text-sm">{lead.organization}</span>
                                  <span className="text-sm font-medium">{lead.contact}</span>
                                  <Badge className={`bg-${lead.status === 'Demo Scheduled' ? 'blue' : lead.status === 'Contract Signed' ? 'green' : 'yellow'}-100 text-${lead.status === 'Demo Scheduled' ? 'blue' : lead.status === 'Contract Signed' ? 'green' : 'yellow'}-800 dark:bg-${lead.status === 'Demo Scheduled' ? 'blue' : lead.status === 'Contract Signed' ? 'green' : 'yellow'}-900/20 dark:text-${lead.status === 'Demo Scheduled' ? 'blue' : lead.status === 'Contract Signed' ? 'green' : 'yellow'}-400`}>{lead.status}</Badge>
                                  <span className="text-sm">{lead.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Administrative Dashboards Section */}
            <div className="relative">
              <div className="absolute -top-12 -left-4 lg:-left-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-12  -right-4 lg:-right-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>

                <AnimatePresence mode="wait">
                  {currentAdminIndex === 0 && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-slate-500 to-slate-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          {t('features.dashboards.administrative.admin.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.administrative.admin.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-slate-500/10 border border-slate-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">1,247</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.admin.metrics.activeUsers')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.admin.metrics.uptime')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.4GB</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.admin.metrics.dataProcessed')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">156</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.admin.metrics.activeSessions')}</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>{t('features.dashboards.administrative.admin.table.systemComponent')}</span>
                              <span>{t('features.dashboards.administrative.admin.table.status')}</span>
                              <span>{t('features.dashboards.administrative.admin.table.performance')}</span>
                              <span>{t('features.dashboards.administrative.admin.table.lastCheck')}</span>
                            </div>
                            <div className="space-y-2">
                              {(t('features.dashboards.administrative.admin.data.components') as unknown as any[]).map((component, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 ${idx < 2 ? 'border-b border-border/20' : ''}`}>
                                  <span className="text-sm">{component.component}</span>
                                  <Badge className={`bg-${component.status === 'Healthy' ? 'green' : 'blue'}-100 text-${component.status === 'Healthy' ? 'green' : 'blue'}-800 dark:bg-${component.status === 'Healthy' ? 'green' : 'blue'}-900/20 dark:text-${component.status === 'Healthy' ? 'green' : 'blue'}-400`}>{component.status}</Badge>
                                  <span className="text-sm">{component.performance}</span>
                                  <span className="text-sm">{component.lastCheck}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentAdminIndex === 1 && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('features.dashboards.administrative.analytics.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.administrative.analytics.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">94.2%</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.analytics.metrics.patientSatisfaction')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">12.3min</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.analytics.metrics.avgResponseTime')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.7%</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.analytics.metrics.taskCompletion')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">23%</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.analytics.metrics.efficiencyGain')}</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>{t('features.dashboards.administrative.analytics.table.department')}</span>
                              <span>{t('features.dashboards.administrative.analytics.table.performance')}</span>
                              <span>{t('features.dashboards.administrative.analytics.table.target')}</span>
                              <span>{t('features.dashboards.administrative.analytics.table.trend')}</span>
                            </div>
                            <div className="space-y-2">
                              {(t('features.dashboards.administrative.analytics.data.departments') as unknown as any[]).map((dept, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 ${idx < 2 ? 'border-b border-border/20' : ''}`}>
                                  <span className="text-sm">{dept.department}</span>
                                  <span className="text-sm font-medium">{dept.performance}</span>
                                  <span className="text-sm">{dept.target}</span>
                                  <span className="text-sm text-green-600">{dept.trend}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentAdminIndex === 2 && (
                    <motion.div
                      key="hr"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.75 }}
                    >
                      <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
                        <h3 className="font-semibold flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          {t('features.dashboards.administrative.hr.title')}
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            {t('features.dashboards.administrative.hr.badge')}
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">247</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.hr.metrics.totalStaff')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">89%</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.hr.metrics.staffSatisfaction')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.hr.metrics.openPositions')}</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.2</div>
                            <div className="text-xs text-muted-foreground">{t('features.dashboards.administrative.hr.metrics.avgTrainingHours')}</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>{t('features.dashboards.administrative.hr.table.department')}</span>
                              <span>{t('features.dashboards.administrative.hr.table.staffCount')}</span>
                              <span>{t('features.dashboards.administrative.hr.table.utilization')}</span>
                              <span>{t('features.dashboards.administrative.hr.table.trainingStatus')}</span>
                            </div>
                            <div className="space-y-2">
                              {(t('features.dashboards.administrative.hr.data.departments') as unknown as any[]).map((dept, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 ${idx < 2 ? 'border-b border-border/20' : ''}`}>
                                  <span className="text-sm">{dept.department}</span>
                                  <span className="text-sm font-medium">{dept.staffCount}</span>
                                  <span className="text-sm">{dept.utilization}</span>
                                  <Badge className={`bg-${dept.trainingStatus === 'Complete' ? 'green' : 'blue'}-100 text-${dept.trainingStatus === 'Complete' ? 'green' : 'blue'}-800 dark:bg-${dept.trainingStatus === 'Complete' ? 'green' : 'blue'}-900/20 dark:text-${dept.trainingStatus === 'Complete' ? 'green' : 'blue'}-400`}>{dept.trainingStatus}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-gradient-to-r from-primary/90 to-primary border border-primary/20 rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {t('features.cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              {t('features.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('features.cta.startTrial')}
                </Button>
              </Link>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  {t('features.cta.contactSales')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default FeaturesPage;