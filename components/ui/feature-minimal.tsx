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

export interface FeatureGridMinimalProps {
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
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 15,
    },
  },
};

/**
 * Design 1: Minimal Clean
 * Ultra-clean design with ample whitespace, subtle animations, and focus on typography
 */
export const FeatureGridMinimal = React.forwardRef<HTMLDivElement, FeatureGridMinimalProps>(
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
        className={cn('w-full max-w-7xl mx-auto py-16 md:py-24 px-6', className)}
      >
        {/* Header Section - Centered, Minimal */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Grid Container - No borders, just space */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-20">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-start group"
              >
                <div className="mb-4 text-gray-900 transition-transform group-hover:scale-110 duration-300">
                  {category.icon}
                </div>
                <h3 className="font-medium text-lg text-gray-900 mb-4 tracking-wide">
                  {category.title}
                </h3>
                <ul className="space-y-2.5 text-gray-600 font-light">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="hover:text-gray-900 transition-colors duration-200 border-b border-transparent hover:border-gray-300"
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

          {/* Illustration - Centered, Subtle */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <img
              src={illustrationSrc}
              alt={illustrationAlt}
              className="w-64 h-auto opacity-80 hover:opacity-100 transition-opacity duration-500"
            />
          </motion.div>

          {/* Button - Minimal, Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base font-light border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300"
            >
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    );
  },
);

FeatureGridMinimal.displayName = 'FeatureGridMinimal';
