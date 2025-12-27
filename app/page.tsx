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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Building2 className="h-7 w-7 text-primary" />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Room Booking
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/login">
              <Button variant="outline" className="relative overflow-hidden group">
                <span className="relative z-10">Sign In</span>
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Modern Room Booking System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6"
          >
            <span className="block">Book University</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Rooms Effortlessly
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
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
                className="text-lg px-8 h-12 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-primary/90"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-12"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Learn More
            </Button>
          </motion.div>
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
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Everything you need to
              <span className="block text-primary">book rooms</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
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
                  <Card className="border-2 hover:border-primary/50 transition-all duration-300 h-full group hover:shadow-lg">
                    <CardContent className="p-6">
                      <motion.div
                        className="mb-4 rounded-xl bg-primary/10 p-4 w-fit group-hover:bg-primary/20 transition-colors"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
      <section className="container px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Built for
                <span className="block text-primary">modern universities</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
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
                    <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl border-2 bg-gradient-to-br from-muted/50 to-muted p-6 backdrop-blur-sm shadow-lg">
                <div className="space-y-3">
                  {/* Room Card Preview */}
                  <motion.div
                    className="rounded-lg bg-background border p-4 shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">Lecture Hall A</h4>
                        <p className="text-xs text-muted-foreground">Science Building</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">120 seats</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Projector</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">WiFi</span>
                    </div>
                  </motion.div>

                  {/* Booking Request Preview */}
                  <motion.div
                    className="rounded-lg bg-background border p-4 shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span className="text-xs font-medium">Pending Request</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Today, 2:00 PM</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Study group meeting</p>
                  </motion.div>

                  {/* Calendar Preview */}
                  <motion.div
                    className="rounded-lg bg-background border p-4 shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Calendar View</span>
                      <span className="text-xs text-muted-foreground">Week</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 rounded ${
                            i === 2 ? "bg-primary/20 border border-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl -z-10"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "linear",
                }}
              />
              <CardContent className="p-12 text-center relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl"
                >
                  Ready to get started?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-lg text-muted-foreground mb-8"
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
                      className="text-lg px-8 h-12 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Sign In Now
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-primary/90"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t bg-muted/30 py-12"
      >
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Room Booking System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} University Room Booking. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
