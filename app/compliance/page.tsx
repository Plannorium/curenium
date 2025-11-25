import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import Footer from "@/components/Footer";

function CompliancePage() {
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
              Compliance & Security
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Curenium is committed to maintaining the highest standards of security and compliance in healthcare communications.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/20 border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto space-y-12">

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Regulatory Compliance</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Curenium complies with major healthcare regulations and standards:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>GDPR (General Data Protection Regulation)</li>
              <li>HITECH (Health Information Technology for Economic and Clinical Health)</li>
              <li>Local healthcare regulations in the Gulf region</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Security Measures</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our platform implements comprehensive security measures:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>End-to-end encryption for all communications</li>
              <li>Multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>Data encryption at rest and in transit</li>
              <li>Access controls and role-based permissions</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We protect patient data with industry-leading security practices. All data is encrypted, access is logged and monitored, and we maintain strict controls over who can access sensitive information. Regular backups ensure data availability while disaster recovery plans protect against data loss.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Audit & Monitoring</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Curenium maintains comprehensive audit logs for all activities:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>User access and authentication events</li>
              <li>Data access and modification logs</li>
              <li>System and security events</li>
              <li>Regular compliance audits</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Incident Response</h2>
            <p className="text-muted-foreground leading-relaxed">
              We have established incident response procedures to quickly address any security concerns. Our team is available 24/7 to respond to potential security incidents, and we notify affected users and authorities as required by law.
            </p>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Certifications</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Curenium holds the following certifications:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li>SOC 2 Type II compliance</li>
              <li>ISO 27001 certification</li>
              <li>Regular third-party security assessments</li>
            </ul>
          </div>

          <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Our Security Team</h2>
            <p className="text-muted-foreground leading-relaxed">
              For security concerns or compliance questions, contact our security team at security@curenium.com or call our 24/7 security hotline.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CompliancePage;