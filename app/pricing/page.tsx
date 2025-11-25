"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Headphones,
} from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";

function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const plans = [
    {
      name: "Basic",
      description: "Essential communication and EHR access for price-sensitive hospitals",
      perUserMonthly: 5,
      perUserYearly: 4.17, // $50/year
      per100UsersMonthly: 500,
      flatBundleUpTo100: null,
      features: [
        "Secure messaging & alerts",
        "Basic EHR view & patient records",
        "Appointment scheduling",
        "Basic reporting",
        "Email support",
        "Mobile app access",
      ],
      limitations: [
        "No advanced EHR features",
        "Limited integrations",
        "Basic analytics only",
        "Standard support hours",
      ],
      popular: false,
      color: "blue",
    },
    {
      name: "Pro",
      description: "Complete solution for most hospitals - recommended for optimal care",
      perUserMonthly: 8,
      perUserYearly: 6.67, // $80/year
      per100UsersMonthly: 800,
      flatBundleUpTo100: 750, // Special flat rate
      features: [
        "All Basic features",
        "Complete EHR system",
        "Advanced messaging & alerts",
        "Lab integration",
        "Advanced analytics",
        "Priority support",
        "Custom integrations",
        "API access",
      ],
      limitations: [
        "No white-label options",
        "No dedicated support",
      ],
      popular: true,
      color: "primary",
    },
    {
      name: "Enterprise",
      description: "Full-featured solution for large hospitals and healthcare networks",
      perUserMonthly: 13,
      perUserYearly: 10.83, // $130/year
      per100UsersMonthly: 1300,
      flatBundleUpTo100: null,
      features: [
        "All Pro features",
        "Unlimited users",
        "AI-powered insights",
        "White-label solution",
        "Dedicated 24/7 support",
        "Custom development",
        "Advanced security",
        "Compliance automation",
        "Priority SLA",
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
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Simple, Transparent
            </span>
            <span className="block text-primary font-extrabold mt-2">
              Pricing
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Flexible per-user pricing designed for hospitals of all sizes. Start with our Basic plan at $5/user/month, or choose flat bundles for predictable costs.
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
                  Save 12%
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
                  <div className="backdrop-blur-sm bg-linear-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    <Sparkles className="inline-block mr-2 h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-linear-to-br from-${plan.color}-500/5 via-transparent to-${plan.color === 'primary' ? 'accent' : 'primary'}-500/5 rounded-3xl pointer-events-none`} />

              <div className="relative">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      ${billingCycle === 'monthly' ? plan.perUserMonthly : plan.perUserYearly.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground ml-2">/user/month</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed annually at ${(plan.perUserYearly * 12).toFixed(0)}/user/year
                    </p>
                  )}
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      ${plan.per100UsersMonthly}/month for 100 users
                    </p>
                    {plan.flatBundleUpTo100 && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Or ${plan.flatBundleUpTo100}/month flat (up to 100 users)
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl'
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

      {/* Add-ons Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Additional Services & Add-ons
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Extend your Curenium experience with specialized services and advanced features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">Broadcast Messaging</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Patient reminders, appointment campaigns, and mass notifications.
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">10k messages included free</div>
                  <div className="text-sm text-muted-foreground">10k–49k: $299–$399/month</div>
                  <div className="text-sm text-muted-foreground">50k+: Custom pricing</div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">Priority Support & SLA</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  24/7 dedicated support with guaranteed response times.
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">$2–5/user/month</div>
                  <div className="text-sm text-muted-foreground">Or flat fee options</div>
                  <div className="text-sm text-muted-foreground">99.9% uptime SLA</div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">Implementation & Training</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Professional setup, EHR integration, and team training.
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">EHR Integration: $1K–$4K</div>
                  <div className="text-sm text-muted-foreground">Training: $500–$1.2K/day</div>
                  <div className="text-sm text-muted-foreground">Success tracking included</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-foreground mb-4">Pilot Program Special</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Try Curenium risk-free with our 3-month pilot program. Get Pro-level features for up to 100 users at a reduced rate of $1,200 total (plus minimal integration fee).
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Pilot Program
                </Button>
                <Button variant="outline" className="border-border/50">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
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
                How does per-user pricing work?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                You pay based on the number of active users in your organization. For example, 100 users on Pro plan would be $800/month. Users can be added or removed at any time, and billing adjusts automatically.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What's the difference between per-user and flat bundle pricing?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Per-user pricing scales with your team size. Flat bundles offer predictable costs for organizations up to 100 users - pay one fixed price regardless of how many users you have up to the limit.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Can I change plans at any time?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges. For flat bundles, you can switch to per-user pricing if your needs change.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! We offer a 14-day free trial for all plans. No credit card required to get started. Contact sales for pilot programs with extended trial periods.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What about implementation and training costs?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                EHR integration starts at $1,000–$4,000 depending on complexity. Training packages range from $500–$1,200 per day. We also offer success-based implementation with ROI tracking and ongoing support.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Do you offer annual discounts?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! Annual billing includes a 12% discount. We also offer 18-20% discounts for 2-year commitments, making long-term planning more cost-effective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-linear-to-r from-primary/90 to-primary border border-primary/20 rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to transform your healthcare workflow?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Start with Basic at just $5/user/month, or try our risk-free 1-month pilot program. Transform your healthcare communication today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Pilot Program
                </Button>
              </Link>
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Headphones className="mr-2 h-5 w-5" />
                  View Pricing Calculator
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

export default PricingPage;