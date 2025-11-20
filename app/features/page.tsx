"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ClockIcon,
  MessageSquare,
  Bell,
  ArrowRight,
  Twitter,
  Linkedin,
  Facebook,
  Sparkles,
  Activity,
  Users,
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  Beaker,
  Heart,
  Zap,
  CheckCircle,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

function FeaturesPage() {
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
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
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/95 border-b border-border/50 shadow-lg supports-[backdrop-filter]:bg-background/80">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

        <div className="relative container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              prefetch={false}
            >
              {isHydrated ? (
                <Image
                  src={
                    theme === "dark"
                      ? "/curenium-logo-d.png"
                      : "/curenium-logo.png"
                  }
                  alt="Curenium Logo"
                  width={128}
                  height={32}
                  className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="h-8 w-32 bg-muted/20 rounded animate-pulse" />
              )}
              <div className="flex items-center">
                <span className="font-bold text-xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-200">
                  Curenium
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/features"
              className="px-4 py-2.5 text-sm font-medium text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50"
              prefetch={false}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50"
              prefetch={false}
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" prefetch={false}>
              <Button
                variant="ghost"
                size="sm"
                className="backdrop-blur-sm bg-background/50 hover:bg-accent/50 border border-border/30 hover:border-border/50 text-foreground hover:text-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup" prefetch={false}>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-primary/20 focus:outline-none backdrop-blur-sm border border-primary/20"
              >
                Sign Up
              </Button>
            </Link>
            <div className="ml-2 ">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <span className="block text-primary font-extrabold mt-2">
              Modern Healthcare
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how Curenium's comprehensive suite of features transforms healthcare communication and patient care management.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Communication */}
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-200">
                  <MessageSquare className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Real-time Communication
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Secure, HIPAA-compliant messaging with instant notifications across all departments and devices.
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
            </div>

            {/* Critical Alerts */}
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/15 transition-all duration-200">
                  <Bell className="text-red-500 h-6 w-6" />
                </div>
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
            </div>

            {/* EHR Integration */}
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/15 transition-all duration-200">
                  <FileText className="text-green-600 dark:text-green-500 h-6 w-6" />
                </div>
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
            </div>

            {/* Shift Management */}
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/15 transition-all duration-200">
                  <ClockIcon className="text-purple-500 h-6 w-6" />
                </div>
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
            </div>

            {/* Lab Integration */}
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-cyan-500/10 border border-cyan-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/15 transition-all duration-200">
                  <Beaker className="text-cyan-500 h-6 w-6" />
                </div>
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
            </div>

            {/* Compliance & Security */}
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/15 transition-all duration-200">
                  <ShieldCheck className="text-orange-500 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Compliance & Security
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Enterprise-grade security with full HIPAA compliance and comprehensive audit trails.
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
                  className="bg-white text-primary hover:bg-white/90 dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative backdrop-blur-sm bg-muted/50 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              {isHydrated ? (
                <Image
                  src={
                    theme === "dark"
                      ? "/curenium-logo-d.png"
                      : "/curenium-logo.png"
                  }
                  alt="Curenium Logo"
                  width={128}
                  height={32}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="h-8 w-32 bg-muted/20 rounded animate-pulse" />
              )}
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Premium Digital Solutions • SaaS • Design • Development
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compliance"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground md:order-1">
              &copy; {new Date().getFullYear()} Plannorium. All rights reserved.
            </p>
            <div className="flex space-x-4 md:order-2">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FeaturesPage;