"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { Button } from "@/components/ui/button";
import { Zap, Check, ArrowRight, Loader2 } from "lucide-react";
import { PLANS, PlanKey } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const tierDetails = {
  free: {
    description: "Get started with signal intelligence",
    cta: "Current Plan",
    popular: false,
  },
  pro: {
    description: "For growing sales teams",
    cta: "Upgrade to Pro",
    popular: true,
  },
  enterprise: {
    description: "For large organizations",
    cta: "Upgrade to Enterprise",
    popular: false,
  },
} as const;

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: PlanKey) => {
    if (tier === "free") return;

    setLoading(tier);
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="flex h-20 items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-accent to-orange-500 text-white shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/30 transition-shadow duration-300">
              <Zap className="size-5" />
            </div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              Axidex
            </h2>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Log In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="group h-11 px-6 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-md hover:shadow-lg">
                Dashboard
                <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 py-20 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your team. Upgrade or downgrade anytime.
            </p>
          </motion.div>
        </section>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl px-6 mb-8"
          >
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center text-destructive">
              {error}
            </div>
          </motion.div>
        )}

        {/* Pricing Grid */}
        <section className="w-full max-w-7xl px-6 pb-28 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
              ([key, plan], index) => {
                const details = tierDetails[key];
                const isPopular = details.popular;
                const isLoading = loading === key;
                const isFree = key === "free";

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: easeOutExpo,
                    }}
                    className={cn(
                      "relative bg-background rounded-2xl border transition-all duration-300",
                      isPopular
                        ? "border-accent shadow-lg shadow-accent/10 scale-[1.02]"
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-8 lg:p-10">
                      {/* Plan Header */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {details.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl lg:text-5xl font-bold text-foreground">
                            ${plan.price}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-muted-foreground">/month</span>
                          )}
                        </div>
                        {plan.price === 0 && (
                          <span className="text-sm text-muted-foreground">
                            Forever free
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleUpgrade(key)}
                        disabled={isFree || isLoading || !!loading}
                        className={cn(
                          "w-full h-12 text-base font-medium transition-all duration-300",
                          isPopular
                            ? "bg-accent hover:bg-accent/90 text-white"
                            : isFree
                            ? "bg-secondary text-muted-foreground cursor-not-allowed"
                            : "bg-foreground hover:bg-foreground/90 text-background"
                        )}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          details.cta
                        )}
                      </Button>

                      {/* Features */}
                      <ul className="mt-8 space-y-4">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Check
                              className={cn(
                                "size-5 shrink-0 mt-0.5",
                                isPopular ? "text-accent" : "text-muted-foreground"
                              )}
                            />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        </section>

        {/* FAQ or Trust Section */}
        <section className="w-full max-w-4xl px-6 pb-28 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <p className="text-muted-foreground">
              All plans include a 14-day free trial. No credit card required to start.
              <br />
              Questions?{" "}
              <Link
                href="mailto:support@axidex.com"
                className="text-accent hover:underline"
              >
                Contact our sales team
              </Link>
            </p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Axidex. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
