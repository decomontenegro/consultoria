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
  color: string; // Color theme for each category
}

export interface FeatureGridColorfulProps {
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
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, rotate: -5, scale: 0.95 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * Design 5: Colorful Borders
 * Playful design with colorful borders, large icons, and vibrant personality
 */
export const FeatureGridColorful = React.forwardRef<HTMLDivElement, FeatureGridColorfulProps>(
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
    const colorMap: Record<string, { border: string; bg: string; text: string; icon: string }> = {
      red: {
        border: 'border-l-red-500',
        bg: 'bg-red-50',
        text: 'text-red-600',
        icon: 'bg-red-100 text-red-600',
      },
      orange: {
        border: 'border-l-orange-500',
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100 text-orange-600',
      },
      yellow: {
        border: 'border-l-yellow-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        icon: 'bg-yellow-100 text-yellow-600',
      },
      green: {
        border: 'border-l-green-500',
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100 text-green-600',
      },
      blue: {
        border: 'border-l-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100 text-blue-600',
      },
      purple: {
        border: 'border-l-purple-500',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100 text-purple-600',
      },
      pink: {
        border: 'border-l-pink-500',
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        icon: 'bg-pink-100 text-pink-600',
      },
    };

    return (
      <section
        ref={ref}
        className={cn('w-full max-w-7xl mx-auto py-16 md:py-24 px-6 bg-gradient-to-br from-amber-50 via-white to-blue-50', className)}
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
              {subtitle}
            </p>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <img
                src={illustrationSrc}
                alt={illustrationAlt}
                className="w-60 h-auto drop-shadow-xl"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Grid Container */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const colors = colorMap[category.color] || colorMap.blue;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.03,
                    rotate: 1,
                    transition: { duration: 0.2 }
                  }}
                  className={cn(
                    'flex flex-col items-start p-6 rounded-2xl bg-white border-l-8 border-y border-r border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer group',
                    colors.border
                  )}
                >
                  <div className={cn(
                    'mb-5 p-5 rounded-2xl transition-transform group-hover:scale-110 duration-300',
                    colors.icon
                  )}>
                    <div className="text-3xl">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className={cn(
                    'font-black text-2xl mb-4 tracking-tight',
                    colors.text
                  )}>
                    {category.title}
                  </h3>
                  <ul className="space-y-3 text-gray-700 w-full">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start group/item">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 transition-transform group-hover/item:scale-150',
                          colors.text.replace('text-', 'bg-')
                        )} />
                        {item.href ? (
                          <a
                            href={item.href}
                            className={cn(
                              'hover:underline underline-offset-2 font-medium transition-colors',
                              `hover:${colors.text}`
                            )}
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span className="font-medium">{item.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Button - Colorful */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <Button
              asChild
              size="lg"
              className="px-12 py-7 text-lg font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full transform hover:scale-105"
            >
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl" />
      </section>
    );
  },
);

FeatureGridColorful.displayName = 'FeatureGridColorful';
