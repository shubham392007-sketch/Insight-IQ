import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/insightiq/Navbar";
import { Hero } from "@/components/insightiq/Hero";
import { TrustBar } from "@/components/insightiq/TrustBar";
import { Features } from "@/components/insightiq/Features";
import { Pipeline } from "@/components/insightiq/Pipeline";
import { DemoPlayground } from "@/components/insightiq/DemoPlayground";
import { HowItWorks } from "@/components/insightiq/HowItWorks";
import { Testimonials } from "@/components/insightiq/Testimonials";
import { FinalCTA } from "@/components/insightiq/FinalCTA";
import { DeveloperContact } from "@/components/insightiq/DeveloperContact";
import { Footer } from "@/components/insightiq/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (window.location.hash || navigation?.type === "back_forward") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    const frame = window.requestAnimationFrame(scrollToTop);
    const timers = [120, 360, 720].map((delay) => window.setTimeout(scrollToTop, delay));

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <Pipeline />
      <DemoPlayground />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      <DeveloperContact />
      <Footer />
    </main>
  );
}
