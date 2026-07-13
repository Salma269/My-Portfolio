import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Locale, Project } from '../../types/cms';
import { pickLocalized, pickLocalizedArray } from '../../utils/localize';

type Props = { projects: Project[]; locale: Locale };

export function ProjectsCarousel({ projects, locale }: Props) {
  const { t } = useTranslation();
  const orderedProjects = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);

  return (
    <div className="project-showcase">
      {orderedProjects.map((project) => {
        const title = pickLocalized(project.title, locale, project.localeStatus);
        const highlights = pickLocalizedArray(project.highlights, locale, project.localeStatus).slice(0, 2);
        const gallery = project.gallery?.length ? project.gallery.slice(0, 3) : project.coverImage ? [project.coverImage] : [];
        return (
          <article className={`project-card ${project.featured ? 'project-card--featured' : ''}`} key={project.slug}>
            <div className="project-card__visual">
              {project.coverImage ? (
                <img src={project.coverImage.blobUrl} alt={pickLocalized(project.coverImage.alt, locale, project.localeStatus, true)} loading="lazy" />
              ) : (
                <div className="project-card__placeholder">{title.slice(0, 2)}</div>
              )}
              <div className="project-card__shine" aria-hidden="true" />
              {project.featured ? <span className="badge badge--accent">{t('labels.featured')}</span> : null}
            </div>
            <div className="project-card__body">
              <div className="project-card__meta"><span className="eyebrow">{project.periodLabel}</span></div>
              <h3>{title}</h3>
              <p>{pickLocalized(project.shortDescription, locale, project.localeStatus)}</p>
              <ul>
                {highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
              <div className="project-mini-gallery" aria-label={`${title} visuals`}>
                {gallery.map((image) => (
                  <img key={image.id} src={image.blobUrl} alt={pickLocalized(image.alt, locale, project.localeStatus, true)} loading="lazy" />
                ))}
              </div>
              <div className="chip-list" aria-label={t('labels.technologies')}>
                {project.technologies.slice(0, project.featured ? 9 : 6).map((tech) => <span className="chip" key={tech}>{tech}</span>)}
              </div>
              <Link className="text-link" to={`/projects/${project.slug}`}>Read project notes →</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
