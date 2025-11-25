import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";

function PrivacyPage() {
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
              Privacy Policy
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Your privacy is our priority. Learn how Curenium protects your data and ensures secure communication in healthcare.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto space-y-12">

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>Account information (name, email, organization)</li>
              <li>Healthcare data you choose to share through our platform</li>
              <li>Communication data (messages, files, alerts)</li>
              <li>Usage data and device information</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Ensure security and compliance in healthcare communications</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our platform uses end-to-end encryption for all communications and complies with healthcare data protection standards.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist our operations</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt out of certain data processing</li>
              <li>Request data portability</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Email: privacy@curenium.com<br />
              Address: [Your Address Here]
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PrivacyPage;