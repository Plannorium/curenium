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
                About Curenium
              </span>
            </h1>
            <p className="text-left text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed lg:max-w-xl">
              Curenium is revolutionizing healthcare communication by bridging critical gaps that have long plagued medical teams.
              Born from real-world healthcare challenges and powered by cutting-edge technology, we're building a comprehensive platform
              that transforms fragmented communication into seamless collaboration. Our mission is to empower healthcare professionals
              with intelligent tools that enhance patient care, streamline workflows, and ultimately save lives through better coordination
              and faster decision-making in high-stakes environments.
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="backdrop-blur-sm bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">10+</div>
                <div className="text-sm text-muted-foreground">Expert team members</div>
              </div>
              <div className="backdrop-blur-sm bg-accent/5 border border-accent/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold dark:text-accent mb-1">6</div>
                <div className="text-sm text-muted-foreground">Beta healthcare partners</div>
              </div>
              <div className="backdrop-blur-sm bg-green-500/5 border border-green-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-500 mb-1">20</div>
                <div className="text-sm text-muted-foreground">Healthcare workflows mapped</div>
              </div>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed text-left lg:max-w-xl">
              In beta testing with healthcare partners, Curenium delivers instant, secure communication for critical updates and emergency alerts.
              Our platform saves lives by eliminating communication barriers, with clinicians at the heart of every decision.
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
                Revolutionizing Healthcare Communication
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed lg:max-w-xl">
                Founded in 2025, Curenium emerged from a vision to bridge the communication gaps in healthcare.
                Plannorium brings together talented professionals from around the globe, from the Middle East and Africa
                to Europe, Asia, and the Americas. Our diverse team represents the future of healthcare technology,
                where global perspectives meet compassionate care and innovation. Curenium is built for healthcare professionals who demand excellence. Our platform combines
                real-time collaboration, intelligent patient management, and seamless communication tools
                to empower medical teams and improve patient outcomes.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -left-4 lg:-left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                <div className="relative p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6">Curenium Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Users className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Real-time Collaboration</h4>
                        <p className="text-sm text-muted-foreground">Instant messaging and team coordination</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Target className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Patient Management</h4>
                        <p className="text-sm text-muted-foreground">Comprehensive EHR and patient tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-2 rounded-lg mr-4">
                        <Award className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Smart Alerts</h4>
                        <p className="text-sm text-muted-foreground">Intelligent notifications and workflow automation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-6 border-t border-border/30 lg:justify-center">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <span className="text-primary font-semibold text-sm">Secure Messaging</span>
                </div>
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <span className="text-primary font-semibold text-sm">Patient-Centric Design</span>
                </div>
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <span className="text-primary font-semibold text-sm">Enterprise Security</span>
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To revolutionize healthcare communication by providing healthcare professionals with
                intelligent, secure, and intuitive tools that enhance patient care and team collaboration.
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
                To become the global standard for healthcare communication platforms, empowering medical
                professionals worldwide with tools that save lives and improve healthcare outcomes.
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
            Global Presence, Local Impact
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our team spans continents, bringing diverse perspectives and expertise to healthcare innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="text-green-600 dark:text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Universal</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                With a strong presence in the MiddleEast & Africa, we deliver localized solutions by understanding regional needs.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="text-purple-600 dark:text-purple-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Global Network</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                Extended reach with collaborators and partners across Europe, Asia, and the Americas, ensuring worldwide healthcare impact.
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
              Diverse Perspectives, United Mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our global team brings together healthcare experts, engineers, designers, and innovators from diverse backgrounds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-red-600 dark:text-red-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Healthcare Experts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  Doctors, nurses, and healthcare administrators bringing clinical expertise and real-world insights.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="text-blue-600 dark:text-blue-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Software Engineers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  Full-stack developers and architects from top tech companies, specializing in healthcare systems.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="text-purple-600 dark:text-purple-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">UX Designers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  Creative designers focused on intuitive, accessible healthcare interfaces that save lives.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-teal-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="text-green-600 dark:text-green-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Product Innovators</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  Strategic thinkers and product managers driving healthcare innovation and user experience.
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
            The Curenium Advantage
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We are building a platform that sets new standards in healthcare technology, focusing on security, performance, and usability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Enterprise-Grade Security</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                Protecting patient data with state-of-the-art encryption and compliance with global privacy standards.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="text-green-600 dark:text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Modern Technology Stack</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                Built on a scalable, cloud-native architecture to ensure reliability, performance, and future-readiness.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="text-purple-600 dark:text-purple-500 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Clinician-Centric Design</h3>
              <p className="text-muted-foreground leading-relaxed text-left">
                Developed in close collaboration with healthcare professionals to create intuitive and efficient workflows.
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
            Join Our Mission
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            We're not actively hiring right now, but we're always looking for passionate individuals to join our mission. Feel free to send us your resume!
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="mailto:careers@curenium.com">
              Send Your Resume
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
                  Ready to Transform Healthcare?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join us on our mission to improve healthcare communication and save lives.
                </p>
              </div>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="https://calendly.com/almussanplanner12/curenium-demo">
                    Request a Demo
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