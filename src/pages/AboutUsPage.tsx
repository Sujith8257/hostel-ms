import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import {
  GraduationCap,
  Users,
  Target,
  Award,
  BookOpen,
  Code,
  ArrowRight,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutUsPage() {
  const teamMembers = [
    {
      name: 'Team Member 1',
      role: '992200',
      description: 'CSE/KARE'
    },
    {
      name: 'Team Member 2',
      role: '992200',
      description: 'CSE/KARE'
    },
    {
      name: 'Team Member 3',
      role: '992200',
      description: 'CSE/KARE'
    },
    {
      name: 'Team Member 4',
      role: '992200',
      description: 'CSE/KARE'
    }
  ];

  const projectHighlights = [
    {
      icon: Target,
      title: 'Project Vision',
      description: 'To create a comprehensive hostel management system that prioritizes student safety and security.'
    },
    {
      icon: Code,
      title: 'Technology Stack',
      description: 'Built with modern technologies including React, TypeScript, and advanced security protocols.'
    },
    {
      icon: Award,
      title: 'Academic Excellence',
      description: 'Representing the innovative spirit and technical expertise of KARE students.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'A result of dedicated teamwork and collaborative problem-solving approach.'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section with University Image */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://sis.kalasalingam.ac.in/images/bg4.jpg"
              alt="Kalasalingam Academy of Research and Education"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          
          <div className="relative container mx-auto px-4">
            <div className="text-center space-y-8 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="outline" className="mb-4 border-white text-white">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Capstone Project 2025
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  About Team Narayana
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl max-w-3xl mx-auto opacity-90"
              >
                Proud students of Kalasalingam Academy of Research and Education, 
                creating innovative solutions for modern hostel management challenges.
              </motion.p>
            </div>
          </div>
        </section>

        {/* University Pride Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="outline" className="mb-4">
                    <Star className="mr-1 h-3 w-3" />
                    Our Institution
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Kalasalingam Academy of Research and Education
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    We are proud students of one of India's leading educational institutions, 
                    known for its excellence in engineering, research, and innovation. 
                    KARE has been our foundation for learning cutting-edge technologies 
                    and developing real-world solutions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Academic Excellence</h3>
                      <p className="text-sm text-muted-foreground">
                        Learning from industry experts and renowned faculty members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Code className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Innovation Focus</h3>
                      <p className="text-sm text-muted-foreground">
                        Encouraged to develop practical solutions for real-world problems
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Collaborative Environment</h3>
                      <p className="text-sm text-muted-foreground">
                        Working together to create meaningful technological solutions
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>Project Purpose</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Capstone Project 2025</h4>
                      <p className="text-sm text-muted-foreground">
                        This hostel management system is our final year capstone project, 
                        representing the culmination of our academic journey and technical learning.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2026 Passout Batch</h4>
                      <p className="text-sm text-muted-foreground">
                        As graduating students of 2026, we are committed to delivering 
                        innovative solutions that address real-world challenges in educational institutions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Team Narayana</h4>
                      <p className="text-sm text-muted-foreground">
                        Named after our commitment to knowledge and wisdom, Team Narayana 
                        represents our dedication to creating meaningful technological solutions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Project Highlights */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-4xl font-bold mb-4"
              >
                Why We Built HostelMS
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Our motivation and goals behind creating this comprehensive hostel management solution.
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {projectHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center">
                    <CardHeader>
                      <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <highlight.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{highlight.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {highlight.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-4xl font-bold mb-4"
              >
                Meet Team Narayana
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                The dedicated students behind this innovative project
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center">
                    <CardHeader>
                      <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {member.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-primary rounded-2xl p-12 text-primary-foreground"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Experience Our Innovation
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                See how Team Narayana's dedication to excellence translates into cutting-edge hostel management solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">
                    Try HostelMS
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
