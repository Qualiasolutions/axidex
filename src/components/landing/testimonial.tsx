import { Quote } from "lucide-react"
import Image from "next/image"

export function Testimonial() {
  return (
    <section className="w-full py-24 border-t border-border relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <Quote className="size-16 text-accent/20 mx-auto mb-8" aria-hidden="true" />

        <blockquote className="text-2xl md:text-4xl font-serif text-foreground leading-tight mb-8 text-balance">
          {
            "\"Axidex changed how we approach outbound. We went from generic blasts to perfectly-timed, signal-driven conversations. Our reply rate jumped from 12% to 47%.\""
          }
        </blockquote>

        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-full border border-border overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
              alt="Sarah Chen portrait"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <cite className="text-foreground font-semibold not-italic block">Sarah Chen</cite>
            <p className="text-accent text-xs uppercase tracking-widest mt-1">VP of Sales @ TechScale</p>
          </div>
        </div>
      </div>
    </section>
  )
}
