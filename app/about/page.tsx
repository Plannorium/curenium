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
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

function AboutPage() {
  const { theme } = useTheme();
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
      title: "Mission-Driven",
      description: "We exist to improve healthcare outcomes through innovative technology solutions."
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "We constantly push boundaries to deliver cutting-edge healthcare solutions."
    },
    {
      icon: Users,
      title: "Human-Centered",
      description: "Every decision we make prioritizes the needs of healthcare professionals and patients."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in everything we build and deliver."
    }
  ];

  const milestones = [
    { year: "2020", event: "Plannorium founded in Kano, Nigeria" },
    { year: "2021", event: "First healthcare SaaS product launched" },
    { year: "2022", event: "Expanded to Saudi Arabia market" },
    { year: "2023", event: "Curenium healthcare platform released" },
    { year: "2024", event: "Reached 500+ healthcare facilities" }
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
              About
            </span>
            <span className="block text-primary font-extrabold mt-2">
              Plannorium
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're a premium digital solutions company building world-class SaaS platforms and creative experiences
            for businesses in the GCC region and beyond.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Premium Digital Solutions
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded in 2020, Plannorium has rapidly evolved from a software development agency
                into a leading SaaS company. We specialize in creating human-centered digital products
                that combine innovation, functionality, and premium design.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our journey began in Kano, Nigeria, and has expanded to serve clients across the GCC region,
                with plans for global expansion. We believe in delivering solutions that not only work
                exceptionally well but also provide an outstanding user experience.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
                  <span className="text-primary font-semibold">10+ Years Combined Experience</span>
                </div>
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
                  <span className="text-primary font-semibold">500+ Happy Clients</span>
                </div>
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
                  <span className="text-primary font-semibold">GCC Region Focus</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                <div className="relative p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6">Our Services</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Code className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Software Development</h4>
                        <p className="text-sm text-muted-foreground">Web, mobile, and SaaS applications</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Palette className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Creative Design</h4>
                        <p className="text-sm text-muted-foreground">Branding, UI/UX, and visual identity</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Rocket className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Product Development</h4>
                        <p className="text-sm text-muted-foreground">End-to-end SaaS platform creation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To build premium, scalable, human-centered digital products—delivered with the same detail,
                polish, and quality associated with world-class brands.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="text-green-600 dark:text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To become a leading technology and design powerhouse across the GCC, trusted for innovation,
                creative excellence, and reliable digital execution.
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
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do and every product we build.
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
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From humble beginnings to becoming a trusted name in digital solutions.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary to-primary/50"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
                    <div className="relative">
                      <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                      <p className="text-muted-foreground">{milestone.event}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
              </div>
            ))}
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
              Join Us on Our Journey
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Whether you're a healthcare provider looking for innovative solutions or a business seeking
              premium digital services, we'd love to work with you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Get In Touch
                </Button>
              </Link>
              <Link href="/careers" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join Our Team
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

export default AboutPage;