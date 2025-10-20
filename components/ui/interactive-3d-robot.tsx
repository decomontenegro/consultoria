'use client';

import { Suspense, lazy, useEffect } from 'react';
const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  // Hide "Built with Spline" logo
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Target all possible Spline watermark elements */
      #spline-watermark,
      [id*="watermark"],
      [id*="Watermark"],
      [class*="watermark"],
      [class*="Watermark"],
      [class*="logo"],
      [class*="Logo"],
      [class*="badge"],
      [class*="Badge"],
      a[href*="spline.design"],
      a[href*="spline"],
      div[style*="position: absolute"][style*="bottom"],
      div[style*="position: absolute"][style*="right"],
      div[style*="position: fixed"][style*="bottom"],
      div[style*="position: fixed"][style*="right"],
      div[style*="z-index: 999"],
      div[style*="z-index: 9999"],
      canvas + div,
      canvas ~ div,
      canvas ~ div a,
      canvas ~ div > *,
      canvas ~ a,
      iframe + div,
      iframe ~ div,
      iframe ~ a,
      /* Spline's typical watermark container */
      div > a[target="_blank"],
      div[style*="pointer-events: auto"] {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    // Function to remove watermark elements
    const removeWatermarks = () => {
      // Remove links
      const links = document.querySelectorAll('a[href*="spline"]');
      links.forEach(link => {
        try {
          const parent = link.parentElement;
          if (parent) {
            parent.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important;';
            parent.remove();
          }
          link.remove();
        } catch (e) {
          // Ignore errors
        }
      });

      // Remove any element containing "Built with Spline" text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      const nodesToRemove: Node[] = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent?.includes('Built with Spline') ||
            node.textContent?.includes('spline.design')) {
          let parent = node.parentElement;
          while (parent && !parent.tagName.match(/BODY|HTML|HEAD/)) {
            nodesToRemove.push(parent);
            parent = parent.parentElement;
          }
        }
      }

      nodesToRemove.forEach(node => {
        try {
          (node as HTMLElement).style.cssText = 'display: none !important;';
          node.parentNode?.removeChild(node);
        } catch (e) {
          // Ignore errors
        }
      });

      // Remove divs positioned at bottom/right corners
      const positionedDivs = document.querySelectorAll('div[style*="position"]');
      positionedDivs.forEach(div => {
        const style = (div as HTMLElement).style;
        if ((style.bottom || style.right) && div.querySelector('a, img, svg')) {
          try {
            div.remove();
          } catch (e) {
            // Ignore errors
          }
        }
      });

      // Remove by checking computed styles for bottom-right positioned elements
      document.querySelectorAll('div, a').forEach(el => {
        const computed = window.getComputedStyle(el);
        const isBottomRight = (
          computed.position === 'absolute' || computed.position === 'fixed'
        ) && (
          parseInt(computed.bottom) < 50 || parseInt(computed.right) < 100
        );

        if (isBottomRight && (el.querySelector('a') || el.tagName === 'A')) {
          try {
            el.remove();
          } catch (e) {
            // Ignore errors
          }
        }
      });
    };

    // Run immediately
    removeWatermarks();

    // Run on interval
    const interval = setInterval(removeWatermarks, 50);

    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const el = node as HTMLElement;
            if (
              el.tagName === 'A' ||
              el.querySelector('a[href*="spline"]') ||
              el.textContent?.includes('Built with Spline')
            ) {
              removeWatermarks();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
          <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
          </svg>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  );
}
