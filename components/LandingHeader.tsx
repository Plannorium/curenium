"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function LandingHeader() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
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
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              pathname === '/features'
                ? 'text-primary bg-primary/10 border border-primary/20'
                : 'text-muted-foreground hover:text-primary hover:bg-accent/50 focus:bg-accent/50'
            }`}
            prefetch={false}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              pathname === '/pricing'
                ? 'text-primary bg-primary/10 border border-primary/20'
                : 'text-muted-foreground hover:text-primary hover:bg-accent/50 focus:bg-accent/50'
            }`}
            prefetch={false}
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              pathname === '/contact'
                ? 'text-primary bg-primary/10 border border-primary/20'
                : 'text-muted-foreground hover:text-primary hover:bg-accent/50 focus:bg-accent/50'
            }`}
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
  );
}