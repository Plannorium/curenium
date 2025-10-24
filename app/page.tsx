import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ClockIcon, MessageSquare, Bell, ArrowRight, Twitter, Linkedin, Facebook, Sparkles } from 'lucide-react';
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import type { Session } from "next-auth";

function LandingPage({ session }: { session: Session | null }) {
  return <div className="min-h-screen bg-background text-foreground">
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
            <Link href="/" className="flex items-center gap-3 group" prefetch={false}> 
              <Image
                src="/curenium-logo-bg-none.png"
                alt="Curenium Logo" 
                width={128}
                height={32}
                className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex items-center">
                <span className="font-bold text-xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-200">
                  Curenium
                </span>
                <div className="h-1.5 w-6 bg-gradient-to-r from-primary to-primary/70 ml-2 rounded-full shadow-sm group-hover:shadow-primary/25 transition-all duration-300"></div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link 
              href="#features" 
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50" 
              prefetch={false}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50" 
              prefetch={false}
            >
              Pricing
            </Link>
            <Link 
              href="#contact" 
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50" 
              prefetch={false}
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard" prefetch={false}>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-primary/20 focus:outline-none backdrop-blur-sm border border-primary/20 cursor-pointer"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
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
              </>
            )}
            <div className="ml-2 ">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

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
                Curenium is a secure real-time communication platform for hospital
                teams, wards, and departments. Streamline collaboration, enhance
                patient care, and reduce communication errors.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200">
                Request Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              <div className="flex items-start group">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4 group-hover:bg-primary/15 transition-all duration-200">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Secure & Compliant</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    HIPAA-compliant messaging for healthcare teams
                  </p>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4 group-hover:bg-primary/15 transition-all duration-200">
                  <ClockIcon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Real-time Updates</h3>
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
                  <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full font-medium">Live</div>
                </h3>
              </div>
              
              <div className="relative p-6 space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">DR</span>
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
                    <p className="text-xs text-muted-foreground mt-2">You • Just now</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center ml-3 flex-shrink-0">
                    <span className="text-accent-foreground font-semibold text-sm">ME</span>
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
                <h3 className="text-xl font-bold text-foreground mb-3">Secure Messaging</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  End-to-end encrypted communication for sensitive patient
                  discussions.
                </p>
                <Link href="/features" className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200">
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
                <h3 className="text-xl font-bold text-foreground mb-3">Critical Alerts</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Prioritize urgent communications with our tiered alert system.
                </p>
                <Link href="/features" className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200">
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
                <h3 className="text-xl font-bold text-foreground mb-3">Shift Management</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Seamless handovers with integrated scheduling and notes.
                </p>
                <Link href="/features" className="text-primary hover:text-primary/80 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-all duration-200">
                  Learn more <ArrowRight size={16} className="ml-2" />
                </Link>
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
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                Request Demo
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
                Contact Sales
              </Button>
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
              <Image
                src="/curenium-logo-bg-none.png"
                alt="Curenium Logo"
                width={128}
                height={32}
                className="h-8 w-auto"
              />
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Empowering Care Teams with Clarity.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Pricing</Link></li>
                <li><Link href="/security" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">About</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Careers</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Privacy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Terms</Link></li>
                <li><Link href="/compliance" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground md:order-1">
              &copy; {new Date().getFullYear()} Plannorium. All rights reserved.
            </p>
            <div className="flex space-x-4 md:order-2">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  return <LandingPage session={session} />;
}