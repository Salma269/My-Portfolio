import { useTranslation } from 'react-i18next';
import { HeroBackground } from './HeroBackground';
import { PublicHeader } from './PublicHeader';
import { ProjectsCarousel } from './ProjectsCarousel';
import { ContactForm } from './ContactForm';
import { skillCategoryLabels } from '../../data/fallbackContent';
import { useContent } from '../../hooks/useContent';
import type { Locale, SectionKey, SkillCategoryKey } from '../../types/cms';
import { pickLocalized, pickLocalizedArray } from '../../utils/localize';

export function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('ar') ? 'ar' : 'en') as Locale;
  const { content, source } = useContent();
  const { siteSettings } = content;
  const orderedSections = Object.entries(siteSettings.sections)
    .filter(([, config]) => config.visible)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key]) => key as SectionKey);

  return (
    <>
      <PublicHeader siteSettings={siteSettings} locale={locale} />
      <main id="main">
        <section className="hero shell" id="top">
          <HeroBackground />
          <div className="hero__content">
            <p className="eyebrow">{pickLocalized(siteSettings.hero.eyebrow, locale, siteSettings.localeStatus, true)}</p>
            <h1>
              <span>Salma Mohamed Sayed</span>
              <strong>{pickLocalized(siteSettings.hero.title, locale, siteSettings.localeStatus, true)}</strong>
            </h1>
            <p className="hero__subtitle">{pickLocalized(siteSettings.hero.subtitle, locale, siteSettings.localeStatus, true)}</p>
            <div className="hero__actions">
              <a className="primary-button" href="#projects">{pickLocalized(siteSettings.hero.ctaLabel, locale, siteSettings.localeStatus, true)}</a>
              <a className="secondary-button" href="#contact">{pickLocalized(siteSettings.hero.secondaryCtaLabel, locale, siteSettings.localeStatus, true)}</a>
            </div>
            <div className="hero__meta" aria-label="Contact summary">
              <span>{pickLocalized(siteSettings.contact.location, locale, siteSettings.localeStatus, true)}</span>
              <span>{siteSettings.contact.email}</span>
              <a href={siteSettings.contact.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
          <div className="metric-strip" aria-label={t('sections.metrics')}>
            <Metric value="95.61%" label="Table detection accuracy" />
            <Metric value="0.9092" label="Table IoU" />
            <Metric value="98.04%" label="Column precision" />
            <Metric value="96.98%" label="Column IoU" />
          </div>
        </section>

        <Section id="about" title={pickLocalized(siteSettings.about.heading, locale, siteSettings.localeStatus, true)} eyebrow={t('labels.cvSource')}>
          <div className="about-panel">
            <p>{pickLocalized(siteSettings.about.body, locale, siteSettings.localeStatus, true)}</p>
          </div>
        </Section>

        {orderedSections.map((section) => {
          if (section === 'experience') return <ExperienceSection key={section} locale={locale} />;
          if (section === 'skills') return <SkillsSection key={section} locale={locale} />;
          if (section === 'projects') return <ProjectsSection key={section} locale={locale} />;
          if (section === 'education') return <EducationSection key={section} locale={locale} />;
          if (section === 'certifications') return <CertificationSection key={section} locale={locale} />;
          if (section === 'contact') return <Section key={section} id="contact" title={t('sections.contact')} eyebrow={t('nav.contact')}><ContactForm settings={siteSettings} /></Section>;
          return null;
        })}
      </main>
      <footer className="site-footer shell">
        <span>© 2026 Salma Mohamed Sayed</span>
        <span>{source === 'fallback' ? 'Static fallback content' : 'CMS powered'}</span>
      </footer>
    </>
  );

  function ExperienceSection({ locale: localeValue }: { locale: Locale }) {
    return (
      <Section id="experience" title={t('sections.experience')} eyebrow="Training">
        <div className="timeline">
          {content.experiences.map((experience) => (
            <article className="timeline-card" key={`${experience.title.en}-${experience.periodLabel}`}>
              <div className="timeline-card__period">{experience.periodLabel}</div>
              <h3>{pickLocalized(experience.title, localeValue, experience.localeStatus)}</h3>
              <p className="timeline-card__org">{pickLocalized(experience.organization, localeValue, experience.localeStatus)}</p>
              <ul>{pickLocalizedArray(experience.bullets, localeValue, experience.localeStatus).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  function SkillsSection({ locale: localeValue }: { locale: Locale }) {
    const grouped = content.skills.reduce<Record<string, typeof content.skills>>((acc, skill) => {
      acc[skill.categoryKey] = [...(acc[skill.categoryKey] ?? []), skill];
      return acc;
    }, {});

    return (
      <Section id="skills" title={t('sections.skills')} eyebrow="Stack">
        <div className="skills-grid">
          {(Object.keys(grouped) as SkillCategoryKey[]).map((category) => (
            <article className="skill-card" key={category}>
              <h3>{skillCategoryLabels[category][localeValue]}</h3>
              <div className="chip-list">
                {grouped[category].map((skill) => (
                  <span className="chip" key={`${category}-${skill.name.en}`}>{pickLocalized(skill.name, localeValue, skill.localeStatus)}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  function ProjectsSection({ locale: localeValue }: { locale: Locale }) {
    return (
      <Section id="projects" title={t('sections.projects')} eyebrow="Portfolio">
        <ProjectsCarousel projects={content.projects} locale={localeValue} />
      </Section>
    );
  }

  function EducationSection({ locale: localeValue }: { locale: Locale }) {
    return (
      <Section id="education" title={t('sections.education')} eyebrow="Academic">
        <div className="cards-grid cards-grid--two">
          {content.education.map((item) => (
            <article className="info-card" key={item.degree.en}>
              <h3>{pickLocalized(item.institution, localeValue, item.localeStatus)}</h3>
              <p>{pickLocalized(item.degree, localeValue, item.localeStatus)}</p>
              <div className="info-card__meta"><span>{t('labels.graduation')}: {item.graduationDate}</span>{item.gpa ? <span>{t('labels.gpa')}: {item.gpa}</span> : null}</div>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  function CertificationSection({ locale: localeValue }: { locale: Locale }) {
    return (
      <Section id="certifications" title={t('sections.certifications')} eyebrow="Credentials">
        <div className="cards-grid cards-grid--four">
          {content.certifications.map((item) => (
            <article className="info-card" key={item.name.en}>
              <h3>{pickLocalized(item.name, localeValue, item.localeStatus)}</h3>
              <p>{item.details ? pickLocalized(item.details, localeValue, item.localeStatus) : item.dateLabel}</p>
            </article>
          ))}
        </div>
      </Section>
    );
  }
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Section({ id, title, eyebrow, children }: { id: string; title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="section shell" id={id}>
      <div className="section__heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
