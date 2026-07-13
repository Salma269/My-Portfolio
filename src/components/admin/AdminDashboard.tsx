import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { CollectionName, PortfolioContent } from '../../types/cms';
import { statusLabel } from '../../utils/localize';

type SessionState = 'checking' | 'authenticated' | 'anonymous';
type EditableItem = Record<string, unknown> & { _id?: string; id?: string; title?: { en?: string }; name?: { en?: string }; institution?: { en?: string }; order?: number; localeStatus?: { ar?: 'draft' | 'approved' } };

const collections: CollectionName[] = ['projects', 'experiences', 'skills', 'education', 'certifications'];

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
          <button className="pill-button" type="button" onClick={logout}>{t('actions.logout')}</button>
        </div>
      </header>

      <section className="admin-stats">
        <article><strong>{pendingArabic}</strong><span>{t('admin.pendingArabic')}</span></article>
        <article><strong>{content?.projects.length ?? 0}</strong><span>Projects</span></article>
        <article><strong>{content?.skills.length ?? 0}</strong><span>Skills</span></article>
      </section>

      {content ? (
        <div className="admin-grid">
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
  const [text, setText] = useState(() => JSON.stringify(content.siteSettings, null, 2));

  useEffect(() => setText(JSON.stringify(content.siteSettings, null, 2)), [content.siteSettings]);

  const save = async () => {
    const parsed = JSON.parse(text) as PortfolioContent['siteSettings'];
    const { _id, ...payload } = parsed;
    const response = await fetch('/api/admin/site-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Could not save site settings');
    const data = (await response.json()) as { siteSettings: PortfolioContent['siteSettings'] };
    onUpdate({ ...content, siteSettings: data.siteSettings });
    onDirtyChange(false);
    toast.success('Site settings saved');
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="eyebrow">{t('admin.siteSettings')}</p><h2>{t('admin.rawEditor')}</h2></div><StatusBadge status={content.siteSettings.localeStatus.ar} /></div>
      <textarea className="json-editor" value={text} onChange={(event) => { setText(event.target.value); onDirtyChange(true); }} />
      <button className="primary-button" type="button" onClick={() => void save().catch((error: Error) => toast.error(error.message))}>{t('actions.save')}</button>
    </section>
  );
}

function CollectionEditor({ collection, content, onUpdate, onDirtyChange }: { collection: CollectionName; content: PortfolioContent; onUpdate: (content: PortfolioContent) => void; onDirtyChange: (dirty: boolean) => void }) {
  const items = content[collection] as EditableItem[];
  const [selectedId, setSelectedId] = useState('');
  const [text, setText] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const first = items[0];
    const nextId = String(first?._id ?? first?.id ?? '');
    setSelectedId(nextId);
    setText(first ? JSON.stringify(first, null, 2) : '');
  }, [collection, items]);

  const ids = items.map((item, index) => String(item._id ?? item.id ?? index));

  const dragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, order: index + 1 }));
    onUpdate({ ...content, [collection]: reordered } as PortfolioContent);
    const persistedIds = reordered.map((item) => String(item._id ?? item.id)).filter((id) => /^[a-f\d]{24}$/i.test(id));
    if (persistedIds.length === reordered.length) {
      await fetch(`/api/admin/${collection}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds: persistedIds }),
      });
      toast.success('Order saved');
    }
  };

  const selectItem = (item: EditableItem) => {
    setSelectedId(String(item._id ?? item.id ?? ''));
    setText(JSON.stringify(item, null, 2));
  };

  const save = async () => {
    const parsed = JSON.parse(text) as EditableItem;
    const id = String(parsed._id ?? parsed.id ?? selectedId);
    const { _id, id: stringId, createdAt, updatedAt, updatedBy, ...payload } = parsed;
    const response = await fetch(`/api/admin/${collection}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Could not save item');
    const data = (await response.json()) as { item: EditableItem };
    const nextItems = items.map((item) => (String(item._id ?? item.id) === id ? data.item : item));
    onUpdate({ ...content, [collection]: nextItems } as PortfolioContent);
    onDirtyChange(false);
    toast.success('Item saved');
    void stringId; void createdAt; void updatedAt; void updatedBy; void _id;
  };

  const approve = async () => {
    if (!selectedId) return;
    const response = await fetch('/api/admin/locale/approve', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ entity: collection, id: selectedId, locale: 'ar' }),
    });
    if (!response.ok) throw new Error('Could not approve Arabic draft');
    const parsed = JSON.parse(text) as EditableItem;
    parsed.localeStatus = { ar: 'approved' };
    setText(JSON.stringify(parsed, null, 2));
    onDirtyChange(true);
    toast.success('Arabic approved. Save item to sync editor state.');
  };

  return (
    <div className="collection-editor">
      <DndContext sensors={sensors} onDragEnd={(event) => void dragEnd(event).catch((error: Error) => toast.error(error.message))}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="sortable-list">
            {items.map((item, index) => (
              <SortableRow key={String(item._id ?? item.id ?? index)} id={String(item._id ?? item.id ?? index)} item={item} selected={String(item._id ?? item.id ?? index) === selectedId} onClick={() => selectItem(item)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="editor-side">
        <div className="editor-side__actions">
          <button className="pill-button" type="button" onClick={() => void approve().catch((error: Error) => toast.error(error.message))}>Approve Arabic</button>
          <button className="primary-button" type="button" onClick={() => void save().catch((error: Error) => toast.error(error.message))}>Save item</button>
        </div>
        <textarea className="json-editor" value={text} onChange={(event) => { setText(event.target.value); onDirtyChange(true); }} />
      </div>
    </div>
  );
}

function SortableRow({ id, item, selected, onClick }: { id: string; item: EditableItem; selected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const label = item.title?.en ?? item.name?.en ?? item.institution?.en ?? id;
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
