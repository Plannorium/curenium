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

function FeaturesPage() {
  const [currentPharmacyIndex, setCurrentPharmacyIndex] = useState(0);
  const [currentNursingIndex, setCurrentNursingIndex] = useState(0);
  const [currentAdminIndex, setCurrentAdminIndex] = useState(0);

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
              Powerful Features for
            </span>
            <motion.span
              className="block text-primary font-extrabold mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Modern Healthcare
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Discover how Curenium's comprehensive suite of features transforms healthcare communication and patient care management.
          </motion.p>
        </div>
      </motion.section>

      {/* Core Features Grid */}
      <motion.section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Communication */}
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
                  Real-time Communication
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Secure, compliant messaging with instant notifications across all departments and devices.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Multi-device sync</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>File sharing & attachments</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Critical Alerts */}
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
                  Critical Alerts System
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Tiered alert system ensuring urgent communications reach the right people instantly.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Priority-based notifications</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Push notifications & SMS</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Escalation workflows</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* EHR Integration */}
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
                  <FileText className="text-green-600 dark:text-green-500 h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Complete EHR System
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Comprehensive electronic health records with patient management, vitals tracking, and clinical notes.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Patient profiles & history</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Vitals monitoring</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Clinical documentation</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shift Management */}
            <motion.div
              className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <motion.div
                  className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/15 transition-all duration-200"
                  whileHover={{ rotate: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ClockIcon className="text-purple-500 h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Shift Management
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Seamless shift handovers with integrated scheduling, notes, and patient status updates.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Automated scheduling</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Handover notes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Staff coordination</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lab Integration */}
            <motion.div
              className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <motion.div
                  className="backdrop-blur-sm bg-cyan-500/10 border border-cyan-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/15 transition-all duration-200"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Beaker className="text-cyan-500 h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Lab Integration
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Streamlined lab order management with real-time results tracking and automated notifications.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Order tracking</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Result notifications</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Quality assurance</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Compliance & Security */}
            <motion.div
              className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <motion.div
                  className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/15 transition-all duration-200"
                  whileHover={{ rotate: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ShieldCheck className="text-orange-500 h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Compliance & Security
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Enterprise-grade security with full security compliance and comprehensive audit trails.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Secure & encrypted</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Audit logging</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span>Data encryption</span>
                  </div>
                </div>
              </div>
            </motion.div>
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
              Experience the Power of Curenium Dashboards
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See how our specialized dashboards transform healthcare workflows for different roles and departments.
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
                          Pharmacy Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Live Demo
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                            <div className="text-xs text-muted-foreground">Active Rx</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">18</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">3</div>
                            <div className="text-xs text-muted-foreground">Cancelled</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45</div>
                            <div className="text-xs text-muted-foreground">Total Rx</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>Patient</span>
                              <span>Medication</span>
                              <span>Dose</span>
                              <span>Status</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">John Smith</span>
                                <span className="text-sm font-medium">Amoxicillin 500mg</span>
                                <span className="text-sm">500mg</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Active</Badge>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Sarah Johnson</span>
                                <span className="text-sm font-medium">Lisinopril 10mg</span>
                                <span className="text-sm">10mg</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Mike Davis</span>
                                <span className="text-sm font-medium">Metformin 1000mg</span>
                                <span className="text-sm">1000mg</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Active</Badge>
                              </div>
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
                          Laboratory Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Test Results
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">156</div>
                            <div className="text-xs text-muted-foreground">Tests Today</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">142</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="backdrop-blur-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">12</div>
                            <div className="text-xs text-muted-foreground">Pending</div>
                          </div>
                          <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">2</div>
                            <div className="text-xs text-muted-foreground">Critical</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>Patient</span>
                              <span>Test Type</span>
                              <span>Status</span>
                              <span>Result</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Emma Wilson</span>
                                <span className="text-sm font-medium">CBC Complete</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Normal</Badge>
                                <span className="text-sm">Complete</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">David Brown</span>
                                <span className="text-sm font-medium">Lipid Panel</span>
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Abnormal</Badge>
                                <span className="text-sm">Complete</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Lisa Chen</span>
                                <span className="text-sm font-medium">Thyroid Function</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Pending</Badge>
                                <span className="text-sm">In Progress</span>
                              </div>
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
                          Nursing Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Care Workflow
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Assessment</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <Activity className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Monitoring</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Medication</div>
                          </div>
                          <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Documentation</div>
                          </div>
                          <div className="backdrop-blur-sm bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 text-center">
                            <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Care Planning</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-green-600" />
                              Vital Signs
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Blood Pressure</span>
                                <span className="text-sm font-medium">120/80 mmHg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Heart Rate</span>
                                <span className="text-sm font-medium">72 bpm</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Temperature</span>
                                <span className="text-sm font-medium">98.6°F</span>
                              </div>
                            </div>
                          </div>
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Pill className="h-4 w-4 mr-2 text-purple-600" />
                              Current Medications
                            </h4>
                            <div className="space-y-2">
                              <div className="text-sm">• Amoxicillin 500mg - 3x daily</div>
                              <div className="text-sm">• Ibuprofen 400mg - as needed</div>
                              <div className="text-sm">• Vitamin D 1000 IU - daily</div>
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
                          Physician Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Medical Workflow
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Assessment</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Diagnosis</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <Pill className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Prescription</div>
                          </div>
                          <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Documentation</div>
                          </div>
                          <div className="backdrop-blur-sm bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 text-center">
                            <Calendar className="h-6 w-6 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                            <div className="text-xs font-medium">Follow-up</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-orange-600" />
                              Recent Diagnoses
                            </h4>
                            <div className="space-y-2">
                              <div className="text-sm">• Upper Respiratory Infection</div>
                              <div className="text-sm">• Hypertension (Stage 1)</div>
                              <div className="text-sm">• Vitamin D Deficiency</div>
                            </div>
                          </div>
                          <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                              Upcoming Appointments
                            </h4>
                            <div className="space-y-2">
                              <div className="text-sm">• Follow-up: Dec 15, 2:00 PM</div>
                              <div className="text-sm">• Lab Review: Dec 20, 10:00 AM</div>
                              <div className="text-sm">• Consultation: Dec 22, 3:30 PM</div>
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
                          Sales & Outreach Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Lead Management
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">47</div>
                            <div className="text-xs text-muted-foreground">Active Leads</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                            <div className="text-xs text-muted-foreground">Converted</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</div>
                            <div className="text-xs text-muted-foreground">Meetings</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$2.4M</div>
                            <div className="text-xs text-muted-foreground">Pipeline</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>Organization</span>
                              <span>Contact</span>
                              <span>Status</span>
                              <span>Value</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">City General Hospital</span>
                                <span className="text-sm font-medium">Dr. Sarah Mitchell</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Demo Scheduled</Badge>
                                <span className="text-sm">$850K</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Regional Medical Center</span>
                                <span className="text-sm font-medium">Admin Johnson</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Contract Signed</Badge>
                                <span className="text-sm">$1.2M</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Community Health Clinic</span>
                                <span className="text-sm font-medium">Nurse Director Lee</span>
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Proposal Sent</Badge>
                                <span className="text-sm">$350K</span>
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
                          Administration Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            System Overview
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-slate-500/10 border border-slate-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">1,247</div>
                            <div className="text-xs text-muted-foreground">Active Users</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                            <div className="text-xs text-muted-foreground">Uptime</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.4GB</div>
                            <div className="text-xs text-muted-foreground">Data Processed</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">156</div>
                            <div className="text-xs text-muted-foreground">Active Sessions</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>System Component</span>
                              <span>Status</span>
                              <span>Performance</span>
                              <span>Last Check</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Database Server</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Healthy</Badge>
                                <span className="text-sm">98% CPU</span>
                                <span className="text-sm">2 min ago</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">API Gateway</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Healthy</Badge>
                                <span className="text-sm">45ms latency</span>
                                <span className="text-sm">1 min ago</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Backup System</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Running</Badge>
                                <span className="text-sm">2.1GB/hr</span>
                                <span className="text-sm">5 min ago</span>
                              </div>
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
                          Analytics Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Performance Metrics
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">94.2%</div>
                            <div className="text-xs text-muted-foreground">Patient Satisfaction</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">12.3min</div>
                            <div className="text-xs text-muted-foreground">Avg Response Time</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.7%</div>
                            <div className="text-xs text-muted-foreground">Task Completion</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">23%</div>
                            <div className="text-xs text-muted-foreground">Efficiency Gain</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>Department</span>
                              <span>Performance</span>
                              <span>Target</span>
                              <span>Trend</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Emergency Room</span>
                                <span className="text-sm font-medium">96.5%</span>
                                <span className="text-sm">95%</span>
                                <span className="text-sm text-green-600">↗ +2.1%</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Laboratory</span>
                                <span className="text-sm font-medium">98.2%</span>
                                <span className="text-sm">97%</span>
                                <span className="text-sm text-green-600">↗ +1.8%</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Pharmacy</span>
                                <span className="text-sm font-medium">97.8%</span>
                                <span className="text-sm">96%</span>
                                <span className="text-sm text-green-600">↗ +0.9%</span>
                              </div>
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
                          HR & Staffing Dashboard
                          <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                            Workforce Management
                          </div>
                        </h3>
                      </div>

                      <div className="relative p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">247</div>
                            <div className="text-xs text-muted-foreground">Total Staff</div>
                          </div>
                          <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">89%</div>
                            <div className="text-xs text-muted-foreground">Staff Satisfaction</div>
                          </div>
                          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                            <div className="text-xs text-muted-foreground">Open Positions</div>
                          </div>
                          <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.2</div>
                            <div className="text-xs text-muted-foreground">Avg Training Hours</div>
                          </div>
                        </div>

                        <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                              <span>Department</span>
                              <span>Staff Count</span>
                              <span>Utilization</span>
                              <span>Training Status</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Nursing</span>
                                <span className="text-sm font-medium">89</span>
                                <span className="text-sm">94%</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Complete</Badge>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-border/20">
                                <span className="text-sm">Physicians</span>
                                <span className="text-sm font-medium">34</span>
                                <span className="text-sm">87%</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Progress</Badge>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm">Administration</span>
                                <span className="text-sm font-medium">22</span>
                                <span className="text-sm">91%</span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Complete</Badge>
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
              Ready to experience the future of healthcare communication?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Join leading hospitals already using Curenium to improve patient outcomes through better team collaboration.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Contact Sales
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