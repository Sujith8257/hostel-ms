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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                HostelMS
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Link to="/about">
                <Button variant="ghost">About Us</Button>
              </Link>
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="outline" className="mb-4">
                <Zap className="mr-1 h-3 w-3" />
                Advanced Hostel Security System
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
                Secure Your Hostel with
                <br />
                Smart Technology
              </h1>
            </motion.div>
            
            {/* <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            > */}
              Protect your hostel with our 
              <Highlighter action="highlight" color="#87CEFA"> comprehensive</Highlighter>
              management system that detects
              <span className="block">
                unauthorized entries, manages student access, and provides real-time security monitoring.
              </span>

            {/* </motion.p> */}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{stat.change}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Complete Hostel Security Solution
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Our comprehensive system provides everything you need to secure and manage your hostel operations effectively.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Trusted by Hostel Management Teams
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              See what hostel administrators are saying about HostelMS
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-primary rounded-2xl p-12 text-primary-foreground"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Secure Your Hostel?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join hundreds of hostels already using HostelMS to protect their students and property.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">HostelMS</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 HostelMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
