import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { setDocumentLanguage } from '../../features/i18n/config';
import { useTheme } from '../../features/theme/ThemeProvider';
import type { Locale, SiteSettings } from '../../types/cms';
import { pickLocalized } from '../../utils/localize';

type Props = { siteSettings: SiteSettings; locale: Locale };

const navItems = ['about', 'experience', 'skills', 'projects', 'education', 'certifications', 'contact'] as const;

export function PublicHeader({ siteSettings, locale }: Props) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const name = pickLocalized({ en: 'Salma Mohamed Sayed', ar: 'سلمى محمد سيد' }, locale, { ar: 'approved' }, true);

  const switchLanguage = async () => {
    const next = i18n.language.startsWith('ar') ? 'en' : 'ar';
    await i18n.changeLanguage(next);
    setDocumentLanguage(next as Locale);
  };

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <nav className="nav shell" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="Salma Mohamed Sayed home">
          <span className="brand__mark">SM</span>
          <span>
            <strong>{name}</strong>
            <small>{pickLocalized(siteSettings.hero.title, locale, siteSettings.localeStatus, true)}</small>
          </span>
        </Link>
        <button className="nav__menu" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? t('actions.closeMenu') : t('actions.openMenu')}
        </button>
        <div className={`nav__links ${open ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a key={item} href={`#${item}`} onClick={() => setOpen(false)}>
              {t(`nav.${item}`)}
            </a>
          ))}
          <Link to="/admin">{t('nav.admin')}</Link>
        </div>
        <div className="nav__actions">
          <button className="pill-button" type="button" onClick={switchLanguage}>{t('actions.language')}</button>
          <button className="pill-button" type="button" onClick={toggleTheme} aria-label={`${t('actions.theme')}: ${theme}`}>
            {theme === 'dark' ? '☾' : '☀'}
          </button>
        </div>
      </nav>
    </header>
  );
}
