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

export interface FeatureGridShadowProps {
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 15,
    },
  },
};

/**
 * Design 3: Card Shadow Depth
 * Elevated cards with deep shadows creating a 3D layered effect
 */
export const FeatureGridShadow = React.forwardRef<HTMLDivElement, FeatureGridShadowProps>(
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
        className={cn('w-full max-w-7xl mx-auto py-16 md:py-24 px-6 bg-gradient-to-b from-gray-50 to-white', className)}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 drop-shadow-sm">
              {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20" />
              <img
                src={illustrationSrc}
                alt={illustrationAlt}
                className="w-52 h-auto relative z-10"
              />
            </div>
          </motion.div>
        </div>

        {/* Grid Container - Elevated main card */}
        <motion.div
          className="rounded-3xl bg-white p-8 md:p-12 shadow-2xl border border-gray-100 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          style={{
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-bl-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="flex flex-col items-start p-6 rounded-2xl bg-white border border-gray-200 transition-all duration-300 cursor-pointer group"
                style={{
                  boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-blue-600 shadow-sm group-hover:shadow-md transition-shadow">
                  {category.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-2.5 text-gray-600">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="hover:text-blue-600 transition-colors font-medium"
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

          {/* Button - Elevated */}
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
              className="px-10 py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    );
  },
);

FeatureGridShadow.displayName = 'FeatureGridShadow';
