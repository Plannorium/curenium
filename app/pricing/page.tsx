"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Zap,
  Users,
  Shield,
  Headphones,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

function PricingPage() {
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small clinics and individual practitioners",
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        "Up to 50 users",
        "Basic messaging",
        "Appointment scheduling",
        "Patient records",
        "Basic reporting",
        "Email support",
      ],
      limitations: [
        "No advanced EHR features",
        "Limited integrations",
        "Basic analytics",
      ],
      popular: false,
      color: "blue",
    },
    {
      name: "Professional",
      description: "Ideal for growing healthcare facilities",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        "Up to 200 users",
        "Advanced messaging & alerts",
        "Complete EHR system",
        "Lab integration",
        "Advanced analytics",
        "Priority support",
        "Custom integrations",
      ],
      limitations: [
        "Advanced AI features",
        "White-label options",
      ],
      popular: true,
      color: "primary",
    },
    {
      name: "Enterprise",
      description: "For large hospitals and healthcare networks",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        "Unlimited users",
        "All Professional features",
        "AI-powered insights",
        "White-label solution",
        "Dedicated support",
        "Custom development",
        "Advanced security",
        "Compliance automation",
      ],
      limitations: [],
      popular: false,
      color: "purple",
    },
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
              className="px-4 py-2.5 text-sm font-medium text-primary rounded-xl transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50"
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
              Simple, Transparent
            </span>
            <span className="block text-primary font-extrabold mt-2">
              Pricing
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your healthcare organization. All plans include our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="backdrop-blur-sm bg-muted/50 border border-border/50 rounded-2xl p-1 flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative backdrop-blur-xl bg-card/80 border rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02] ${
                plan.popular
                  ? 'border-primary/50 shadow-primary/25'
                  : 'border-border/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="backdrop-blur-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    <Sparkles className="inline-block mr-2 h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${plan.color}-500/5 via-transparent to-${plan.color === 'primary' ? 'accent' : 'primary'}-500/5 rounded-3xl pointer-events-none`} />

              <div className="relative">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Billed annually at ${plan.yearlyPrice}
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } transition-all duration-300 hover:scale-[1.02]`}
                    size="lg"
                  >
                    {plan.popular ? (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Start Free Trial
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">What's Included</h4>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="text-green-500 mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mt-6">Limitations</h4>
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start">
                          <X className="text-red-500 mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground leading-relaxed">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Curenium pricing and features.
            </p>
          </div>

          <div className="space-y-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Can I change plans at any time?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! We offer a 14-day free trial for all plans. No credit card required to get started.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Do you offer discounts for non-profits?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes, we offer special pricing for qualified non-profit healthcare organizations. Contact our sales team for details.
              </p>
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
              Ready to transform your healthcare workflow?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Start your free trial today and see how Curenium can improve patient care and team communication.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                >
                  <Headphones className="mr-2 h-5 w-5" />
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

export default PricingPage;