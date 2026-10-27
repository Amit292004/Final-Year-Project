import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-textPrimary">
      {/* Marketing Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-borderStandard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-btn bg-carbon flex items-center justify-center text-signature font-headline font-black text-lg shadow-sm">
              C
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-carbon">
              CareerFit<span className="text-signature">.AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-textSecondary">
            <a href="#features" className="hover:text-carbon transition">Features</a>
            <a href="#how-it-works" className="hover:text-carbon transition">How It Works</a>
            <a href="#pricing" className="hover:text-carbon transition">Pricing</a>
            <a href="#faq" className="hover:text-carbon transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Marketing Footer */}
      <footer className="bg-carbon text-white border-t border-graphite py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-btn bg-signature flex items-center justify-center text-white font-headline font-black text-sm">
                C
              </div>
              <span className="font-headline font-extrabold text-lg text-white">
                CareerFit<span className="text-signature">.AI</span>
              </span>
            </div>
            <p className="text-xs text-textDisabled leading-relaxed">
              Empowering candidates with ATS resume intelligence, semantic job matching, skill-gap analysis, and RAG-driven interview preparation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-textDisabled uppercase tracking-wider mb-3">Intelligence</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link to="/signup" className="hover:text-signature transition">ATS Readiness Scoring</Link></li>
              <li><Link to="/signup" className="hover:text-signature transition">Semantic Job Matcher</Link></li>
              <li><Link to="/signup" className="hover:text-signature transition">Skill Gap Visualizer</Link></li>
              <li><Link to="/signup" className="hover:text-signature transition">RAG Interview Coach</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-textDisabled uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#how-it-works" className="hover:text-signature transition">Methodology</a></li>
              <li><a href="#pricing" className="hover:text-signature transition">Transparent Plans</a></li>
              <li><Link to="/login" className="hover:text-signature transition">Candidate Portal</Link></li>
              <li><Link to="/admin" className="hover:text-signature transition">Admin Operations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-textDisabled uppercase tracking-wider mb-3">Compliance & Ethics</h4>
            <p className="text-xs text-textDisabled leading-relaxed mb-2">
              All scoring rubrics are explainable and deterministic. We never fabricate metrics or guarantee placement.
            </p>
            <span className="text-[11px] text-textMuted">© 2026 CareerFit AI SaaS. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
