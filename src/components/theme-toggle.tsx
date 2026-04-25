import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/theme.context';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground transition-all duration-300 hover:border-primary/30 hover:bg-muted/80"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Sun className="h-5 w-5 text-foreground" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ rotate: 180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Moon className="h-5 w-5 text-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
}
