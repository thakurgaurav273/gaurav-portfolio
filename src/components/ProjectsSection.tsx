import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ExternalLink, Github, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    tech: ['React.js', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Shadcn UI', 'TypeScript', 'Three.js', 'Framer Motion'],
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={itemVariants}
              className="h-[320px]"
            >
              {/* Flip Card Container */}
              <div className="relative w-full h-full card-flip-container">
                {/* Front Side - Image with Technologies */}
                <div className="card-front absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden">
                  <div className="glass-card rounded-[2rem] h-full flex flex-col overflow-hidden border border-border/50">
                    {/* Image */}
                    <div className="relative bg-secondary/50 flex items-center justify-center p-0">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-contain"
                      />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                      {/* Featured badge */}
                      {project.featured && (
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 pointer-events-none">
                          <span className="text-white text-xs font-semibold tracking-wide">Featured</span>
                        </div>
                      )}
                    </div>

                    {/* Technologies on front */}
                    <div className="p-5 flex flex-wrap gap-2 justify-center items-center flex-1 bg-background/50 backdrop-blur-sm">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-secondary/80 px-3 py-1.5 rounded-full text-foreground border border-border/50 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Back Side - Details and Buttons */}
                <div className="card-back absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden">
                  <div className="glass-card rounded-[2rem] h-full p-6 flex flex-col border border-border/50 bg-background/80 backdrop-blur-xl">
                    {/* Title with View Icon */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-display font-bold text-foreground">{project.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage({ src: project.image, alt: project.title });
                        }}
                        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="View fullscreen"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.description}</p>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6 flex-grow overflow-y-auto pr-2">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Actions - always at bottom */}
                    <div className="flex gap-3 mx-auto mt-auto pt-2">
                      <Link to={project.link} target="_blank">
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 group/btn">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Fullscreen Image Preview Dialog */}
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
