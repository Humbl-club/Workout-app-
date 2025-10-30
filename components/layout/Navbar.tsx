import React from 'react';
import { HomeIcon, CalendarDaysIcon, BookCheckIcon, ChartBarIcon } from '../icons';

type Page = 'home' | 'dashboard' | 'plan' | 'logbook';

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
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 ${
                isActive 
                ? 'text-white' 
                : 'text-stone-400 hover:text-white'
            }`}
        >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-semibold">{label}</span>
            {isActive && <div className="w-2 h-1 bg-red-500 rounded-full mt-1"></div>}
        </button>
    );
};


export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-stone-900/70 backdrop-blur-lg border border-stone-700 rounded-2xl z-20 flex justify-around items-center p-2 gap-2 shadow-2xl">
            <NavItem
                icon={HomeIcon}
                label="Home"
                isActive={currentPage === 'home'}
                onClick={() => onNavigate('home')}
            />
             <NavItem
                icon={ChartBarIcon}
                label="Dashboard"
                isActive={currentPage === 'dashboard'}
                onClick={() => onNavigate('dashboard')}
            />
            <NavItem
                icon={CalendarDaysIcon}
                label="Plan"
                isActive={currentPage === 'plan'}
                onClick={() => onNavigate('plan')}
            />
            <NavItem
                icon={BookCheckIcon}
                label="Logbook"
                isActive={currentPage === 'logbook'}
                onClick={() => onNavigate('logbook')}
            />
        </nav>
    );
}