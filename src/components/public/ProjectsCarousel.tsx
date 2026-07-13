import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Locale, Project } from '../../types/cms';
import { pickLocalized, pickLocalizedArray } from '../../utils/localize';

type Props = { projects: Project[]; locale: Locale };

export function ProjectsCarousel({ projects, locale }: Props) {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', direction: locale === 'ar' ? 'rtl' : 'ltr' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="project-carousel">
      <div className="project-carousel__viewport" ref={emblaRef}>
        <div className="project-carousel__container">
          {projects.map((project) => {
            const title = pickLocalized(project.title, locale, project.localeStatus);
            const highlights = pickLocalizedArray(project.highlights, locale, project.localeStatus).slice(0, 3);
            return (
              <article className="project-card" key={project.slug}>
                <div className="project-card__visual">
                  {project.coverImage ? (
                    <img src={project.coverImage.blobUrl} alt={pickLocalized(project.coverImage.alt, locale, project.localeStatus, true)} loading="lazy" />
                  ) : (
                    <div className="project-card__placeholder">{project.featured ? 'FotoFlow' : title.slice(0, 2)}</div>
                  )}
                  {project.featured ? <span className="badge badge--accent">{t('labels.featured')}</span> : null}
                </div>
                <div className="project-card__body">
                  <div className="eyebrow">{project.periodLabel}</div>
                  <h3>{title}</h3>
                  <p>{pickLocalized(project.shortDescription, locale, project.localeStatus)}</p>
                  <ul>
                    {highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <div className="chip-list" aria-label={t('labels.technologies')}>
                    {project.technologies.slice(0, 7).map((tech) => <span className="chip" key={tech}>{tech}</span>)}
                  </div>
                  <Link className="text-link" to={`/projects/${project.slug}`}>Read project notes →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="carousel-actions">
        <button type="button" className="circle-button" onClick={scrollPrev} aria-label={t('actions.previous')}>←</button>
        <button type="button" className="circle-button" onClick={scrollNext} aria-label={t('actions.next')}>→</button>
      </div>
    </div>
  );
}
