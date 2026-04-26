"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type IconName =
  | "dashboard"
  | "goals"
  | "daily"
  | "monthly"
  | "profile"
  | "settings"
  | "signout";

function NavIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const commonProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
  };

  const paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 13h6V4H4v9zm10 7h6V4h-6v16zM4 20h6v-4H4v4z"
        />
      </>
    ),
    goals: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 17a5 5 0 100-10 5 5 0 000 10z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 13a1 1 0 100-2 1 1 0 000 2z"
        />
      </>
    ),
    daily: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 16l2 2 4-5"
        />
      </>
    ),
    monthly: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a2 2 0 012-2h12a2 2 0 012 2v15H4V5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 3v4m8-4v4M4 9h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"
        />
      </>
    ),
    profile: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 12a4 4 0 100-8 4 4 0 000 8z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 20a8 8 0 0116 0"
        />
      </>
    ),
    settings: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.4 15a1.8 1.8 0 00.36 1.98l.04.04a2 2 0 01-2.82 2.82l-.04-.04A1.8 1.8 0 0015 19.4a1.8 1.8 0 00-1 .54 1.8 1.8 0 00-.54 1V21a2 2 0 01-4 0v-.06a1.8 1.8 0 00-.54-1A1.8 1.8 0 007 19.4a1.8 1.8 0 00-1.98.36l-.04.04a2 2 0 01-2.82-2.82l.04-.04A1.8 1.8 0 004.6 15a1.8 1.8 0 00-.54-1 1.8 1.8 0 00-1-.54H3a2 2 0 010-4h.06a1.8 1.8 0 001-.54 1.8 1.8 0 00.54-1 1.8 1.8 0 00-.36-1.98l-.04-.04A2 2 0 017.02 2.2l.04.04A1.8 1.8 0 009 4.6c.37-.14.7-.32 1-.54a1.8 1.8 0 00.54-1V3a2 2 0 014 0v.06a1.8 1.8 0 00.54 1c.3.22.63.4 1 .54a1.8 1.8 0 001.98-.36l.04-.04a2 2 0 012.82 2.82l-.04.04A1.8 1.8 0 0019.4 9c.14.37.32.7.54 1 .22.3.6.5 1 .54H21a2 2 0 010 4h-.06a1.8 1.8 0 00-1 .54c-.22.3-.4.63-.54 1z"
        />
      </>
    ),
    signout: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17l5-5-5-5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 12H9"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6"
        />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" as const },
    { name: "Goals", href: "/goals", icon: "goals" as const },
    { name: "Daily", href: "/daily", icon: "daily" as const },
    { name: "Monthly", href: "/monthly", icon: "monthly" as const },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 dark:shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <span className="text-white text-xl font-bold">H</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-300 dark:to-sky-300">
              Habit Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session &&
              navItems.map((item) =>
                (() => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
                      }`}
                    >
                      <NavIcon
                        name={item.icon}
                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })(),
              )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {session.user?.name?.charAt(0).toUpperCase() ||
                        session.user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200/50 bg-white py-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {session.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <NavIcon name="signout" className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-slate-200 dark:hover:text-emerald-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200/50 py-4 dark:border-slate-800 md:hidden">
            {session ? (
              <div className="space-y-2">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{session.user?.email}</p>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
                    }`}
                  >
                    <NavIcon name={item.icon} className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <NavIcon name="signout" className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="block px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
