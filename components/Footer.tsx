 "use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

function Footer() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentBrand, setCurrentBrand] = useState("Curenium");

  useEffect(() => { setIsHydrated(true) }, []);

  // Animated brand name switching
  useEffect(() => {
    const brands = ["Curenium", "كيورينيوم"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % brands.length;
      setCurrentBrand(brands[currentIndex]);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative backdrop-blur-sm bg-muted/50 border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 group">
              {isHydrated && (
                <Image
                  src={
                    theme === "dark"
                      ? "/curenium-logo-d.png"
                      : "/curenium-logo.png"
                  }
                  alt={t('footer.logoAlt')}
                  width={128}
                  height={32}
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentBrand}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                    className="font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 inline-block"
                  >
                    {currentBrand}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
                __html: t('footer.description')
              }}>
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {t('footer.tags.realTime') || 'Real-time'}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {t('footer.tags.secure') || 'Secure'}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                  {t('footer.tags.compliant') || 'Compliant'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">
              {t('footer.sections.product') || 'Product'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.features') || 'Features'}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.pricing') || 'Pricing'}
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.security') || 'Security'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">
              {t('footer.sections.company') || 'Company'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.about') || 'About'}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.careers') || 'Careers'}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.contact') || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">
              {t('footer.sections.legal') || 'Legal'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.privacy') || 'Privacy'}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.terms') || 'Terms'}
                </Link>
              </li>
              <li>
                <Link
                  href="/compliance"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                >
                  {t('footer.links.compliance') || 'Compliance'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground md:order-1">
            &copy; {new Date().getFullYear()} Plannorium. {t('footer.copyright')}
          </p>
          <div className="flex space-x-4 md:order-2">
            <Link
              href="https://x.com/plannorium?t=tmJN2ekMT8Gd2mg_IGaTyw&s=09"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
            >
              <span className="sr-only">{t('footer.social.twitter')}</span>
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/plannorium/"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
            >
              <span className="sr-only">{t('footer.social.linkedin')}</span>
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.instagram.com/plannorium?igsh=YW10NTU2cWU4c24z"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
            >
              <span className="sr-only">{t('footer.social.instagram')}</span>
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61579475379975"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
            >
              <span className="sr-only">{t('footer.social.facebook')}</span>
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;