import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { fallbackContent } from '../../data/fallbackContent';
import { useContent } from '../../hooks/useContent';
import type { Locale } from '../../types/cms';
import { pickLocalized, pickLocalizedArray } from '../../utils/localize';
import { PublicHeader } from './PublicHeader';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const locale = (i18n.language.startsWith('ar') ? 'ar' : 'en') as Locale;
  const { content } = useContent();
  const project = useMemo(() => content.projects.find((item) => item.slug === slug), [content.projects, slug]);
  const siteSettings = content.siteSettings ?? fallbackContent.siteSettings;

  if (!project) {
    return (
      <>
        <PublicHeader siteSettings={siteSettings} locale={locale} />
        <main className="shell detail-page"><h1>Project not found</h1><Link to="/">Back home</Link></main>
      </>
    );
  }

  const title = pickLocalized(project.title, locale, project.localeStatus);
  return (
    <>
      <PublicHeader siteSettings={siteSettings} locale={locale} />
      <main className="shell detail-page">
        <Link className="text-link" to="/">← Back to portfolio</Link>
        <p className="eyebrow">{project.periodLabel}</p>
        <h1>{title}</h1>
        <p className="detail-page__lead">{pickLocalized(project.detailedDescription, locale, project.localeStatus)}</p>
        <div className="chip-list" aria-label={t('labels.technologies')}>
          {project.technologies.map((tech) => <span className="chip" key={tech}>{tech}</span>)}
        </div>
        <section className="detail-section">
          <h2>Highlights</h2>
          <ul className="detail-list">
            {pickLocalizedArray(project.highlights, locale, project.localeStatus).map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </section>
        {project.gallery.length > 0 ? (
          <section className="detail-section">
            <h2>Gallery</h2>
            <div className="gallery-grid">
              {project.gallery.map((image) => <img key={image.id} src={image.blobUrl} alt={pickLocalized(image.alt, locale, project.localeStatus, true)} loading="lazy" />)}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
