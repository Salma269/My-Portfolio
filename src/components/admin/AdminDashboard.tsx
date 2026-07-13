import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Certification, CollectionName, Education, Experience, LocaleStatus, LocalizedString, PortfolioContent, Project, ProjectImage, SectionKey, SiteSettings, Skill, SkillCategoryKey, SocialLink } from '../../types/cms';
import { statusLabel } from '../../utils/localize';

type SessionState = 'checking' | 'authenticated' | 'anonymous';
type Mode = 'edit' | 'create';
type EditableItem = Experience | Education | Certification | Skill | Project;
type EditableRecord = EditableItem & { _id?: string; id?: string };

const collections: CollectionName[] = ['projects', 'experiences', 'skills', 'education', 'certifications'];
const sectionKeys: SectionKey[] = ['experience', 'skills', 'projects', 'education', 'certifications', 'contact'];
const skillCategories: SkillCategoryKey[] = [
  'programming-languages',
  'frameworks-libraries',
  'mobile-development',
  'web-development',
  'ai-machine-learning',
  'embedded-systems',
  'databases',
  'testing-quality',
  'devops-tools',
  'architecture',
];
const draftStatus: LocaleStatus = { ar: 'draft' };

export function AdminDashboard() {
  const { t } = useTranslation();
  const [session, setSession] = useState<SessionState>('checking');
  const [identity, setIdentity] = useState('');
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionName>('projects');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then((response) => response.json())
      .then((data: { authenticated: boolean; username?: string; email?: string }) => {
        setSession(data.authenticated ? 'authenticated' : 'anonymous');
        setIdentity(data.username ?? data.email ?? '');
      })
      .catch(() => setSession('anonymous'));
  }, []);

  useEffect(() => {
    if (session !== 'authenticated') return;
    fetch('/api/admin/content', { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load admin content');
        return response.json() as Promise<{ content: PortfolioContent }>;
      })
      .then((data) => setContent(data.content))
      .catch((error: Error) => toast.error(error.message));
  }, [session]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const pendingArabic = useMemo(() => (content ? countPendingArabic(content) : 0), [content]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setSession('anonymous');
  };

  if (session === 'checking') return <main className="admin-shell"><p>Loading...</p></main>;
  if (session === 'anonymous') return <Navigate to="/admin/login" replace />;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">{identity}</p>
          <h1>{t('admin.dashboard')}</h1>
        </div>
        <div className="admin-header__actions">
          <Link className="secondary-button" to="/" target="_blank">{t('actions.openSite')}</Link>
          <a className="secondary-button" href="/cv" target="_blank" rel="noreferrer">{t('actions.downloadCv')}</a>
          <button className="pill-button" type="button" onClick={logout}>{t('actions.logout')}</button>
        </div>
      </header>

      <section className="admin-stats">
        <article><strong>{pendingArabic}</strong><span>{t('admin.pendingArabic')}</span></article>
        <article><strong>{content?.projects.length ?? 0}</strong><span>Projects</span></article>
        <article><strong>{content?.skills.length ?? 0}</strong><span>Skills</span></article>
      </section>

      {content ? (
        <div className="admin-grid admin-grid--visual">
          <SiteSettingsEditor content={content} onUpdate={setContent} onDirtyChange={setDirty} />
          <section className="admin-panel">
            <div className="admin-panel__heading">
              <div><p className="eyebrow">{t('admin.contentCollections')}</p><h2>{selectedCollection}</h2></div>
              <select value={selectedCollection} onChange={(event) => setSelectedCollection(event.target.value as CollectionName)}>
                {collections.map((collection) => <option key={collection} value={collection}>{collection}</option>)}
              </select>
            </div>
            <CollectionEditor collection={selectedCollection} content={content} onUpdate={setContent} onDirtyChange={setDirty} />
          </section>
        </div>
      ) : <p>Loading CMS snapshot...</p>}
    </main>
  );
}

function SiteSettingsEditor({ content, onUpdate, onDirtyChange }: { content: PortfolioContent; onUpdate: (content: PortfolioContent) => void; onDirtyChange: (dirty: boolean) => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SiteSettings>(() => structuredClone(content.siteSettings));

  useEffect(() => setDraft(structuredClone(content.siteSettings)), [content.siteSettings]);

  const mark = () => onDirtyChange(true);
  const updateHero = (key: keyof SiteSettings['hero'], value: LocalizedString) => { setDraft((current) => ({ ...current, hero: { ...current.hero, [key]: value } })); mark(); };
  const updateAbout = (key: keyof SiteSettings['about'], value: LocalizedString) => { setDraft((current) => ({ ...current, about: { ...current.about, [key]: value } })); mark(); };
  const updateContact = (patch: Partial<SiteSettings['contact']>) => { setDraft((current) => ({ ...current, contact: { ...current.contact, ...patch } })); mark(); };
  const updateSeo = (key: keyof SiteSettings['seo'], value: LocalizedString | string | undefined) => { setDraft((current) => ({ ...current, seo: { ...current.seo, [key]: value } })); mark(); };
  const updateSection = (key: SectionKey, patch: Partial<SiteSettings['sections'][SectionKey]>) => { setDraft((current) => ({ ...current, sections: { ...current.sections, [key]: { ...current.sections[key], ...patch } } })); mark(); };

  const save = async () => {
    const payload = stripAudit(draft);
    const response = await fetch('/api/admin/site-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Could not save site settings');
    const data = (await response.json()) as { siteSettings: SiteSettings };
    onUpdate({ ...content, siteSettings: data.siteSettings });
    onDirtyChange(false);
    toast.success('Site settings saved');
  };

  return (
    <section className="admin-panel admin-panel--settings">
      <div className="admin-panel__heading"><div><p className="eyebrow">{t('admin.siteSettings')}</p><h2>{t('admin.rawEditor')}</h2></div><StatusBadge status={draft.localeStatus.ar} /></div>
      <div className="admin-form-grid">
        <LocalizedFields label="Hero title" value={draft.hero.title} onChange={(value) => updateHero('title', value)} />
        <LocalizedFields label="Hero eyebrow" value={draft.hero.eyebrow} onChange={(value) => updateHero('eyebrow', value)} />
        <LocalizedFields label="Hero subtitle" value={draft.hero.subtitle} multiline onChange={(value) => updateHero('subtitle', value)} />
        <LocalizedFields label="Primary CTA" value={draft.hero.ctaLabel} onChange={(value) => updateHero('ctaLabel', value)} />
        <LocalizedFields label="Secondary CTA" value={draft.hero.secondaryCtaLabel} onChange={(value) => updateHero('secondaryCtaLabel', value)} />
        <LocalizedFields label="About heading" value={draft.about.heading} onChange={(value) => updateAbout('heading', value)} />
        <LocalizedFields label="About body" value={draft.about.body} multiline onChange={(value) => updateAbout('body', value)} />
        <label>Email<input type="email" value={draft.contact.email} onChange={(event) => updateContact({ email: event.target.value })} /></label>
        <label>Phones<textarea rows={3} value={draft.contact.phones.join('\n')} onChange={(event) => updateContact({ phones: splitLines(event.target.value) })} /></label>
        <LocalizedFields label="Location" value={draft.contact.location} onChange={(value) => updateContact({ location: value })} />
        <label>GitHub URL<input value={draft.contact.githubUrl} onChange={(event) => updateContact({ githubUrl: event.target.value })} /></label>
        <LocalizedFields label="SEO title" value={draft.seo.title} onChange={(value) => updateSeo('title', value)} />
        <LocalizedFields label="SEO description" value={draft.seo.description} multiline onChange={(value) => updateSeo('description', value)} />
        <label>Social links <small>One per line: Label | https://url | true</small><textarea rows={3} value={formatSocialLinks(draft.socialLinks)} onChange={(event) => { setDraft((current) => ({ ...current, socialLinks: parseSocialLinks(event.target.value) })); mark(); }} /></label>
      </div>
      <div className="section-toggle-grid">
        {sectionKeys.map((key) => (
          <div className="section-toggle" key={key}>
            <label><input type="checkbox" checked={draft.sections[key].visible} onChange={(event) => updateSection(key, { visible: event.target.checked })} /> {key}</label>
            <input type="number" min={1} value={draft.sections[key].order} onChange={(event) => updateSection(key, { order: Number(event.target.value) })} aria-label={`${key} order`} />
          </div>
        ))}
      </div>
      <button className="primary-button" type="button" onClick={() => void save().catch((error: Error) => toast.error(error.message))}>{t('actions.save')}</button>
    </section>
  );
}

function CollectionEditor({ collection, content, onUpdate, onDirtyChange }: { collection: CollectionName; content: PortfolioContent; onUpdate: (content: PortfolioContent) => void; onDirtyChange: (dirty: boolean) => void }) {
  const { t } = useTranslation();
  const items = useMemo(() => ([...(content[collection] as EditableRecord[])]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [collection, content]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<EditableRecord>(() => createDefaultItem(collection, 1));
  const [mode, setMode] = useState<Mode>('edit');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const first = items[0];
    if (!first) {
      setMode('create');
      setSelectedId('');
      setDraft(createDefaultItem(collection, 1));
      return;
    }
    setMode('edit');
    setSelectedId(getItemId(first));
    setDraft(structuredClone(first));
  }, [collection, items]);

  const ids = items.map((item, index) => getItemId(item) || String(index));
  const mark = () => onDirtyChange(true);
  const updateDraft = (next: EditableRecord) => { setDraft(next); mark(); };

  const selectItem = (item: EditableRecord) => {
    setMode('edit');
    setSelectedId(getItemId(item));
    setDraft(structuredClone(item));
    onDirtyChange(false);
  };

  const addNew = () => {
    setMode('create');
    setSelectedId('');
    setDraft(createDefaultItem(collection, nextOrder(items)));
    onDirtyChange(true);
  };

  const dragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, order: index + 1 }));
    onUpdate({ ...content, [collection]: reordered } as PortfolioContent);
    const persistedIds = reordered.map((item) => getItemId(item)).filter((id) => /^[a-f\d]{24}$/i.test(id));
    if (persistedIds.length === reordered.length) {
      const response = await fetch(`/api/admin/${collection}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds: persistedIds }),
      });
      if (!response.ok) throw new Error('Could not save order');
      toast.success('Order saved');
    }
  };

  const save = async () => {
    const payload = stripAudit(draft);
    const isCreate = mode === 'create';
    const endpoint = isCreate ? `/api/admin/${collection}` : `/api/admin/${collection}/${selectedId}`;
    const response = await fetch(endpoint, {
      method: isCreate ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(isCreate ? 'Could not create item' : 'Could not save item');
    const data = (await response.json()) as { item: EditableRecord };
    const nextItems = isCreate ? [...items, data.item] : items.map((item) => (getItemId(item) === selectedId ? data.item : item));
    onUpdate({ ...content, [collection]: nextItems } as PortfolioContent);
    setMode('edit');
    setSelectedId(getItemId(data.item));
    setDraft(data.item);
    onDirtyChange(false);
    toast.success(isCreate ? 'Item created' : 'Item saved');
  };

  const remove = async () => {
    if (mode === 'create' || !selectedId) return;
    if (!window.confirm('Delete this item?')) return;
    const response = await fetch(`/api/admin/${collection}/${selectedId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: '{}' });
    if (!response.ok && response.status !== 204) throw new Error('Could not delete item');
    const nextItems = items.filter((item) => getItemId(item) !== selectedId);
    onUpdate({ ...content, [collection]: nextItems } as PortfolioContent);
    setSelectedId(getItemId(nextItems[0]));
    setDraft(nextItems[0] ? structuredClone(nextItems[0]) : createDefaultItem(collection, 1));
    setMode(nextItems[0] ? 'edit' : 'create');
    onDirtyChange(false);
    toast.success('Item deleted');
  };

  const approve = async () => {
    if (!selectedId || collection === undefined) return;
    if (mode === 'create') {
      updateDraft({ ...draft, localeStatus: { ar: 'approved' } });
      return;
    }
    const response = await fetch('/api/admin/locale/approve', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ entity: collection, id: selectedId, locale: 'ar' }),
    });
    if (!response.ok) throw new Error('Could not approve Arabic draft');
    const nextDraft = { ...draft, localeStatus: { ar: 'approved' as const } };
    setDraft(nextDraft);
    onUpdate({ ...content, [collection]: items.map((item) => (getItemId(item) === selectedId ? nextDraft : item)) } as PortfolioContent);
    onDirtyChange(false);
    toast.success('Arabic draft approved');
  };

  return (
    <div className="collection-editor collection-editor--forms">
      <div className="collection-list-panel">
        <button className="primary-button admin-add-button" type="button" onClick={addNew}>{t('actions.add')} {collection.slice(0, -1)}</button>
        <DndContext sensors={sensors} onDragEnd={(event) => void dragEnd(event).catch((error: Error) => toast.error(error.message))}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="sortable-list">
              {items.map((item, index) => (
                <SortableRow key={getItemId(item) || index} id={getItemId(item) || String(index)} item={item} selected={getItemId(item) === selectedId && mode === 'edit'} onClick={() => selectItem(item)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div className="editor-side">
        <div className="editor-side__actions">
          <StatusBadge status={draft.localeStatus?.ar} />
          <button className="pill-button" type="button" onClick={() => void approve().catch((error: Error) => toast.error(error.message))}>Approve Arabic</button>
          <button className="secondary-button" type="button" onClick={() => void remove().catch((error: Error) => toast.error(error.message))} disabled={mode === 'create'}>{t('actions.delete')}</button>
          <button className="primary-button" type="button" onClick={() => void save().catch((error: Error) => toast.error(error.message))}>{mode === 'create' ? t('actions.create') : t('actions.save')}</button>
        </div>
        <ItemForm collection={collection} item={draft} onChange={updateDraft} />
      </div>
    </div>
  );
}

function ItemForm({ collection, item, onChange }: { collection: CollectionName; item: EditableRecord; onChange: (item: EditableRecord) => void }) {
  const common = <CommonFields item={item} onChange={onChange} />;
  if (collection === 'projects') return <ProjectForm item={item as Project} onChange={(next) => onChange(next)} common={common} />;
  if (collection === 'experiences') return <ExperienceForm item={item as Experience} onChange={(next) => onChange(next)} common={common} />;
  if (collection === 'skills') return <SkillForm item={item as Skill} onChange={(next) => onChange(next)} common={common} />;
  if (collection === 'education') return <EducationForm item={item as Education} onChange={(next) => onChange(next)} common={common} />;
  return <CertificationForm item={item as Certification} onChange={(next) => onChange(next)} common={common} />;
}

function CommonFields({ item, onChange }: { item: EditableRecord; onChange: (item: EditableRecord) => void }) {
  return (
    <div className="admin-form-grid admin-form-grid--compact">
      <label>Order<input type="number" min={0} value={item.order} onChange={(event) => onChange({ ...item, order: Number(event.target.value) })} /></label>
      <label className="checkbox-label"><input type="checkbox" checked={item.visible} onChange={(event) => onChange({ ...item, visible: event.target.checked })} /> Visible</label>
      <label>Arabic status<select value={item.localeStatus?.ar ?? 'draft'} onChange={(event) => onChange({ ...item, localeStatus: { ar: event.target.value as 'draft' | 'approved' } })}><option value="draft">Draft</option><option value="approved">Approved</option></select></label>
    </div>
  );
}

function ProjectForm({ item, onChange, common }: { item: Project; onChange: (item: Project) => void; common: React.ReactNode }) {
  const galleryText = item.gallery.map((image) => image.blobUrl).join('\n');
  const coverUrl = item.coverImage?.blobUrl ?? '';
  const setGallery = (value: string) => onChange({ ...item, gallery: splitLines(value).map((url, index) => makeProjectImage(url, item, index + 1, `Gallery ${index + 1}`)) });
  const setCover = (value: string) => onChange({ ...item, coverImage: value.trim() ? makeProjectImage(value.trim(), item, 0, 'Cover') : undefined });
  return (
    <div className="admin-visual-form">
      {common}
      <div className="admin-form-grid">
        <label>Slug<input value={item.slug} onChange={(event) => onChange({ ...item, slug: slugify(event.target.value) })} /></label>
        <label>Period<input value={item.periodLabel} onChange={(event) => onChange({ ...item, periodLabel: event.target.value })} /></label>
        <label className="checkbox-label"><input type="checkbox" checked={item.featured} onChange={(event) => onChange({ ...item, featured: event.target.checked })} /> Featured</label>
        <label className="checkbox-label"><input type="checkbox" checked={item.published} onChange={(event) => onChange({ ...item, published: event.target.checked })} /> Published</label>
        <LocalizedFields label="Title" value={item.title} onChange={(value) => onChange({ ...item, title: value })} />
        <LocalizedFields label="Short description" value={item.shortDescription} multiline onChange={(value) => onChange({ ...item, shortDescription: value })} />
        <LocalizedFields label="Detailed description" value={item.detailedDescription} multiline onChange={(value) => onChange({ ...item, detailedDescription: value })} />
        <LocalizedArrayFields label="Highlights" value={item.highlights} onChange={(value) => onChange({ ...item, highlights: value })} />
        <label>Technologies <small>Comma or newline separated</small><textarea rows={3} value={item.technologies.join(', ')} onChange={(event) => onChange({ ...item, technologies: splitTokens(event.target.value) })} /></label>
        <label>Repo URL<input value={item.repoUrl ?? ''} onChange={(event) => onChange({ ...item, repoUrl: event.target.value || undefined })} /></label>
        <label>Live URL<input value={item.liveUrl ?? ''} onChange={(event) => onChange({ ...item, liveUrl: event.target.value || undefined })} /></label>
        <label>Cover image URL<input value={coverUrl} onChange={(event) => setCover(event.target.value)} /></label>
        <label>Gallery image URLs <small>One per line. Use /project-assets/... or HTTPS URLs.</small><textarea rows={4} value={galleryText} onChange={(event) => setGallery(event.target.value)} /></label>
      </div>
      <ProjectPreview project={item} />
    </div>
  );
}

function ExperienceForm({ item, onChange, common }: { item: Experience; onChange: (item: Experience) => void; common: React.ReactNode }) {
  return (
    <div className="admin-visual-form">
      {common}
      <div className="admin-form-grid">
        <LocalizedFields label="Title" value={item.title} onChange={(value) => onChange({ ...item, title: value })} />
        <LocalizedFields label="Organization" value={item.organization} onChange={(value) => onChange({ ...item, organization: value })} />
        <LocalizedFields label="Location" value={item.location ?? emptyLocalized()} onChange={(value) => onChange({ ...item, location: value })} />
        <label>Start date<input type="month" value={item.startDate} onChange={(event) => onChange({ ...item, startDate: event.target.value })} /></label>
        <label>End date<input value={item.endDate} onChange={(event) => onChange({ ...item, endDate: event.target.value })} /></label>
        <label>Period label<input value={item.periodLabel} onChange={(event) => onChange({ ...item, periodLabel: event.target.value })} /></label>
        <LocalizedArrayFields label="Bullets" value={item.bullets} onChange={(value) => onChange({ ...item, bullets: value })} />
      </div>
    </div>
  );
}

function SkillForm({ item, onChange, common }: { item: Skill; onChange: (item: Skill) => void; common: React.ReactNode }) {
  return (
    <div className="admin-visual-form">
      {common}
      <div className="admin-form-grid">
        <LocalizedFields label="Skill name" value={item.name} onChange={(value) => onChange({ ...item, name: value })} />
        <label>Category<select value={item.categoryKey} onChange={(event) => onChange({ ...item, categoryKey: event.target.value as SkillCategoryKey })}>{skillCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label>Icon ID<input value={item.iconId ?? ''} onChange={(event) => onChange({ ...item, iconId: event.target.value || undefined })} /></label>
      </div>
    </div>
  );
}

function EducationForm({ item, onChange, common }: { item: Education; onChange: (item: Education) => void; common: React.ReactNode }) {
  return (
    <div className="admin-visual-form">
      {common}
      <div className="admin-form-grid">
        <LocalizedFields label="Institution" value={item.institution} onChange={(value) => onChange({ ...item, institution: value })} />
        <LocalizedFields label="Degree" value={item.degree} multiline onChange={(value) => onChange({ ...item, degree: value })} />
        <LocalizedFields label="Details" value={item.details ?? emptyLocalized()} multiline onChange={(value) => onChange({ ...item, details: value })} />
        <label>Graduation date<input type="month" value={item.graduationDate} onChange={(event) => onChange({ ...item, graduationDate: event.target.value })} /></label>
        <label>GPA<input value={item.gpa ?? ''} onChange={(event) => onChange({ ...item, gpa: event.target.value || undefined })} /></label>
      </div>
    </div>
  );
}

function CertificationForm({ item, onChange, common }: { item: Certification; onChange: (item: Certification) => void; common: React.ReactNode }) {
  return (
    <div className="admin-visual-form">
      {common}
      <div className="admin-form-grid">
        <LocalizedFields label="Name" value={item.name} onChange={(value) => onChange({ ...item, name: value })} />
        <LocalizedFields label="Issuer" value={item.issuer ?? emptyLocalized()} onChange={(value) => onChange({ ...item, issuer: value })} />
        <LocalizedFields label="Details" value={item.details ?? emptyLocalized()} multiline onChange={(value) => onChange({ ...item, details: value })} />
        <label>Date label<input value={item.dateLabel} onChange={(event) => onChange({ ...item, dateLabel: event.target.value })} /></label>
        <label>Score<input value={item.score ?? ''} onChange={(event) => onChange({ ...item, score: event.target.value || undefined })} /></label>
      </div>
    </div>
  );
}

function LocalizedFields({ label, value, multiline = false, onChange }: { label: string; value: LocalizedString; multiline?: boolean; onChange: (value: LocalizedString) => void }) {
  const field = (locale: keyof LocalizedString) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [locale]: event.target.value });
    return multiline ? <textarea rows={locale === 'en' ? 4 : 3} value={value[locale]} onChange={handleChange} /> : <input value={value[locale]} onChange={handleChange} />;
  };
  return (
    <fieldset className="localized-field">
      <legend>{label}</legend>
      <label>English{field('en')}</label>
      <label>Arabic draft{field('ar')}</label>
    </fieldset>
  );
}

function LocalizedArrayFields({ label, value, onChange }: { label: string; value: { en: string[]; ar: string[] }; onChange: (value: { en: string[]; ar: string[] }) => void }) {
  return (
    <fieldset className="localized-field localized-field--array">
      <legend>{label}</legend>
      <label>English<textarea rows={5} value={value.en.join('\n')} onChange={(event) => onChange({ ...value, en: splitLines(event.target.value) })} /></label>
      <label>Arabic draft<textarea rows={5} value={value.ar.join('\n')} onChange={(event) => onChange({ ...value, ar: splitLines(event.target.value) })} /></label>
    </fieldset>
  );
}

function ProjectPreview({ project }: { project: Project }) {
  const images = project.gallery.length ? project.gallery : project.coverImage ? [project.coverImage] : [];
  if (!images.length) return null;
  return (
    <div className="admin-project-preview">
      {images.slice(0, 4).map((image) => <img key={image.id} src={image.blobUrl} alt={image.alt.en} />)}
    </div>
  );
}

function SortableRow({ id, item, selected, onClick }: { id: string; item: EditableRecord; selected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const label = getItemLabel(item);
  return (
    <button ref={setNodeRef} style={style} className={`sortable-row ${selected ? 'is-selected' : ''}`} type="button" onClick={onClick} {...attributes} {...listeners}>
      <span>{label}</span>
      <StatusBadge status={item.localeStatus?.ar} />
    </button>
  );
}

function StatusBadge({ status }: { status?: 'draft' | 'approved' }) {
  return <span className={`badge ${status === 'approved' ? 'badge--success' : 'badge--warning'}`}>{statusLabel(status)}</span>;
}

function countPendingArabic(content: PortfolioContent): number {
  const collectionsToCount = [content.siteSettings, ...content.projects, ...content.experiences, ...content.education, ...content.certifications, ...content.skills];
  return collectionsToCount.filter((item) => item.localeStatus?.ar !== 'approved').length;
}

function getItemId(item?: EditableRecord): string {
  return String(item?._id ?? item?.id ?? '');
}

function getItemLabel(item: EditableRecord): string {
  if ('title' in item) return item.title.en;
  if ('name' in item) return item.name.en;
  if ('institution' in item) return item.institution.en;
  return getItemId(item);
}

function nextOrder(items: EditableRecord[]): number {
  return Math.max(0, ...items.map((item) => item.order ?? 0)) + 1;
}

function createDefaultItem(collection: CollectionName, order: number): EditableRecord {
  const base = { order, visible: true, localeStatus: draftStatus };
  if (collection === 'projects') {
    return { ...base, slug: `new-project-${order}`, title: emptyLocalized('New project'), shortDescription: emptyLocalized('Short project summary'), detailedDescription: emptyLocalized('Detailed project story'), highlights: emptyArray(['Add a measurable highlight']), technologies: ['TypeScript'], repoUrl: undefined, liveUrl: undefined, periodLabel: '2026', featured: false, published: true, gallery: [] } satisfies Project;
  }
  if (collection === 'experiences') {
    return { ...base, title: emptyLocalized('New experience'), organization: emptyLocalized('Organization'), location: emptyLocalized(), startDate: '2026-01', endDate: '2026-02', periodLabel: 'Jan 2026 – Feb 2026', bullets: emptyArray(['Describe the impact']) } satisfies Experience;
  }
  if (collection === 'skills') {
    return { ...base, name: emptyLocalized('New skill'), categoryKey: 'programming-languages', iconId: 'new-skill' } satisfies Skill;
  }
  if (collection === 'education') {
    return { ...base, institution: emptyLocalized('Institution'), degree: emptyLocalized('Degree'), details: emptyLocalized(), graduationDate: '2026-06', gpa: '' } satisfies Education;
  }
  return { ...base, name: emptyLocalized('Certification'), issuer: emptyLocalized(), details: emptyLocalized(), dateLabel: '2026', score: '' } satisfies Certification;
}

function emptyLocalized(en = ''): LocalizedString {
  return { en, ar: '' };
}

function emptyArray(en: string[] = []): { en: string[]; ar: string[] } {
  return { en, ar: [] };
}

function splitLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function splitTokens(value: string): string[] {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'new-project';
}

function makeProjectImage(url: string, project: Project, order: number, label: string): ProjectImage {
  const slug = project.slug || slugify(project.title.en);
  const safe = slug.slice(0, 42);
  return {
    id: `${safe}-${order}-${slugify(label)}`.slice(0, 80),
    blobUrl: url,
    pathname: assetPath(url),
    alt: { en: `${project.title.en} ${label}`, ar: `${project.title.ar || project.title.en} ${label}` },
    caption: { en: label, ar: label },
    order,
    mimeType: url.endsWith('.svg') ? 'image/svg+xml' : undefined,
  };
}


function assetPath(url: string): string {
  if (url.startsWith('/')) return url.slice(1);
  try {
    return new URL(url).pathname.replace(/^\//, '');
  } catch {
    return url;
  }
}

function stripAudit<T extends Record<string, unknown>>(item: T): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...item };
  delete payload._id;
  delete payload.id;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.updatedBy;
  return payload;
}

function formatSocialLinks(links: SocialLink[]): string {
  return links.map((link) => `${link.label} | ${link.url} | ${link.visible}`).join('\n');
}

function parseSocialLinks(value: string): SocialLink[] {
  return splitLines(value).map((line, index) => {
    const [label = 'Link', url = '', visible = 'true'] = line.split('|').map((part) => part.trim());
    return { label, url, visible: visible !== 'false', order: index + 1 };
  });
}
