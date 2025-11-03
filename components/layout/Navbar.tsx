import React from 'react';
import { HomeIcon, CalendarDaysIcon, UserIcon, TargetIcon } from '../icons';

type Page = 'home' | 'goals' | 'plan' | 'profile';

interface NavbarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-2.5 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isActive
                ? 'text-[var(--accent)] focus-visible:ring-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:text-[var(--text-primary)] focus-visible:ring-[var(--border-strong)]'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight uppercase tracking-wide">{label}</span>
        </button>
    );
};


export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-[var(--surface)]/98 backdrop-blur-md border-t border-[var(--border)] z-20 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5"
            style={{ boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.4)' }}
        >
            <div className="max-w-lg mx-auto flex justify-around items-center gap-1">
                <NavItem
                    icon={HomeIcon}
                    label="Home"
                    isActive={currentPage === 'home'}
                    onClick={() => onNavigate('home')}
                />
                <NavItem
                    icon={TargetIcon}
                    label="Goals"
                    isActive={currentPage === 'goals'}
                    onClick={() => onNavigate('goals')}
                />
                <NavItem
                    icon={CalendarDaysIcon}
                    label="Plan"
                    isActive={currentPage === 'plan'}
                    onClick={() => onNavigate('plan')}
                />
                <NavItem
                    icon={UserIcon}
                    label="Profile"
                    isActive={currentPage === 'profile'}
                    onClick={() => onNavigate('profile')}
                />
            </div>
        </nav>
    );
}