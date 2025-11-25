"use client";

import React from "react";
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

function LandingPage() {
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
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Empowering Care Teams
                </span>
                <span className="block text-primary font-extrabold mt-2">
                  with Clarity.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Curenium is a secure real-time communication platform for
                hospital teams, wards, and departments. Streamline
                collaboration, enhance patient care, and reduce communication
                errors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group dark:text-black cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
              >
                Request Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              <div className="flex items-start group">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4 group-hover:bg-primary/15 transition-all duration-200">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Secure & Compliant
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Secure messaging for healthcare teams
                  </p>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4 group-hover:bg-primary/15 transition-all duration-200">
                  <ClockIcon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Real-time Updates
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Instant communication across departments
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

              <div className="relative bg-gradient-to-r from-primary to-primary/90 p-4 text-primary-foreground">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Emergency Ward Chat
                  <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                    Live
                  </div>
                </h3>
              </div>

              <div className="relative p-6 space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      DR
                    </span>
                  </div>
                  <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      Patient in Room 302 needs immediate attention. Blood
                      pressure dropping.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Dr. Rahman • 2m ago
                    </div> 
                  </div>
                </div>

                <div className="flex items-start justify-end">
                  <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      On my way with crash cart. ETA 30 seconds.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      You • Just now
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center ml-3 flex-shrink-0">
                    <span className="text-accent-foreground font-semibold text-sm">
                      ME
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-full px-4 py-2 text-xs font-semibold flex items-center shadow-sm"> 
                    <Bell size={12} className="mr-2 animate-pulse" />
                    Critical Alert Sent
                  </div>
                </div>
              </div>

              <div className="relative border-t border-border/30 p-4">
                <div className="flex items-center backdrop-blur-sm bg-background/50 border border-border/60 rounded-full px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground w-full text-sm"
                  />
                  <MessageSquare size={18} className="text-primary ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Built for Healthcare Teams
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Curenium combines secure messaging, shift management, and critical
              alerts in one intuitive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-200">
                  <MessageSquare className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Secure Messaging
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  End-to-end encrypted communication for sensitive patient
                  discussions.
                </p>
                <Link
                  href="/features"
                  className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200"
                >
                  Learn more <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>

            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/15 transition-all duration-200">
                  <Bell className="text-red-500 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Critical Alerts
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Prioritize urgent communications with our tiered alert system.
                </p>
                <Link
                  href="/features"
                  className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200"
                >
                  Learn more <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>

            <div className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/15 transition-all duration-200">
                  <ClockIcon className="text-green-600 dark:text-green-500 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Shift Management
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Seamless handovers with integrated scheduling and notes.
                </p>
                <Link
                  href="/features"
                  className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200"
                >
                  Learn more <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Curenium Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Why Curenium? Because Healthcare Deserves Better
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Look, we've all been there chaotic hospital shifts, missed messages, and that sinking feeling when something slips through the cracks. Curenium isn't just another app; it's the chill pill your team needs to keep things running smoothly without the stress. Built specifically for the fast-paced world of healthcare, it turns potential disasters into "no big deal" moments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Real Talk: Saves Lives
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Okay, dramatic? Maybe. But seriously, faster communication means quicker responses. Whether it's a nurse spotting an issue or a doctor needing backup, Curenium gets the word out instantly. No more paging systems from the 90s or shouting down hallways. It's like having a superpower for your team.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Built for Busy People
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Healthcare workers are juggling a million things at once. Curenium gets that. It's designed to be intuitive no steep learning curve, no confusing interfaces. Jump in, start chatting, handle alerts, and manage shifts all in one place. Because who has time for complicated software?
                </p>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Gulf Region Ready
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We know the Gulf's healthcare scene diverse teams, high standards, and unique challenges. Curenium speaks your language (literally multi-language support) and understands your culture. It's not some generic tool; it's tailored for hospitals in the region, making collaboration feel natural and effective.
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
            How Curenium Makes Your Day Easier
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            It's not rocket science, but it might as well be. Here's the lowdown on how Curenium turns healthcare chaos into something manageable.
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
                  Sign Up & Set Up
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get your hospital or ward set up in minutes. Invite your team, create channels for different departments, and you're good to go. No IT headaches we handle the heavy lifting.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Chat & Collaborate
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start messaging securely. Share patient updates, coordinate care, and keep everyone in the loop. It's like group chat, but for saving lives with end-to-end encryption and all the bells and whistles.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Handle Alerts & Shifts
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Critical alerts? Boom instant notifications. Shift handovers? Seamless notes and schedules. Curenium integrates everything so you can focus on what matters: patient care.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

              <div className="relative bg-gradient-to-r from-accent to-accent/90 p-4 text-accent-foreground">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Team Coordination
                  <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                    Active
                  </div>
                </h3>
              </div>

              <div className="relative p-6 space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-accent-foreground font-semibold text-sm">
                      RN
                    </span>
                  </div>
                  <div className="backdrop-blur-sm bg-muted/50 border border-border/30 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      Shift handover complete. Patient in 204 needs vitals check every 2 hours.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Nurse Sarah • 5m ago
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-end">
                  <div className="backdrop-blur-sm bg-accent/10 border border-accent/20 rounded-2xl p-4 max-w-xs shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed">
                      Got it. I'll take over. Any other notes?
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Dr. Ahmed • Just now
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center ml-3 flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      DA
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-full px-4 py-2 text-xs font-semibold flex items-center shadow-sm">
                    <ClockIcon size={12} className="mr-2 animate-pulse" />
                    Shift Handover Complete
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
              Ready to transform your healthcare communications?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Join hospitals across the Gulf region already using Curenium to
              improve patient care through better team communication.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                Request Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white dark:text-black/80 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export { LandingPage as LandingPageClient };
