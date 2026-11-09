import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-textPrimary selection:bg-peach selection:text-burnt">
      {/* Marketing Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-borderStandard transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-btn bg-carbon flex items-center justify-center text-signature font-headline font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-carbon">
              CareerFit<span className="text-signature">.AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-textSecondary">
            <a href="#features" className="hover:text-carbon transition-colors">Capabilities</a>
            <a href="#sandbox" className="hover:text-carbon transition-colors">Live Sandbox</a>
            <a href="#how-it-works" className="hover:text-carbon transition-colors">How It Works</a>
            <a href="#comparison" className="hover:text-carbon transition-colors">Methodology</a>
            <a href="#faq" className="hover:text-carbon transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm" iconRight={ArrowRight}>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="xs">Sign In</Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn text-textSecondary hover:text-carbon hover:bg-neutralLight transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-borderStandard bg-white px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-textSecondary">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-neutralLight hover:text-carbon transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-neutralLight hover:text-carbon transition-colors"
              >
                Live Sandbox
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-neutralLight hover:text-carbon transition-colors"
              >
                How It Works
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-neutralLight hover:text-carbon transition-colors"
              >
                Methodology
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-neutralLight hover:text-carbon transition-colors"
              >
                FAQ
              </a>
            </div>

            <div className="pt-2 border-t border-borderStandard flex flex-col gap-2">
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full" iconRight={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Marketing Footer */}
      <footer className="bg-carbon text-white border-t border-graphite py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-btn bg-signature flex items-center justify-center text-white font-headline font-black text-sm">
                C
              </div>
              <span className="font-headline font-extrabold text-lg text-white tracking-tight">
                CareerFit<span className="text-signature">.AI</span>
              </span>
            </div>
            <p className="text-xs text-textDisabled leading-relaxed">
              Empowering candidates with ATS resume intelligence, semantic job matching, skill-gap analysis, and RAG-driven interview preparation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-textDisabled uppercase tracking-wider mb-3">Intelligence</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link to="/ats-scorer" className="hover:text-signature transition-colors">ATS Readiness Scoring</Link></li>
              <li><Link to="/matching" className="hover:text-signature transition-colors">Semantic Job Matcher</Link></li>
              <li><Link to="/skills" className="hover:text-signature transition-colors">Skill Gap Visualizer</Link></li>
              <li><Link to="/interview" className="hover:text-signature transition-colors">RAG Interview Coach</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-textDisabled uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#how-it-works" className="hover:text-signature transition-colors">How It Works</a></li>
              <li><a href="#sandbox" className="hover:text-signature transition-colors">Live Bullet Sandbox</a></li>
              <li><a href="#comparison" className="hover:text-signature transition-colors">Evaluation Methodology</a></li>
              <li><Link to="/login" className="hover:text-signature transition-colors">Candidate Portal</Link></li>
              <li><Link to="/admin" className="hover:text-signature transition-colors">Admin Workspace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-textDisabled uppercase tracking-wider mb-3">Compliance & Ethics</h4>
            <p className="text-xs text-textDisabled leading-relaxed mb-3">
              All scoring rubrics are explainable and deterministic. We never fabricate metrics or guarantee placement.
            </p>
            <span className="text-[11px] text-textMuted font-mono block">© 2026 CareerFit AI SaaS. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
