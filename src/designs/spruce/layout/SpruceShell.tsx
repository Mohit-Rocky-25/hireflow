import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { Footer } from './Footer';

export interface SpruceShellProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function SpruceShell({ children, hideFooter = false }: SpruceShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-sp-canvas text-sp-ink transition-colors duration-150">
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <main className="flex-1 w-full bg-sp-canvas">{children}</main>
      {!hideFooter && <Footer />}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  );
}
