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
import { useLanguage } from "@/contexts/LanguageContext";

function PricingPage() {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const plans = [
    {
      name: t('pricing.plans.basic.name'),
      description: t('pricing.plans.basic.description'),
      perUserMonthly: 5,
      perUserYearly: 4.17, // $50/year
      per100UsersMonthly: 500,
      flatBundleUpTo100: null,
      features: [
        t('pricing.plans.basic.features')[0],
        t('pricing.plans.basic.features')[1],
        t('pricing.plans.basic.features')[2],
        t('pricing.plans.basic.features')[3],
        t('pricing.plans.basic.features')[4],
        t('pricing.plans.basic.features')[5],
      ],
      limitations: [
        t('pricing.plans.basic.limitations')[0],
        t('pricing.plans.basic.limitations')[1],
        t('pricing.plans.basic.limitations')[2],
        t('pricing.plans.basic.limitations')[3],
      ],
      popular: false,
      color: "blue",
    },
    {
      name: t('pricing.plans.pro.name'),
      description: t('pricing.plans.pro.description'),
      perUserMonthly: 8,
      perUserYearly: 6.67, // $80/year
      per100UsersMonthly: 800,
      flatBundleUpTo100: 750, // Special flat rate
      features: [
        t('pricing.plans.pro.features')[0],
        t('pricing.plans.pro.features')[1],
        t('pricing.plans.pro.features')[2],
        t('pricing.plans.pro.features')[3],
        t('pricing.plans.pro.features')[4],
        t('pricing.plans.pro.features')[5],
        t('pricing.plans.pro.features')[6],
        t('pricing.plans.pro.features')[7],
      ],
      limitations: [
        t('pricing.plans.pro.limitations')[0],
        t('pricing.plans.pro.limitations')[1],
      ],
      popular: true,
      color: "primary",
    },
    {
      name: t('pricing.plans.enterprise.name'),
      description: t('pricing.plans.enterprise.description'),
      perUserMonthly: 13,
      perUserYearly: 10.83, // $130/year
      per100UsersMonthly: 1300,
      flatBundleUpTo100: null,
      features: [
        t('pricing.plans.enterprise.features')[0],
        t('pricing.plans.enterprise.features')[1],
        t('pricing.plans.enterprise.features')[2],
        t('pricing.plans.enterprise.features')[3],
        t('pricing.plans.enterprise.features')[4],
        t('pricing.plans.enterprise.features')[5],
        t('pricing.plans.enterprise.features')[6],
        t('pricing.plans.enterprise.features')[7],
        t('pricing.plans.enterprise.features')[8],
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
              {t('pricing.hero.title')}
            </span>
            <span className="block text-primary font-extrabold mt-2">
              {t('pricing.hero.subtitle')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('pricing.hero.description')}
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
                {t('pricing.billing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('pricing.billing.yearly')}
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {t('pricing.billing.save12')}
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
                    {t('pricing.ui.mostPopular')}
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
                    <span className="text-muted-foreground ml-2">{t('pricing.ui.perUserMonth')}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('pricing.ui.billedAnnually')} ${(plan.perUserYearly * 12).toFixed(0)}{t('pricing.ui.perUserYear')}
                    </p>
                  )}
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      ${plan.per100UsersMonthly}/month {t('pricing.ui.for100Users')}
                    </p>
                    {plan.flatBundleUpTo100 && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {t('pricing.ui.orFlat')} ${plan.flatBundleUpTo100}/month {t('pricing.ui.flatUpTo100')}
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
                        {t('pricing.ui.startFreeTrial')}
                      </>
                    ) : (
                      t('pricing.ui.getStarted')
                    )}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">{t('pricing.ui.whatsIncluded')}</h4>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="text-green-500 mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mt-6">{t('pricing.ui.limitations')}</h4>
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
              {t('pricing.addons.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('pricing.addons.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('pricing.addons.broadcastMessaging.title')}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('pricing.addons.broadcastMessaging.description')}
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.broadcastMessaging.pricing')[0]}</div>
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.broadcastMessaging.pricing')[1]}</div>
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.broadcastMessaging.pricing')[2]}</div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('pricing.addons.prioritySupport.title')}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('pricing.addons.prioritySupport.description')}
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.prioritySupport.pricing')[0]}</div>
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.prioritySupport.pricing')[1]}</div>
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.prioritySupport.pricing')[2]}</div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('pricing.addons.implementation.title')}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('pricing.addons.implementation.description')}
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.implementation.pricing')[0]}</div>
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.implementation.pricing')[1]}</div>
                  <div className="text-sm text-muted-foreground">{t('pricing.addons.implementation.pricing')[2]}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-foreground mb-4">{t('pricing.addons.pilotProgram.title')}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('pricing.addons.pilotProgram.description')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t('pricing.cta.startPilot')}
                </Button>
                <Button variant="outline" className="border-border/50">
                  {t('pricing.addons.pilotProgram.learnMore')}
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
              {t('pricing.faq.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('pricing.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('pricing.faq.questions.perUserPricing.question')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('pricing.faq.questions.perUserPricing.answer')}
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('pricing.faq.questions.flatBundle.question')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('pricing.faq.questions.flatBundle.answer')}
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('pricing.faq.questions.planChanges.question')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('pricing.faq.questions.planChanges.answer')}
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('pricing.faq.questions.freeTrial.question')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('pricing.faq.questions.freeTrial.answer')}
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('pricing.faq.questions.implementationCosts.question')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('pricing.faq.questions.implementationCosts.answer')}
              </p>
            </div>

            <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('pricing.faq.questions.annualDiscounts.question')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('pricing.faq.questions.annualDiscounts.answer')}
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
              {t('pricing.cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              {t('pricing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/contact" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('pricing.cta.startPilot')}
                </Button>
              </Link>
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <Headphones className="mr-2 h-5 w-5" />
                  {t('pricing.cta.viewCalculator')}
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