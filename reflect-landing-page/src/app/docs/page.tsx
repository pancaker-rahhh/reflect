'use client';
import React from 'react';
import OverviewSection from '@/app/components/docs/sections/OverviewSection';
import GeneralInstallationSection from '@/app/components/docs/sections/GeneralInstallationSection';
import LanguageConfigurationSection from '@/app/components/docs/sections/LanguageConfigurationSection';
import ProgrammaticTriggersSection from '@/app/components/docs/sections/ProgrammaticTriggersSection';
import UserIdentificationSection from '@/app/components/docs/sections/UserIdentificationSection';
import WidgetControlApiSection from '@/app/components/docs/sections/WidgetControlApiSection';
import NextJsInstallationSection from '@/app/components/docs/sections/NextJsInstallationSection';
import ReactInstallationSection from '@/app/components/docs/sections/ReactInstallationSection';
import VueJsInstallationSection from '@/app/components/docs/sections/VueJsInstallationSection';
import WordPressInstallationSection from '@/app/components/docs/sections/WordPressInstallationSection';
import LaravelInstallationSection from '@/app/components/docs/sections/LaravelInstallationSection';
import DjangoInstallationSection from '@/app/components/docs/sections/DjangoInstallationSection';
import WebflowInstallationSection from '@/app/components/docs/sections/WebflowInstallationSection';
import FramerInstallationSection from '@/app/components/docs/sections/FramerInstallationSection';
import ShopifyInstallationSection from '@/app/components/docs/sections/ShopifyInstallationSection';
import StaticHtmlInstallationSection from '@/app/components/docs/sections/StaticHtmlInstallationSection';
import WebhooksSection from '@/app/components/docs/sections/WebhooksSection';
import TroubleshootingSection from '@/app/components/docs/sections/TroubleshootingSection';


const DocsPage = () => {
  return (
    <div className="max-w-4xl">
      <OverviewSection />
      <GeneralInstallationSection />
      <LanguageConfigurationSection />
      <ProgrammaticTriggersSection />
      <UserIdentificationSection />
      <WidgetControlApiSection />
      <NextJsInstallationSection />
      <ReactInstallationSection />
      <VueJsInstallationSection />
      <WordPressInstallationSection />
      <LaravelInstallationSection />
      <DjangoInstallationSection />
      <WebflowInstallationSection />
      <FramerInstallationSection />
      <ShopifyInstallationSection />
      <StaticHtmlInstallationSection />
      <WebhooksSection />
      <TroubleshootingSection />
    </div>
  );
};

export default DocsPage;
