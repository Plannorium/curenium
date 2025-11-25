import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background blur effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Please read these terms carefully before using Curenium. By using our service, you agree to be bound by these terms.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto space-y-12">

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Curenium, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily use Curenium for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on our platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a user of Curenium, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>Use the service only for lawful purposes</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Respect patient privacy and healthcare regulations</li>
              <li>Report any security concerns or unauthorized use</li>
              <li>Not share access with unauthorized individuals</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Healthcare Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              Curenium is designed for healthcare professionals. Users must comply with all applicable healthcare laws, regulations, and standards including HIPAA, GDPR, and local healthcare regulations. The platform is not a substitute for professional medical advice or emergency services.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide continuous service but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the service with or without notice. We shall not be liable for any interruption or cessation of service.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Curenium or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the service, even if Curenium has been notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at legal@curenium.com.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default TermsPage;