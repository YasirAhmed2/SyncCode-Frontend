/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import { Code2, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(11, 15, 25, 0.95)'
          : 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(255,255,255,0.04)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <div className="container mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            style={{
              width: '34px', height: '34px',
              borderRadius: '10px',
              background: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              transition: 'box-shadow 0.2s',
            }}
            className="group-hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)]"
          >
            <Code2 size={17} color="white" />
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '-0.01em',
            }}
          >
            Sync
            <span style={{ color: '#818CF8' }}>Code</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(241,245,249,0.55)',
                    transition: 'all 0.15s',
                  }}
                  className="hover:text-white hover:bg-white/[0.05]"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </motion.div>
              </Link>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  paddingLeft: '12px',
                  marginLeft: '4px',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Avatar chip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '5px 12px 5px 6px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    style={{
                      width: '26px', height: '26px',
                      borderRadius: '50%',
                      background: user?.avatarColor || '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgba(241,245,249,0.7)',
                    }}
                    className="hidden sm:inline"
                  >
                    {user?.name}
                  </span>
                </div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  title="Sign out"
                  style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(241,245,249,0.35)',
                    transition: 'all 0.15s',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  className="hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={15} />
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(241,245,249,0.55)',
                    transition: 'all 0.15s',
                  }}
                  className="hover:text-white hover:bg-white/[0.05]"
                >
                  Sign In
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.03, translateY: -1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    background: '#4F46E5',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                    transition: 'all 0.15s',
                  }}
                  className="hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
                >
                  Get Started →
                </motion.div>
              </Link>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
