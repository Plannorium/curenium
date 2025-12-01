"use client"

import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./components/sidebar-nav";
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const { language } = useLanguage();
    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    const sidebarNavItems = [
        {
            title: t('settings.sidebar.profile'),
            href: "/dashboard/settings",
        },
        {
            title: t('settings.sidebar.account'),
            href: "/dashboard/settings/account",
        },
        {
            title: t('settings.sidebar.appearance'),
            href: "/dashboard/settings/appearance",
        },
        {
            title: t('settings.sidebar.notifications'),
            href: "/dashboard/settings/notifications",
        },
        {
            title: t('settings.sidebar.display'),
            href: "/dashboard/settings/display",
        },
        {
            title: t('settings.sidebar.organization'),
            href: "/dashboard/settings/organization",
        },
    ];

    return (
        <div className="space-y-6 p-3 pl-5 pb-9 lg:pl-10 lg:p-10 lg:pb-16 md:block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h2>
                <p className="text-muted-foreground">
                    {t('settings.subtitle')}
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className={`mx-4 lg:w-1/6 lg:mr-10 ${language === 'ar' ? 'lg:ml-10 lg:mr-2' : ''}`}>
                    <SidebarNav items={sidebarNavItems} />
                </aside>
                <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
        </div>
    );
}