"use client"

import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Building2, Calendar, Users, Shield, ArrowRight, Check, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { motion } from "framer-motion"
import { FadeIn, SlideUp } from "@/src/components/motion/fade-in"

const features = [
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Browse available rooms and request bookings with just a few clicks. Real-time availability checking ensures you find the perfect time slot.",
  },
  {
    icon: Building2,
    title: "Room Discovery",
    description: "Filter rooms by capacity, building, and equipment to find the perfect space for your needs. Detailed room information at your fingertips.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Different access levels for students, faculty, and administrators. Secure and organized booking management for everyone.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Built with security and reliability in mind. All actions are logged and audited for compliance and transparency.",
  },
]

const benefits = [
  "Real-time availability checking",
  "Conflict detection and prevention",
  "Automated approval workflows",
  "Comprehensive audit logging",
  "Mobile-responsive design",
  "Instant notifications",
]

export default function LandingPage() {

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full relative"
        style={{
          backgroundImage: "url('/11044-01_LoRes.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Deep Red Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(rgba(153, 0, 0, 0.8), rgba(153, 0, 0, 0.8))",
          }}
        />
        
        {/* Navigation Bar */}
        <div 
          className="relative z-10"
          style={{ backgroundColor: "#990000" }}
        >
          <div className="container flex h-16 items-center justify-between px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Building2 className="h-7 w-7" style={{ color: "#FFFFFF" }} />
              <span 
                className="text-xl font-bold"
                style={{ 
                  color: "#FFFFFF",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-0.02em"
                }}
              >
                Room Booking
              </span>
              {/* OWU Style Vertical Divider */}
              <div 
                className="h-6 w-px mx-2"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/login">
                <Button 
                  className="relative overflow-hidden group font-semibold"
                  style={{ 
                    borderRadius: "4px",
                    backgroundColor: "#FFFFFF",
                    color: "#990000",
                    border: "none"
                  }}
                >
                  <span className="relative z-10">Sign In</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/slocum-hall.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay for Legibility */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))",
          }}
        />

        <div className="container px-4 py-20 md:py-32 relative z-10">
          <div className="mx-auto max-w-5xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Modern Room Booking System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6 text-white"
          >
            <span className="block">Book University</span>
            <span className="block" style={{ color: "#CC0000" }}>
              Rooms Effortlessly
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl leading-relaxed"
          >
            A modern room booking system designed for students, faculty, and staff.
            Find available rooms, request bookings, and manage your reservations all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="text-lg px-8 h-12 group relative overflow-hidden text-white"
                style={{ backgroundColor: "#CC0000" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0"
                  style={{ backgroundColor: "rgba(204, 0, 0, 0.9)" }}
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-12 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Learn More
            </Button>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4" style={{ color: "#000000" }}>
              Everything you need to
              <span className="block" style={{ color: "#990000" }}>book rooms</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: "#333333" }}>
              Streamlined booking process designed for university members
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    className="border-2 hover:border-[#990000]/50 transition-all duration-300 h-full group"
                    style={{
                      backgroundColor: "#990000",
                      borderTopColor: "#990000",
                    }}
                  >
                    <CardContent className="p-6">
                      <motion.div
                        className="mb-4 rounded-xl p-4 w-fit transition-colors"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: "rgba(255, 255, 255, 0.3)"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-6 w-6" style={{ color: "#FFFFFF" }} />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>{feature.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#FFFFFF" }}>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        className="relative py-[100px] px-4"
        style={{
          backgroundImage: "url('/11044-01_LoRes.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay for Legibility */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
          }}
        />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* OWU Style Horizontal Accent Line */}
            <div 
              className="h-1 w-20 mb-6"
              style={{ backgroundColor: "#CC0000" }}
            />
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-white">
              Built for
              <span className="block text-[#CC0000]">modern universities</span>
            </h2>
            <p className="text-lg text-white mb-8 leading-relaxed">
              Our platform combines powerful features with an intuitive interface,
              making room booking simple and efficient for everyone.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="flex-shrink-0 rounded-full p-1.5"
                    style={{ backgroundColor: "rgba(204, 0, 0, 0.1)" }}
                  >
                    <Check className="h-4 w-4" style={{ color: "#CC0000" }} />
                  </div>
                  <span className="text-white">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="w-full py-20 relative"
        style={{
          backgroundImage: "url('/OWU-Slocum-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
        }}
      >
        <div className="container mx-auto max-w-4xl px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl"
              style={{ color: "#FFFFFF" }}
            >
              Ready to get started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg mb-8"
              style={{ color: "#FFFFFF" }}
            >
              Sign in to start booking rooms for your meetings, classes, and events.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-lg px-8 h-12 group relative overflow-hidden text-white"
                  style={{ 
                    backgroundColor: "#CC0000",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Sign In Now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t bg-[#000000] py-12"
      >
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5" style={{ color: "#CC0000" }} />
              <span className="font-semibold text-white">Room Booking System</span>
            </div>
            <p className="text-sm text-white/70">
              © {new Date().getFullYear()} Ohio Wesleyan University. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
