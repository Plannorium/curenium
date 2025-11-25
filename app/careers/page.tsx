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

function CareersPage() {
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs"
    },
    {
      icon: Users,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and unlimited PTO"
    },
    {
      icon: GraduationCap,
      title: "Learning & Development",
      description: "Conference attendance, online courses, and professional development budget"
    },
    {
      icon: Briefcase,
      title: "Competitive Compensation",
      description: "Market-leading salaries, equity participation, and performance bonuses"
    },
    {
      icon: Users,
      title: "Collaborative Culture",
      description: "Diverse, inclusive team with regular virtual and in-person meetups"
    },
    {
      icon: Zap,
      title: "Innovation Focus",
      description: "Work on cutting-edge healthcare technology that makes a real impact"
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer focus:ring-2 focus:ring-primary/20 focus:outline-none backdrop-blur-sm border border-primary/20"
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
              Join Our
            </span>
            <span className="block text-primary font-extrabold mt-2">
              Mission
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Help us build the future of healthcare communication. We're looking for passionate,
            talented individuals who want to make a real impact in healthcare technology.
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Join Curenium
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We're not just another tech company. We're building solutions that save lives and improve healthcare outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
                <div className="relative">
                  <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-200">
                    <benefit.icon className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Open Positions
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find your next opportunity to work on meaningful projects that make a difference in healthcare.
          </p>
        </div>

        <div className="text-center py-16">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-12 shadow-xl max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-primary h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Open Positions Coming Soon</h3>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                We're actively building our team and will be posting exciting opportunities
                in healthcare technology, software development, and product design.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you're passionate about healthcare innovation and want to be part of our mission,
                we'd love to hear from you. Send us your resume via mail and let us know why you'd be a great fit.
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
              Our Culture
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe in fostering an environment where innovation thrives, collaboration is natural,
              and every team member feels valued and empowered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Innovation First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We encourage creative thinking and provide the resources needed to turn bold ideas into reality.
                  Our team members have the freedom to experiment and learn from both successes and failures.
                </p>
              </div>

              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Work-Life Balance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We understand that great work comes from happy, healthy individuals. That's why we offer
                  flexible work arrangements and prioritize the well-being of our team.
                </p>
              </div>

              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Continuous Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Technology evolves rapidly, and so do we. We invest in our team's professional development
                  through conferences, courses, and hands-on learning opportunities.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                <div className="relative p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6">What We Value</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Users className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Collaboration</h4>
                        <p className="text-sm text-muted-foreground">We work together, share knowledge, and support each other</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Zap className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Excellence</h4>
                        <p className="text-sm text-muted-foreground">We strive for the highest quality in everything we do</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Heart className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Empathy</h4>
                        <p className="text-sm text-muted-foreground">We understand our users and build with compassion</p>
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
              Ready to Make an Impact?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Join a team that's passionate about transforming healthcare through technology.
              We offer competitive compensation, meaningful work, and the opportunity to grow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                View Open Positions
              </Button>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Contact Us
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