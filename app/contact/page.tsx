"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Users,
  Headphones,
  CheckCircle,
} from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { toast } from "sonner";
import Footer from "@/components/Footer";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success("Thank you for your message! We'll get back to you within 24 hours.");
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@plannorium.com", "support@plannorium.com"],
      description: "Send us an email and we'll respond within 24 hours."
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+234 806 892 6547"],
      description: "Available for demo calls and support."
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Riyadh, Saudi Arabia"],
      description: "Located in the heart of Riyadh, Saudi Arabia."
    },
  ];

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
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Get in Touch
            </span>
            <span className="block text-primary font-extrabold mt-2">
              We're Here to Help
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions about Curenium? Need a demo? Want to discuss enterprise solutions?
            Our team is ready to help you transform your healthcare communication.
          </p>
        </div>
      </section>

      {/* Demo Booking Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-gradient-to-r from-primary/90 to-primary border border-primary/20 rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border border-white/20 rounded-2xl mb-4">
                <CheckCircle className="text-white h-8 w-8" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Book a Free Demo Call
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
                See Curenium in action! Schedule a personalized demo call with our healthcare experts.
                We'll show you how Curenium can transform your healthcare communication workflow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <a
                href="https://calendly.com/almussanplanner12/curenium-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:text-black text-primary hover:bg-white/90 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-lg"
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                Schedule Demo Call
              </a>
              <Link href="/features" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] px-8 py-4 text-lg"
                >
                  View Features
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">30 min</div>
                <div className="text-primary-foreground/80">Demo Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Free</div>
                <div className="text-primary-foreground/80">No Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Custom</div>
                <div className="text-primary-foreground/80">Tailored to You</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div key={index} className="group backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
              <div className="relative">
                <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-all duration-200">
                  <info.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-foreground font-medium mb-1">{detail}</p>
                ))}
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{info.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 backdrop-blur-sm bg-muted/30 border-y border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Send us a Message
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiryType">Inquiry Type</Label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full backdrop-blur-sm bg-background/50 border border-border/50 rounded-lg px-3 py-2 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="demo">Request Demo</option>
                    <option value="sales">Sales</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Map/Location Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Visit Our Office
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Located in the heart of the medical district, our office is designed for healthcare professionals.
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Our Location</h3>
                    <p className="text-muted-foreground">Riyadh, Saudi Arabia</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="">
                {/* <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
                  <Users className="mx-auto h-8 w-8 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Hospitals Served</div>
                </div> */}
                <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl text-center">
                  <Headphones className="mx-auto h-8 w-8 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Support Available</div>
                </div>
              </div>

              {/* Testimonials */}
              {/* <div className="backdrop-blur-lg bg-card/80 border border-border/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start">
                  <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 p-3 rounded-xl mr-4">
                    <MessageSquare className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground italic mb-3">
                      "Curenium transformed our communication workflow. Response times improved by 60% and our team collaboration has never been better."
                    </p>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-semibold text-sm">DR</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">Dr. Sarah Johnson</div>
                        <div className="text-xs text-muted-foreground">Chief of Medicine, City Hospital</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-gradient-to-r from-primary/90 to-primary border border-primary/20 rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to Transform Healthcare Communication?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
              Join hundreds of healthcare organizations already using Curenium to improve patient care and team collaboration.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/signup" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary dark:text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing" prefetch={false}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white dark:text-black/50 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;