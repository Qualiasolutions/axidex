import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Changelog } from "@/components/landing/changelog"
import { Features } from "@/components/landing/features"
import { Testimonial } from "@/components/landing/testimonial"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">
        <Hero />
        <Changelog />
        <Features />
        <Testimonial />
      </main>
      <Footer />
    </div>
  )
}
