import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient texture & lighting beam (Bounce Back Academy) */}
      <div className="noise" />
      <div className="beam" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-btn bg-brandOrange flex items-center justify-center text-white font-headline font-black text-xl shadow-subtle group-hover:bg-brandOrangeHover transition-colors">
            C
          </div>
          <span className="font-headline font-black text-2xl tracking-tight text-foreground">
            CareerFit<span className="text-brandOrange">.AI</span>
          </span>
        </Link>
        <p className="mt-2 text-xs font-mono text-secondary uppercase tracking-[0.16em]">
          Deterministic Career Intelligence
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-surfaceCard py-8 px-6 shadow-elevated border border-surfaceBorder rounded-card sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
