// ========================================
// PERFORMANCE OPTIMIZATION MODULE
// ========================================

class PerformanceOptimizer {
  constructor() {
    this.frameTime = 0;
    this.fps = 0;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.metrics = {
      fps: 60,
      renderTime: 0,
      memoryUsage: 0,
      taskTime: 0
    };
    this.targetFPS = 120;
    this.frameDeadline = 1000 / this.targetFPS;
  }

  init() {
    this.enableGPUAcceleration();
    this.monitorFPS();
    this.setupLazyLoading();
    this.optimizeDOM();
    this.setupPerformanceAPI();
  }

  enableGPUAcceleration() {
    // Apply GPU acceleration to key elements
    const style = document.createElement('style');
    style.textContent = `
      .screen,
      .exercise-card,
      .execute-card,
      .modal-content,
      .bottom-nav {
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: transform, opacity;
      }
      
      button {
        transform: translate3d(0, 0, 0);
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  monitorFPS() {
    let frameCount = 0;
    let lastUpdate = performance.now();

    const measureFrame = (currentTime) => {
      frameCount++;
      const deltaTime = currentTime - lastUpdate;

      if (deltaTime >= 1000) {
        this.metrics.fps = frameCount;
        frameCount = 0;
        lastUpdate = currentTime;
        this.updateFPSDisplay();
      }

      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  updateFPSDisplay() {
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
      fpsCounter.textContent = `FPS: ${this.metrics.fps}`;
    }
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.01
      };

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      }, observerOptions);

      document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }
  }

  optimizeDOM() {
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('resizeEnd'));
      }, 250);
    }, { passive: true });

    // Passive event listeners for better scroll performance
    document.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        // Handle scroll operations here
      });
    }, { passive: true });

    // Prevent layout thrashing
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.modal-content, .settings-panel')) {
        return;
      }
    }, { passive: true });
  }

  setupPerformanceAPI() {
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        const used = window.performance.memory.usedJSHeapSize;
        const limit = window.performance.memory.jsHeapSizeLimit;
        this.metrics.memoryUsage = Math.round((used / limit) * 100);
      }, 5000);
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task monitoring not supported');
      }
    }
  }

  deferRender(callback, delay = 0) {
    if (window.requestIdleCallback) {
      requestIdleCallback(callback, { timeout: delay });
    } else {
      setTimeout(callback, delay);
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function requestIdleCallbackPolyfill(callback, options) {
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
}

if (!window.requestIdleCallback) {
  window.requestIdleCallback = requestIdleCallbackPolyfill;
}

const performanceOptimizer = new PerformanceOptimizer();
