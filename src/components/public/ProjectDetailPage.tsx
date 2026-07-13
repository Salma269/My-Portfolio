import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { fallbackContent } from '../../data/fallbackContent';
import { useContent } from '../../hooks/useContent';
import type { Locale, ProjectImage } from '../../types/cms';
import { contentAttrs } from '../../utils/localeContent';
import { pickLocalized, pickLocalizedArray } from '../../utils/localize';
import { ProjectImageCarousel } from './ProjectImageCarousel';
import { PublicHeader } from './PublicHeader';

function collectProjectImages(coverImage: ProjectImage | null | undefined, gallery: ProjectImage[]): ProjectImage[] {
  const images: ProjectImage[] = [];
  const seen = new Set<string>();
  if (coverImage) {
    images.push(coverImage);
    seen.add(coverImage.id);
  }
  for (const image of gallery) {
    if (!seen.has(image.id)) {
      images.push(image);
      seen.add(image.id);
    }
  }
  return images;
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const locale = (i18n.language.startsWith('ar') ? 'ar' : 'en') as Locale;
  const { content } = useContent();
  const project = useMemo(() => content.projects.find((item) => item.slug === slug), [content.projects, slug]);
  const siteSettings = content.siteSettings ?? fallbackContent.siteSettings;
  const heroImages = useMemo(
    () => (project ? collectProjectImages(project.coverImage, project.gallery ?? []) : []),
    [project],
  );

  if (!project) {
    return (
      <>
        <PublicHeader siteSettings={siteSettings} locale={locale} />
        <main className="shell detail-page"><h1>Project not found</h1><Link to="/">{t('actions.backHome')}</Link></main>
      </>
    );
  }

  const title = pickLocalized(project.title, locale, project.localeStatus);
  const contentAttrsValue = contentAttrs(locale, project.detailedDescription, project.localeStatus);
  return (
    <>
      <PublicHeader siteSettings={siteSettings} locale={locale} />
      <main className="shell detail-page">
        <Link className="text-link" to="/">{t('actions.backPortfolio')}</Link>
        <p className="eyebrow">{project.periodLabel}</p>
        <h1>{title}</h1>
        <ProjectImageCarousel images={heroImages} locale={locale} localeStatus={project.localeStatus} />
        <div className="detail-page__content" {...contentAttrsValue}>
          <p className="detail-page__lead">{pickLocalized(project.detailedDescription, locale, project.localeStatus)}</p>
          <div className="chip-list" aria-label={t('labels.technologies')}>
            {project.technologies.map((tech) => <span className="chip" key={tech}>{tech}</span>)}
          </div>
          <section className="detail-section">
            <h2>{t('labels.highlights')}</h2>
            <ul className="detail-list">
              {pickLocalizedArray(project.highlights, locale, project.localeStatus).map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
