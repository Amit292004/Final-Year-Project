import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-standard bg-carbon flex items-center justify-center text-signature font-headline font-black text-xl shadow-md">
            C
          </div>
          <span className="font-headline font-extrabold text-2xl tracking-tight text-carbon">
            CareerFit<span className="text-signature">.AI</span>
          </span>
        </Link>
        <p className="mt-2 text-xs text-textSecondary uppercase tracking-widest font-semibold">
          AI Career Intelligence & Resume Engine
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-borderStandard sm:rounded-standard sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
