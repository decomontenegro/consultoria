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

export interface FeatureGridGradientProps {
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
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 12,
    },
  },
};

/**
 * Design 2: Vibrant Gradient
 * Bold gradients, vibrant colors, dynamic hover effects
 */
export const FeatureGridGradient = React.forwardRef<HTMLDivElement, FeatureGridGradientProps>(
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
        className={cn('w-full max-w-7xl mx-auto py-16 md:py-24 px-6 relative overflow-hidden', className)}
      >
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl -z-10" />

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
          <motion.div
            className="text-center lg:text-left max-w-xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              {title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
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
            <img
              src={illustrationSrc}
              alt={illustrationAlt}
              className="w-56 h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Grid Container */}
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-white/80 via-purple-50/50 to-pink-50/50 backdrop-blur-sm border border-purple-100 p-8 md:p-12 shadow-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="flex flex-col items-start p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:shadow-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
              >
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">
                  {category.title}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="hover:text-purple-600 transition-colors font-medium"
                        >
                          {item.text}
                        </a>
                      ) : (
                        <span>{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Button */}
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
              className="px-10 py-6 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    );
  },
);

FeatureGridGradient.displayName = 'FeatureGridGradient';
