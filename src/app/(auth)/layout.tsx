"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link
          href="/"
          className="block text-center text-2xl font-semibold tracking-tight text-primary mb-8"
        >
          Axidex
        </Link>

        {children}
      </motion.div>
    </div>
  );
}
