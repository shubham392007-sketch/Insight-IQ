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
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
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
