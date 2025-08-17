'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Settings, Languages, Code, Users, Bot, BarChart2, FileText, LifeBuoy, Zap, ShoppingCart, Framer, Code2, Rss, MessageCircle, Bug, GitBranch } from 'lucide-react';

const DocsSidebar = () => {
    // This is a placeholder for a more advanced scroll-based active state detection.
    // For now, we will just handle the smooth scroll.
    const [activeItem, setActiveItem] = React.useState('overview');

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update URL hash without page jump
            window.history.pushState(null, '', `#${targetId}`);
            setActiveItem(targetId);
        }
    };

    const sidebarItems = [
        { name: 'Overview', icon: <BookOpen size={16} />, href: '#overview', id: 'overview' },
        { name: 'General Installation', icon: <Settings size={16} />, href: '#general-installation', id: 'general-installation' },
        { name: 'Language Configuration', icon: <Languages size={16} />, href: '#language-configuration', id: 'language-configuration' },
        { name: 'Programmatic Triggers', icon: <Code size={16} />, href: '#programmatic-triggers', id: 'programmatic-triggers' },
        { name: 'User Identification', icon: <Users size={16} />, href: '#user-identification', id: 'user-identification' },
        { name: 'Widget Control API', icon: <Bot size={16} />, href: '#widget-control-api', id: 'widget-control-api' },
        { name: 'Next.js', icon: <BarChart2 size={16} />, href: '#nextjs-installation', id: 'nextjs-installation' },
        { name: 'React', icon: <FileText size={16} />, href: '#react-installation', id: 'react-installation' },
        { name: 'Vue.js', icon: <LifeBuoy size={16} />, href: '#vuejs-installation', id: 'vuejs-installation' },
        { name: 'WordPress', icon: <Zap size={16} />, href: '#wordpress-installation', id: 'wordpress-installation' },
        { name: 'Laravel', icon: <ShoppingCart size={16} />, href: '#laravel-installation', id: 'laravel-installation' },
        { name: 'Django', icon: <Framer size={16} />, href: '#django-installation', id: 'django-installation' },
        { name: 'Webflow', icon: <Code2 size={16} />, href: '#webflow-installation', id: 'webflow-installation' },
        { name: 'Framer', icon: <Rss size={16} />, href: '#framer-installation', id: 'framer-installation' },
        { name: 'Shopify', icon: <MessageCircle size={16} />, href: '#shopify-installation', id: 'shopify-installation' },
        { name: 'Static HTML', icon: <Bug size={16} />, href: '#static-html-installation', id: 'static-html-installation' },
        { name: 'Webhooks', icon: <GitBranch size={16} />, href: '#webhooks', id: 'webhooks' },
        { name: 'Troubleshooting', icon: <Bug size={16} />, href: '#troubleshooting', id: 'troubleshooting' },
    ];

    return (
        <aside className="w-64 p-4 border-r border-gray-200 bg-white sticky top-24 self-start">
            <Link href="/" className="flex items-center text-sm mb-4 text-gray-600 hover:text-purple-600 transition-colors">
                <ChevronLeft size={16} className="mr-2" />
                Back to Home
            </Link>

            <h2 className="text-sm font-semibold mb-2 text-gray-800 uppercase tracking-wider">Installation Guide</h2>

            <nav>
                <ul>
                    {sidebarItems.map((item) => {
                        const isActive = activeItem === item.id;
                        return (
                            <li key={item.name}>
                                <a href={item.href} onClick={(e) => handleNavClick(e, item.id)} className={`flex items-center text-sm py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <span className={`mr-3 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>{item.icon}</span>
                                    {item.name}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default DocsSidebar;
