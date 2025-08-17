import React from 'react';
import DocsSidebar from '../components/DocsSidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24">
        <div className="flex">
          <DocsSidebar />
          <main className="flex-grow pl-8">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
