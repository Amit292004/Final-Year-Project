import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-foreground selection:bg-brandOrangeLight selection:text-brandOrange">
      {/* Marketing Navbar (Bounce Back Academy Header Architecture) */}
      <header className="sticky top-0 z-40 bg-obsidian/85 backdrop-blur-md border-b border-surfaceBorder transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-btn bg-brandOrange flex items-center justify-center text-white font-headline font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-headline font-black text-xl tracking-tight text-foreground">
              CareerFit<span className="text-brandOrange">.AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-secondary">
            <a href="#features" className="hover:text-foreground transition-colors">Toolkit</a>
            <a href="#sandbox" className="hover:text-foreground transition-colors">Live Sandbox</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#comparison" className="hover:text-foreground transition-colors">Methodology</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
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
              className="p-2 rounded-btn text-secondary hover:text-foreground hover:bg-surface transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-surfaceBorder bg-surface px-4 pt-3 pb-5 space-y-3 animate-fade-down">
            <div className="flex flex-col space-y-2 text-sm font-medium text-secondary">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-surfaceCard hover:text-foreground transition-colors"
              >
                Toolkit
              </a>
              <a
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-surfaceCard hover:text-foreground transition-colors"
              >
                Live Sandbox
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-surfaceCard hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-surfaceCard hover:text-foreground transition-colors"
              >
                Methodology
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-btn hover:bg-surfaceCard hover:text-foreground transition-colors"
              >
                FAQ
              </a>
            </div>

            <div className="pt-2 border-t border-surfaceBorder flex flex-col gap-2">
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

      {/* Marketing Footer (Bounce Back Academy Dark Footer) */}
      <footer className="bg-surface text-foreground border-t border-surfaceBorder py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-btn bg-brandOrange flex items-center justify-center text-white font-headline font-black text-sm">
                C
              </div>
              <span className="font-headline font-black text-lg text-foreground tracking-tight">
                CareerFit<span className="text-brandOrange">.AI</span>
              </span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Empowering engineers with deterministic ATS resume scoring, pgvector job matching, skill gap roadmaps, and STAR interview coaching.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-secondary uppercase tracking-widest mb-3">Intelligence</h4>
            <ul className="space-y-2 text-xs text-secondary">
              <li><Link to="/ats-scorer" className="hover:text-brandOrange transition-colors">ATS Readiness Scoring</Link></li>
              <li><Link to="/matching" className="hover:text-brandOrange transition-colors">Semantic Job Matcher</Link></li>
              <li><Link to="/skills" className="hover:text-brandOrange transition-colors">Skill Gap Visualizer</Link></li>
              <li><Link to="/interview" className="hover:text-brandOrange transition-colors">RAG Interview Coach</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-secondary uppercase tracking-widest mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-secondary">
              <li><a href="#how-it-works" className="hover:text-brandOrange transition-colors">How It Works</a></li>
              <li><a href="#sandbox" className="hover:text-brandOrange transition-colors">Live Bullet Sandbox</a></li>
              <li><a href="#comparison" className="hover:text-brandOrange transition-colors">Evaluation Methodology</a></li>
              <li><Link to="/login" className="hover:text-brandOrange transition-colors">Candidate Portal</Link></li>
              <li><Link to="/admin" className="hover:text-brandOrange transition-colors">Admin Workspace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-secondary uppercase tracking-widest mb-3">Integrity</h4>
            <p className="text-xs text-secondary leading-relaxed mb-3">
              Explainable 100-point rubric. We never fabricate claims or hide insights behind subscriptions.
            </p>
            <span className="text-[11px] text-textMuted font-mono block">© 2026 CareerFit AI SaaS. Open Academic Tier.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
