import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ExternalLink, Github, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import whatsappImage from '@/assets/whatsapp.png';
import beplImage from '@/assets/bepl.png';
import shopeasyImage from '@/assets/shopeasy.png';
import { Link } from 'react-router-dom';

const projects = [
  {
    title: 'WhatsApp Clone',
    description: 'A cross-platform messaging app for Web, Android, and iOS using Ionic React and CometChat SDK, with a reusable Capacitor push notification plugin.',
    features: [
      'Real-time VOIP calls and push notifications',
      'Automated push notification handling with FCM, iOS, and VoIP tokens',
      'Reactions, threaded replies, and status updates',
      'Seamless cross-platform experience',
      'Published Capacitor plugin on npm for public use',
    ],
    tech: ['Ionic React', 'Capacitor', 'TypeScript', 'CometChat SDK', 'iOS', 'Android'],
    image: whatsappImage,
    featured: true,
    link: 'https://whatsapp-9hmt.onrender.com',
  },
  {
    title: 'BEPL',
    description: 'A comprehensive business management platform built for modern enterprises.',
    features: [
      'Advanced business analytics and reporting',
      'Integrated workflow management system',
      'Real-time collaboration tools',
      'Secure data handling and authentication',
    ],
    tech: ['React.js', 'Node.js', 'Tailwind CSS', 'Shadcn UI','Three.js', 'Framer Motion'],
    image: beplImage,
    featured: true,
    link: 'https://bepl.netlify.app',
  },
  {
    title: 'Shop Easy',
    description: 'A full-stack e-commerce platform featuring role-based dashboards for Buyers and Sellers.',
    features: [
      'Google OAuth authentication',
      'Razorpay payment integration',
      'Shopping cart, reviews, and comments',
    ],
    tech: ['React.js', 'NestJS', 'MongoDB', 'Tailwind CSS'],
    image: shopeasyImage,
    featured: true,
    link: 'https://templatefrontend-ecommerce.onrender.com',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  const { data: dynamicProjects } = useQuery({
    queryKey: ['public-projects'],
    queryFn: async () => (await api.get('/content/projects')).data,
    retry: false
  });

  const displayProjects = dynamicProjects && dynamicProjects.length > 0 ? dynamicProjects : projects;

  return (
    <section id="projects" className="section-padding bg-section-alt">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A showcase of my best work, from messaging apps to e-commerce platforms
          </p>
        </motion.div>

        <div className="space-y-24 md:space-y-32 mt-12">
          {displayProjects.map((project: any, index: number) => (
            <motion.div
              key={project._id || project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col gap-10 lg:gap-16 items-center ${
                index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
            >
              {/* Project Image Side */}
              <div className="w-full lg:w-1/2 group relative">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                
                <div className="relative glass-card rounded-[2rem] p-2 border border-border/50 overflow-hidden transform transition-transform duration-700 group-hover:scale-[1.02]">
                  <div className="relative rounded-[1.5rem] overflow-hidden bg-secondary/30 aspect-video flex items-center justify-center cursor-pointer"
                       onClick={() => setSelectedImage({ src: project.image, alt: project.title })}>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">View Fullscreen</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Content Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full border border-primary/20 font-semibold tracking-wide uppercase">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {project.description}
                </p>

                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 opacity-80">Key Features</h4>
                  <ul className="space-y-3">
                    {project.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        <span className="text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                  {project.tech.map((tech: string) => (
                    <span
                      key={tech}
                      className="text-xs font-medium bg-secondary/50 px-4 py-2 rounded-full text-foreground border border-border/50 backdrop-blur-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  {(project.liveUrl || project.link) && (
                    <Link to={project.liveUrl || project.link} target="_blank">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Live Project
                      </Button>
                    </Link>
                  )}
                  {project.githubUrl && (
                    <Link to={project.githubUrl} target="_blank">
                      <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 transition-all duration-300 bg-background/50 backdrop-blur-sm text-foreground">
                        <Github className="w-5 h-5 mr-2" />
                        Source Code
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>


      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-50 backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProjectsSection;
