"use client"

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldXIcon, ArrowLeftIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const UnauthorizedPage = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="relative w-full max-w-md backdrop-blur-lg bg-card/80 border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500">
        <CardHeader className="text-center pb-6 pt-8">
          {/* Icon with error styling */}
          <div className="mx-auto mb-4 relative">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 backdrop-blur-sm">
              <ShieldXIcon className="w-8 h-8 text-red-500" />
            </div>
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-red-500/30 animate-ping"></div>
          </div>

          <CardTitle className="text-3xl md:text-4xl font-bold text-red-500 dark:text-red-400 mb-2">
            {t('unauthorized.title')}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center pb-8 px-8">
          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
            {t('unauthorized.description')}
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>{t('unauthorized.status')}:</strong> {t('unauthorized.helpText')}
            </p>
          </div>

          {/* Status indicator */}
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-8">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            {t('unauthorized.accessDenied')}
          </div>

          {/* Action buttons */}
          <div className="">
            <Link href="/dashboard" className="block">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                size="lg"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                {t('unauthorized.goToDashboard')}
              </Button>
            </Link>
            
            <Link href="/" className="block mt-5">
              <Button 
                variant="outline" 
                className="w-full backdrop-blur-sm bg-background/50 border-border/50 hover:bg-accent/50 transition-all duration-300 cursor-pointer"
                size="lg"
              >
                {t('unauthorized.returnHome')}
              </Button>
            </Link>
          </div>

          {/* Additional help text */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {t('unauthorized.needHelp')} {" "}
              <span className="text-primary font-medium">support@plannorium.com</span>
            </p>
          </div>
        </CardContent>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] via-transparent to-black/[0.02] pointer-events-none"></div>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;