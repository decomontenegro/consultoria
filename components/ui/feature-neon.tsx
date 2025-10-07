import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Type definitions for the component props
interface FeatureItem {
  text: string;
  href?: string;
}

interface FeatureCategory {
  icon: React.ReactNode;
  title: string;
  items: FeatureItem[];
}

export interface FeatureGridNeonProps {
  title: React.ReactNode;
  subtitle: string;
  illustrationSrc: string;
  illustrationAlt?: string;
  categories: FeatureCategory[];
  buttonText: string;
  buttonHref: string;
  className?: string;
}

// Animation variants for Framer Motion
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const glowVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Design 4: Dark Neon Glow
 * Dark theme with neon accents, glowing effects, and cyberpunk aesthetic
 */
export const FeatureGridNeon = React.forwardRef<HTMLDivElement, FeatureGridNeonProps>(
  (
    {
      title,
      subtitle,
      illustrationSrc,
      illustrationAlt = 'Feature illustration',
      categories,
      buttonText,
      buttonHref,
      className,
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn('w-full max-w-7xl mx-auto py-16 md:py-24 px-6 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden', className)}
      >
        {/* Neon glow orbs in background */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          variants={glowVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        />

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 relative z-10">
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 mb-6 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              {title}
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-cyan-400 rounded-full blur-2xl opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <img
                src={illustrationSrc}
                alt={illustrationAlt}
                className="w-52 h-auto relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
              />
            </div>
          </motion.div>
        </div>

        {/* Grid Container */}
        <motion.div
          className="rounded-3xl bg-gray-900/60 backdrop-blur-xl p-8 md:p-12 border border-cyan-500/20 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          style={{
            boxShadow: '0 0 60px rgba(34, 211, 238, 0.15), inset 0 0 60px rgba(34, 211, 238, 0.05)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="flex flex-col items-start p-6 rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-cyan-500/30 hover:border-pink-500/50 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-2xl" />

                <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 text-cyan-400 border border-cyan-400/30 group-hover:border-pink-400/50 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)] relative z-10">
                  {category.icon}
                </div>
                <h3 className="font-bold text-xl text-white mb-4 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {category.title}
                </h3>
                <ul className="space-y-2.5 text-gray-300 relative z-10">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-cyan-400 mr-2 font-bold">›</span>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="hover:text-cyan-400 transition-colors group-hover:text-pink-300"
                        >
                          {item.text}
                        </a>
                      ) : (
                        <span className="group-hover:text-gray-100 transition-colors">
                          {item.text}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Button - Neon glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <Button
              asChild
              size="lg"
              className="px-10 py-6 text-base font-bold bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 border border-cyan-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(236,72,153,0.6)]"
            >
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    );
  },
);

FeatureGridNeon.displayName = 'FeatureGridNeon';
