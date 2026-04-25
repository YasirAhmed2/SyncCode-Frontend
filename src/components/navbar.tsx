/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import { Code2, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl ${
        scrolled 
          ? 'bg-background/95 border-b border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.1)]' 
          : 'bg-background/75 border-b border-border/10 shadow-none'
      }`}
    >
      <div className="container mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-[34px] h-[34px] rounded-[10px] bg-primary flex items-center justify-center transition-shadow duration-200 shadow-[0_2px_8px_rgba(99,102,241,0.3)] group-hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)]"
          >
            <Code2 size={17} color="white" />
          </div>
          <span className="text-[18px] font-bold text-foreground tracking-[-0.01em]">
            Sync<span className="text-primary">Code</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-[7px] px-[14px] py-[7px] rounded-[10px] text-[14px] font-medium text-muted-foreground transition-all duration-150 hover:text-foreground hover:bg-muted"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </motion.div>
              </Link>

              <div className="flex items-center gap-[10px] pl-[12px] ml-[4px] border-l border-border/50">
                <ThemeToggle />
                
                {/* Avatar chip */}
                <div className="flex items-center gap-[9px] py-[5px] pr-[12px] pl-[6px] rounded-[10px] bg-card border border-border/50">
                  <div
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: user?.avatarColor || '#4F46E5' }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium text-foreground/80 hidden sm:inline">
                    {user?.name}
                  </span>
                </div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  title="Sign out"
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-muted-foreground transition-all duration-150 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut size={15} />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="px-[16px] py-[7px] rounded-[10px] text-[14px] font-medium text-muted-foreground transition-all duration-150 hover:text-foreground hover:bg-muted"
                >
                  Sign In
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-[18px] py-[8px] rounded-[10px] text-[14px] font-semibold text-white bg-primary shadow-[0_2px_8px_rgba(99,102,241,0.25)] transition-all duration-150 hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
                >
                  Get Started →
                </motion.div>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
