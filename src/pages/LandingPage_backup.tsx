import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Highlighter } from "@/components/magicui/highlighter";
import {
  Shield,
  Building2,
  AlertTriangle,
  Users,
  Activity,
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'RFID access control, biometric authentication, and real-time monitoring to ensure only authorized individuals enter the hostel.'
    },
    {
      icon: AlertTriangle,
      title: 'Unauthorized Entry Detection',
      description: 'AI-powered detection system that immediately alerts management when unauthorized persons attempt to enter hostel premises.'
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Live tracking of student entry/exit activities with comprehensive logs and instant notifications for suspicious behavior.'
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Complete student database with room assignments, contact information, and attendance tracking for better administration.'
    },
    {
      icon: Building2,
      title: 'Room Management',
      description: 'Efficient room allocation system with occupancy tracking, maintenance scheduling, and space optimization.'
    },
    {
      icon: CheckCircle,
      title: 'Visitor Control',
      description: 'Secure visitor registration and tracking system with temporary access controls and host verification.'
    }
  ];

  const stats = [
    {
      icon: Users,
      value: '1,247',
      label: 'Students Managed',
      change: '+12%'
    },
    {
      icon: Building2,
      value: '95%',
      label: 'Room Occupancy',
      change: '+3%'
    },
    {
      icon: Shield,
      value: '99.8%',
      label: 'Security Uptime',
      change: '+0.2%'
    },
    {
      icon: Activity,
      value: '24/7',
      label: 'Monitoring',
      change: 'Always On'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Hostel Director',
      content: 'HostelMS has revolutionized our security operations. The unauthorized entry detection has prevented several security incidents.',
      rating: 5
    },
    {
      name: 'Ms. Priya Sharma',
      role: 'Deputy Warden',
      content: 'The real-time monitoring and alert system has made our job much easier. We can respond to incidents immediately.',
      rating: 5
    },
    {
      name: 'Mr. Amit Patel',
      role: 'Assistant Warden',
      content: 'Student management features are incredibly comprehensive. Room allocation and visitor tracking work seamlessly.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-alt rounded-xl animate-float">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gradient-alt" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                HostelMS
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Link to="/about">
                <Button variant="ghost" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>About Us</Button>
              </Link>
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="outline" className="mb-6 text-sm font-medium px-4 py-2 bg-gradient-card-alt border-indigo-500/20">
                <Zap className="mr-2 h-4 w-4 text-indigo-600" />
                Advanced Hostel Security System
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground text-shadow leading-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Secure Your Hostel with
                <br />
                <span className="text-gradient-alt animate-gradient">Smart Technology</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Protect your hostel with our {' '}
              <Highlighter action="highlight" color="#8b5cf6"> 
                comprehensive
              </Highlighter>
              {' '} management system that detects
              <span className="block mt-2">
                <Highlighter action="highlight" color="#10b981">
                  unauthorized entries
                </Highlighter>, manages student access, and provides 
                <Highlighter action="highlight" color="#3b82f6">
                  real-time security monitoring
                </Highlighter>.
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-alt hover:opacity-90 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-medium shadow-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-indigo-500/30 hover:bg-indigo-500/5 px-8 py-4 text-lg font-medium transition-all duration-300" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-50/30 via-purple-50/50 to-pink-50/30 dark:from-indigo-950/30 dark:via-purple-950/50 dark:to-pink-950/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const gradients = ['bg-gradient-alt', 'bg-gradient-emerald', 'bg-gradient-blue', 'bg-gradient-primary'];
              const textGradients = ['text-gradient-alt', 'text-gradient-emerald', 'text-gradient-blue', 'text-gradient'];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 bg-gradient-card-alt rounded-2xl group-hover:${gradients[index % gradients.length]} group-hover:text-white transition-all duration-300`}>
                      <stat.icon className="h-8 w-8 text-indigo-600 group-hover:text-white" />
                    </div>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${textGradients[index % textGradients.length]}`} style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{stat.value}</div>
                  <div className="text-base text-muted-foreground font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{stat.label}</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{stat.change}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold mb-6 text-gradient-alt"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Complete Hostel Security Solution
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Our comprehensive system provides everything you need to secure and manage your hostel operations effectively.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const gradients = ['bg-gradient-alt', 'bg-gradient-emerald', 'bg-gradient-blue', 'bg-gradient-primary', 'bg-gradient-alt', 'bg-gradient-emerald'];
              const cardGradients = ['bg-gradient-card-alt', 'bg-gradient-card', 'bg-gradient-card-alt', 'bg-gradient-card', 'bg-gradient-card-alt', 'bg-gradient-card'];
              const borderColors = ['border-indigo-500/10 group-hover:border-indigo-500/30', 'border-emerald-500/10 group-hover:border-emerald-500/30', 'border-blue-500/10 group-hover:border-blue-500/30', 'border-primary/10 group-hover:border-primary/30', 'border-indigo-500/10 group-hover:border-indigo-500/30', 'border-emerald-500/10 group-hover:border-emerald-500/30'];
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className={`h-full hover:shadow-2xl transition-all duration-500 group-hover:scale-105 ${cardGradients[index % cardGradients.length]} ${borderColors[index % borderColors.length]}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 ${gradients[index % gradients.length]} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-xl font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed text-muted-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50/30 via-purple-50/50 to-pink-50/30 dark:from-indigo-950/30 dark:via-purple-950/50 dark:to-pink-950/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold mb-6 text-gradient-blue"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Trusted by Hostel Management Teams
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground font-light"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              See what hostel administrators are saying about HostelMS
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const cardGradients = ['bg-gradient-card-alt', 'bg-gradient-card', 'bg-gradient-card-alt'];
              const borderColors = ['border-indigo-500/10', 'border-emerald-500/10', 'border-blue-500/10'];
              const starColors = ['fill-indigo-500 text-indigo-500', 'fill-emerald-500 text-emerald-500', 'fill-blue-500 text-blue-500'];
              const nameColors = ['text-indigo-600', 'text-emerald-600', 'text-blue-600'];
              
              return (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className={`h-full hover:shadow-2xl transition-all duration-500 group-hover:scale-105 ${cardGradients[index % cardGradients.length]} ${borderColors[index % borderColors.length]}`}>
                    <CardContent className="pt-8 pb-6">
                      <div className="flex mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${starColors[index % starColors.length]}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed font-light italic" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>"{testimonial.content}"</p>
                      <div className={`border-t ${borderColors[index % borderColors.length]} pt-4`}>
                        <div className="font-semibold text-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{testimonial.name}</div>
                        <div className={`text-sm font-medium ${nameColors[index % nameColors.length]}`}>{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-gradient-alt rounded-3xl p-16 text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-shadow" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Ready to Secure Your Hostel?
              </h2>
              <p className="text-xl lg:text-2xl mb-10 text-primary-foreground/90 font-light leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Join hundreds of hostels already using HostelMS to protect their students and property.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-10 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Start Free Trial
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-10 py-4 text-lg font-semibold transition-all duration-300" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="p-2 bg-gradient-emerald rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient-emerald" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>HostelMS</span>
            </div>
            <div className="text-sm text-muted-foreground font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              © 2024 HostelMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}