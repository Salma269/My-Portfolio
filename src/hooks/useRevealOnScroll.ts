import { useEffect } from 'react';

function isElementInView(element: HTMLElement, margin = 64): boolean {
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top <= viewHeight - margin && rect.bottom >= margin;
}

function revealElement(element: HTMLElement) {
  element.classList.add('is-visible');
}

export function useRevealOnScroll(deps: unknown[] = []) {
  useEffect(() => {
    let frame = 0;
    const pending = new Set<HTMLElement>();
    let observer: IntersectionObserver | null = null;

    const collectPending = () => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((element) => pending.add(element));
    };

    const flushVisible = () => {
      pending.forEach((element) => {
        if (isElementInView(element)) {
          revealElement(element);
          pending.delete(element);
          observer?.unobserve(element);
        }
      });
    };

    const scheduleCheck = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(flushVisible);
    };

    const observePending = () => {
      if (!observer) return;
      pending.forEach((element) => observer?.observe(element));
    };

    collectPending();
    flushVisible();

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            revealElement(element);
            pending.delete(element);
            observer?.unobserve(element);
          });
        },
        { root: null, rootMargin: '0px 0px -32px 0px', threshold: [0, 0.05, 0.12, 0.2] },
      );
      observePending();
    }

    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck, { passive: true });

    const timeouts = [120, 420, 900].map((delay) =>
      window.setTimeout(() => {
        collectPending();
        observePending();
        flushVisible();
      }, delay),
    );

    return () => {
      cancelAnimationFrame(frame);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
