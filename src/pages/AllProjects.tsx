import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExternalLink, Github, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ThreeBackground from '@/components/ThreeBackground';

const MediaCarousel = ({ media, legacyImage }: { media: any[], legacyImage?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayMedia = media && media.length > 0 ? media : (legacyImage ? [{ url: legacyImage, type: 'image' }] : []);

  if (displayMedia.length === 0) {
    return <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-muted-foreground">No media available</div>;
  }

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % displayMedia.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + displayMedia.length) % displayMedia.length);

  return (
    <div className="relative w-full h-full group bg-black/40 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center relative overflow-hidden"
        >
          {displayMedia[currentIndex].type === 'image' && (
            <div 
              className="absolute inset-0 opacity-30 blur-2xl transform scale-110"
              style={{ backgroundImage: `url(${displayMedia[currentIndex].url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          )}
          
          {displayMedia[currentIndex].type === 'video' ? (
            <video 
              src={displayMedia[currentIndex].url} 
              autoPlay 
              muted 
              loop 
              controls
              controlsList="nodownload"
              playsInline
              className="relative w-full h-full object-contain z-10 rounded-2xl"
            />
          ) : (
            <img 
              src={displayMedia[currentIndex].url} 
              alt="Project Media" 
              className="relative w-full h-full object-contain z-10 p-2 rounded-2xl"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {displayMedia.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md hover:bg-primary hover:scale-110 z-20 shadow-xl"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md hover:bg-primary hover:scale-110 z-20 shadow-xl"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
            {displayMedia.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function AllProjects() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ['public-projects'],
    queryFn: async () => (await api.get('/content/projects')).data,
    retry: false
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading projects...</div>;
  }

  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error?.message || 'Failed to load projects'}</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <div className="fixed top-0 -left-1/4 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-0 -right-1/4 w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="container-custom py-24 relative z-10">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Portfolio
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            All <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A comprehensive archive of all the projects I've built, exploring different technologies and solving complex problems.
          </p>
        </motion.div>

        <div className="space-y-32 mt-20 w-full">
          {Array.isArray(projects) && projects.map((project: any, index: number) => (
            <motion.div
              key={project._id || index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col gap-12 lg:gap-20 items-center ${
                index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
            >
              <div className="w-full lg:w-[55%] aspect-video rounded-2xl relative overflow-hidden bg-secondary/20 shadow-2xl shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <MediaCarousel media={project.media} legacyImage={project.image} />
              </div>

              <div className="w-full lg:w-[45%] flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-3xl font-display font-bold text-foreground transition-colors">
                    {project.title}
                  </h2>
                  {project.featured && (
                    <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full border border-primary/20 font-bold tracking-wider uppercase whitespace-nowrap mt-2">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-lg mb-8">
                  {project.description}
                </p>

                {project.features && project.features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 opacity-80">Key Features</h3>
                    <ul className="space-y-3">
                      {project.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                          <span className="text-muted-foreground leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-10 mt-auto pt-6">
                  {project.tech?.map((tech: string) => (
                    <span
                      key={tech}
                      className="text-xs font-medium bg-secondary/50 px-4 py-2 rounded-full text-foreground border border-border/50 backdrop-blur-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-auto">
                  {(project.liveUrl || project.link) && (
                    <Link to={project.liveUrl || project.link} target="_blank">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Live Demo
                      </Button>
                    </Link>
                  )}
                  {project.githubUrl && (
                    <Link to={project.githubUrl} target="_blank">
                      <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 transition-all duration-300 bg-background/50 text-foreground">
                        <Github className="w-5 h-5 mr-2" />
                        Source Code
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {projects?.length === 0 && (
            <div className="text-center text-muted-foreground py-20">No projects to display yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
