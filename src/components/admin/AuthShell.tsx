import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';

// Frame shared by the forgot-password and reset-password screens, matching the sign-in page.
const AuthShell = ({ children }: { children: ReactNode }) => (
  <div className="tone-tint flex min-h-screen flex-col items-center justify-center px-4 py-10">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      <div className="mb-6 flex items-center justify-center gap-2.5">
        <Logo className="h-7 w-auto" />
        <span className="text-sm font-semibold">Content admin</span>
      </div>
      <div className="panel p-6 sm:p-7">{children}</div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        <a href="/" className="hover:text-foreground">
          Back to the site
        </a>
      </p>
    </motion.div>
  </div>
);

export default AuthShell;
