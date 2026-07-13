import { lazy, Suspense } from 'react';

const HeroCanvas = lazy(() => import('./HeroCanvas').then((module) => ({ default: module.HeroCanvas })));

export function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg__fallback" />
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>
    </div>
  );
}
