import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeIcon, CalendarDaysIcon, UserIcon, TargetIcon, SunIcon, MoonIcon, UsersIcon } from '../icons';
import { LimelightNav, NavItem } from '../ui/limelight-nav';

type Page = 'home' | 'goals' | 'buddies' | 'plan' | 'profile';

interface NavbarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onToggleTheme?: () => void;
    theme?: 'light' | 'dark';
}

export default function Navbar({ currentPage, onNavigate, onToggleTheme, theme }: NavbarProps) {
    const { t } = useTranslation();
    
    const navItems: NavItem[] = useMemo(() => [
        {
            id: 'home',
            icon: <HomeIcon />,
            label: t('nav.home'),
            onClick: () => onNavigate('home'),
        },
        {
            id: 'goals',
            icon: <TargetIcon />,
            label: t('nav.goals'),
            onClick: () => onNavigate('goals'),
        },
        {
            id: 'buddies',
            icon: <UsersIcon />,
            label: t('nav.buddies'),
            onClick: () => onNavigate('buddies'),
        },
        {
            id: 'plan',
            icon: <CalendarDaysIcon />,
            label: t('nav.plan'),
            onClick: () => onNavigate('plan'),
        },
        {
            id: 'profile',
            icon: <UserIcon />,
            label: t('nav.profile'),
            onClick: () => onNavigate('profile'),
        },
    ], [onNavigate, t]);

    const activeIndex = useMemo(() => {
        const pageOrder: Page[] = ['home', 'goals', 'buddies', 'plan', 'profile'];
        return pageOrder.indexOf(currentPage);
    }, [currentPage]);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-20 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center items-end pointer-events-none"
        >
            {/* Floating Navbar */}
            <div
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 pointer-events-auto flex items-center gap-3 shadow-card"
            >
                {onToggleTheme && (
                    <button
                        onClick={onToggleTheme}
                        aria-label="Toggle theme"
                        className="p-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </button>
                )}
                <LimelightNav
                    items={navItems}
                    defaultActiveIndex={activeIndex}
                    onTabChange={(index) => {
                        const pageOrder: Page[] = ['home', 'goals', 'buddies', 'plan', 'profile'];
                        onNavigate(pageOrder[index]);
                    }}
                    className="w-auto"
                    iconContainerClassName="px-4 py-1"
                    limelightClassName="bg-[var(--accent-light)] border-[var(--accent-light)] shadow-md"
                />
            </div>
        </div>
    );
}
