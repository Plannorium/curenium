"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Eye,
  Server,
  Key,
  AlertTriangle,
  CheckCircle,
  Twitter,
  Linkedin,
  Facebook,
  Sparkles,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

function SecurityPage() {
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
      details: ["TLS 1.3 for data in transit", "AES-256 encryption at rest", "Zero-knowledge architecture"]
    },
    {
      icon: Shield,
      title: "Secure Infrastructure",
      description: "Built on enterprise-grade cloud infrastructure with multiple layers of security.",
      details: ["SOC 2 Type II compliant", "ISO 27001 certified", "Regular security audits"]
    },
    {
      icon: Key,
      title: "Access Control",
      description: "Role-based access control ensures users only see data they need to access.",
      details: ["Multi-factor authentication", "Role-based permissions", "Audit logging"]
    },
    {
      icon: Server,
      title: "Data Protection",
      description: "Comprehensive data protection measures safeguard patient information.",
      details: ["Regular backups", "Data anonymization", "Secure data disposal"]
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      description: "Privacy considerations are built into every feature and process.",
      details: ["Minimal data collection", "User consent management", "Data portability"]
    },
    {
      icon: AlertTriangle,
      title: "Threat Detection",
      description: "Advanced monitoring and threat detection systems protect against security incidents.",
      details: ["Real-time monitoring", "Automated alerts", "Incident response plan"]
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
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50"
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
              Security &
            </span>
            <span className="block text-primary font-extrabold mt-2">
              Trust Built-In
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your data security is our top priority. Curenium employs enterprise-grade security measures
            to protect sensitive healthcare information and ensure compliance with industry standards.
          </p>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
                <div className="relative">
                  <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-200">
                    <feature.icon className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="text-green-500 mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Standards */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Security Standards & Compliance
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We adhere to the highest security standards and regularly undergo independent audits
            to ensure your data remains protected.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
            <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="text-blue-500 h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">SOC 2 Type II</h3>
            <p className="text-sm text-muted-foreground">Trust services criteria for security, availability, and confidentiality</p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
            <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-green-500 h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">ISO 27001</h3>
            <p className="text-sm text-muted-foreground">International standard for information security management</p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
            <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Server className="text-purple-500 h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">GDPR</h3>
            <p className="text-sm text-muted-foreground">General Data Protection Regulation compliance</p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
            <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key className="text-orange-500 h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">AES-256</h3>
            <p className="text-sm text-muted-foreground">Advanced encryption standard for data protection</p>
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
              Security You Can Trust
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Join thousands of healthcare professionals who trust Curenium with their most sensitive data.
              Experience enterprise-grade security without the complexity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Securely
                </Button>
              </Link>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] dark:text-black/50"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Security Inquiry
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

export default SecurityPage;