import { useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProtectedRoute, setAdmin } from '../../routes/ProtectedRoute';
import {
  getPortfolioData,
  getPortfolioDataAsync,
  setPortfolioData,
  exportPortfolioJson,
  getPortfolioApiSecret,
  setPortfolioApiSecret,
  type SyncResult,
} from '../../utils/portfolioStore';
import type { PortfolioData, Project, ExperienceEntry } from '../../types/portfolio';

/* ─── helpers ─────────────────────────────────────────────── */

function newId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ─── tab definitions ─────────────────────────────────────── */

type TabId = 'sync' | 'hero' | 'skills' | 'projects' | 'experience' | 'contact';

const TABS: { id: TabId; label: string }[] = [
  { id: 'sync',       label: 'Sync'       },
  { id: 'hero',       label: 'Hero'       },
  { id: 'skills',     label: 'Skills'     },
  { id: 'projects',   label: 'Projects'   },
  { id: 'experience', label: 'Experience' },
  { id: 'contact',    label: 'Contact'    },
];

/* ─── reusable chip-list input ────────────────────────────── */

function ChipList({
  items,
  onAdd,
  onRemove,
  placeholder = 'Add item…',
  /** When true (default), commas split into multiple chips on commit. When false, the whole line is one chip (e.g. experience highlights). */
  splitCommaSeparated = true,
}: {
  items: string[];
  onAdd: (values: string[]) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  splitCommaSeparated?: boolean;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commitInput = (raw: string) => {
    const values = splitCommaSeparated
      ? raw
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : (() => {
          const one = raw.trim();
          return one ? [one] : [];
        })();
    if (values.length) {
      flushSync(() => {
        onAdd(values);
      });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput(input);
    }
    if (splitCommaSeparated && e.key === ',') {
      e.preventDefault();
      commitInput(input);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!splitCommaSeparated) return;
    const pasted = e.clipboardData.getData('text');
    if (pasted.includes(',')) {
      e.preventDefault();
      commitInput(input + pasted);
    }
  };

  return (
    <div className="admin-chips-wrap">
      <div className="admin-chips">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="admin-chip">
            {item}
            <button
              type="button"
              className="admin-chip-remove"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${item}`}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="admin-chip-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commitInput(input)}
          onPaste={handlePaste}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

/* ─── individual tab panels ───────────────────────────────── */

function SyncPanel({
  apiSecret,
  syncing,
  lastSync,
  onSaveToCloud,
  onLoadFromCloud,
}: {
  apiSecret: string;
  syncing: boolean;
  lastSync: SyncResult | null;
  onSaveToCloud: () => void;
  onLoadFromCloud: () => void;
}) {
  return (
    <div className="dash-panel">
      <h2 className="dash-panel-title">Cloud Sync</h2>
      <p className="dash-panel-desc">Push or pull your portfolio data to/from the cloud API.</p>

      <div className="dash-field-group">
        <div className="admin-sync-actions">
          <button
            type="button"
            className="admin-btn"
            onClick={onSaveToCloud}
            disabled={!apiSecret.trim() || syncing}
          >
            {syncing ? 'Saving…' : 'Save to cloud'}
          </button>
          <button
            type="button"
            className="admin-btn secondary"
            onClick={onLoadFromCloud}
            disabled={syncing}
          >
            Load from cloud
          </button>
        </div>
        {lastSync && (
          <p className={`admin-sync-status ${lastSync.synced ? 'success' : 'error'}`}>
            {lastSync.synced ? '✓ Synced successfully' : `✗ ${lastSync.error ?? 'Sync failed'}`}
          </p>
        )}
      </div>

      {!apiSecret.trim() && (
        <p className="dash-warn">
          No API secret configured — cloud save is disabled. Set <code>PORTFOLIO_API_SECRET</code> in your environment and add it below.
        </p>
      )}
    </div>
  );
}

function HeroPanel({
  data,
  update,
}: {
  data: PortfolioData;
  update: (u: Partial<PortfolioData>) => void;
}) {
  return (
    <div className="dash-panel">
      <h2 className="dash-panel-title">Hero</h2>
      <p className="dash-panel-desc">Your name, title, intro paragraph, and profile image shown at the top of the page.</p>

      <div className="dash-field-group">
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-name">Full name</label>
          <input id="d-name" className="admin-input" value={data.name} onChange={(e) => update({ name: e.target.value })} />
        </div>
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-title">Title / role</label>
          <input id="d-title" className="admin-input" value={data.title} onChange={(e) => update({ title: e.target.value })} />
        </div>
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-exp">Experience label</label>
          <input id="d-exp" className="admin-input" placeholder="4+ Years Experience" value={data.experienceYears} onChange={(e) => update({ experienceYears: e.target.value })} />
        </div>
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-intro">Intro paragraph</label>
          <textarea id="d-intro" className="admin-input admin-textarea" rows={4} value={data.intro} onChange={(e) => update({ intro: e.target.value })} />
        </div>
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-img">Profile image URL</label>
          <input id="d-img" className="admin-input" type="url" placeholder="https://…" value={data.profileImage ?? ''} onChange={(e) => update({ profileImage: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ─── drag handle icon ────────────────────────────────────── */

function DragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="drag-handle" aria-label="Drag to reorder" {...props}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
        <circle cx="4" cy="3"  r="1.1" /><circle cx="10" cy="3"  r="1.1" />
        <circle cx="4" cy="7"  r="1.1" /><circle cx="10" cy="7"  r="1.1" />
        <circle cx="4" cy="11" r="1.1" /><circle cx="10" cy="11" r="1.1" />
      </svg>
    </button>
  );
}

/* ─── sortable project card ───────────────────────────────── */

function SortableProjectCard({
  project,
  setData,
  removeProject,
  overlay = false,
}: {
  project: Project;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  removeProject: (id: string) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const updateProject = (patch: Partial<Project>) => {
    setData((prev) => {
      const next = { ...prev, projects: prev.projects.map((p) => p.id === project.id ? { ...p, ...patch } : p) };
      setPortfolioData(next);
      return next;
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-card${overlay ? ' drag-overlay-card' : ''}`}
    >
      <div className="admin-card-head">
        <DragHandle {...listeners} {...attributes} />
        <input
          className="admin-input"
          placeholder="Project title"
          value={project.title}
          onChange={(e) => updateProject({ title: e.target.value })}
        />
        <button type="button" className="admin-btn admin-btn-small danger" onClick={() => removeProject(project.id)}>
          Remove
        </button>
      </div>

      <label>Description</label>
      <textarea
        className="admin-input admin-textarea"
        placeholder="Short description…"
        value={project.description}
        onChange={(e) => updateProject({ description: e.target.value })}
        rows={2}
      />

      <label>Tech stack</label>
      <ChipList
        items={project.techStack}
        placeholder="e.g. React, TypeScript, Node.js…"
        onAdd={(values) => {
          setData((prev) => {
            const techStack = [...(prev.projects.find((p) => p.id === project.id)?.techStack ?? []), ...values];
            const next = { ...prev, projects: prev.projects.map((p) => p.id === project.id ? { ...p, techStack } : p) };
            setPortfolioData(next);
            return next;
          });
        }}
        onRemove={(index) => {
          setData((prev) => {
            const techStack = (prev.projects.find((p) => p.id === project.id)?.techStack ?? []).filter((_, i) => i !== index);
            const next = { ...prev, projects: prev.projects.map((p) => p.id === project.id ? { ...p, techStack } : p) };
            setPortfolioData(next);
            return next;
          });
        }}
      />

      <label>Role / contribution</label>
      <input
        className="admin-input"
        placeholder="Your role on this project"
        value={project.role}
        onChange={(e) => updateProject({ role: e.target.value })}
      />

      <div className="dash-two-col">
        <div>
          <label>Project link</label>
          <input
            className="admin-input"
            type="url"
            placeholder="https://…"
            value={project.link ?? ''}
            onChange={(e) => updateProject({ link: e.target.value })}
          />
        </div>
        <div>
          <label>Play Store / App Store URL</label>
          <input
            className="admin-input"
            type="url"
            placeholder="https://play.google.com/…"
            value={project.playStoreLink ?? ''}
            onChange={(e) => updateProject({ playStoreLink: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label>Image URL</label>
        <input
          className="admin-input"
          type="url"
          placeholder="App screenshot or icon URL"
          value={project.image ?? ''}
          onChange={(e) => updateProject({ image: e.target.value })}
        />
      </div>
    </div>
  );
}

/* ─── sortable skill category ─────────────────────────────── */

function SortableSkillCategory({
  category,
  skills,
  setData,
  categoryRenameDraft,
  setCategoryRenameDraft,
  removeSkillCategory,
  overlay = false,
}: {
  category: string;
  skills: string[];
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  categoryRenameDraft: Record<string, string>;
  setCategoryRenameDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  removeSkillCategory: (cat: string) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-skill-category${overlay ? ' drag-overlay-card' : ''}`}
    >
      <div className="admin-skill-category-header">
        <DragHandle {...listeners} {...attributes} />
        <input
          className="admin-input admin-input-inline"
          value={categoryRenameDraft[category] ?? category}
          onChange={(e) => setCategoryRenameDraft((p) => ({ ...p, [category]: e.target.value }))}
          onBlur={() => {
            const newName = (categoryRenameDraft[category] ?? category).trim();
            setCategoryRenameDraft((p) => { const n = { ...p }; delete n[category]; return n; });
            if (newName && newName !== category) {
              setData((prev) => {
                const { [category]: list, ...rest } = prev.skills;
                const ordered = Object.fromEntries(
                  Object.keys({ ...rest, [newName]: list }).map((k) => [k, k === newName ? list : prev.skills[k]])
                );
                const next = { ...prev, skills: ordered };
                setPortfolioData(next);
                return next;
              });
            }
          }}
          placeholder="Category name"
        />
        <button type="button" className="admin-btn admin-btn-small danger" onClick={() => removeSkillCategory(category)}>
          Remove
        </button>
      </div>
      <ChipList
        items={skills}
        placeholder={`React, TypeScript, Node.js…`}
        onAdd={(values) => {
          setData((prev) => {
            const list = [...(prev.skills[category] ?? []), ...values];
            const next = { ...prev, skills: { ...prev.skills, [category]: list } };
            setPortfolioData(next);
            return next;
          });
        }}
        onRemove={(index) => {
          setData((prev) => {
            const list = (prev.skills[category] ?? []).filter((_, i) => i !== index);
            const next = { ...prev, skills: { ...prev.skills, [category]: list } };
            setPortfolioData(next);
            return next;
          });
        }}
      />
    </div>
  );
}

/* ─── Skills panel ────────────────────────────────────────── */

function SkillsPanel({
  data,
  setData,
  categoryRenameDraft,
  setCategoryRenameDraft,
  addSkillCategory,
  removeSkillCategory,
}: {
  data: PortfolioData;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  categoryRenameDraft: Record<string, string>;
  setCategoryRenameDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  addSkillCategory: () => void;
  removeSkillCategory: (cat: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryKeys = Object.keys(data.skills);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCategory(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCategory(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setData((prev) => {
      const keys = Object.keys(prev.skills);
      const oldIndex = keys.indexOf(active.id as string);
      const newIndex = keys.indexOf(over.id as string);
      const reordered = arrayMove(keys, oldIndex, newIndex);
      const next = {
        ...prev,
        skills: Object.fromEntries(reordered.map((k) => [k, prev.skills[k]])),
      };
      setPortfolioData(next);
      return next;
    });
  };

  return (
    <div className="dash-panel">
      <h2 className="dash-panel-title">Skills</h2>
      <p className="dash-panel-desc">
        Drag categories to reorder them. Press Enter or comma to add a skill chip.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={categoryKeys} strategy={verticalListSortingStrategy}>
          <div className="dash-field-group">
            {categoryKeys.map((category) => (
              <SortableSkillCategory
                key={category}
                category={category}
                skills={data.skills[category]}
                setData={setData}
                categoryRenameDraft={categoryRenameDraft}
                setCategoryRenameDraft={setCategoryRenameDraft}
                removeSkillCategory={removeSkillCategory}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeCategory ? (
            <SortableSkillCategory
              category={activeCategory}
              skills={data.skills[activeCategory] ?? []}
              setData={setData}
              categoryRenameDraft={categoryRenameDraft}
              setCategoryRenameDraft={setCategoryRenameDraft}
              removeSkillCategory={removeSkillCategory}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <button type="button" className="admin-btn secondary admin-add-category" onClick={addSkillCategory}>
        + Add category
      </button>
    </div>
  );
}

/* ─── Projects panel ──────────────────────────────────────── */

function ProjectsPanel({
  data,
  setData,
  addProject,
  removeProject,
}: {
  data: PortfolioData;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  addProject: () => void;
  removeProject: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const projectIds = data.projects.map((p) => p.id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setData((prev) => {
      const oldIndex = prev.projects.findIndex((p) => p.id === active.id);
      const newIndex = prev.projects.findIndex((p) => p.id === over.id);
      const next = { ...prev, projects: arrayMove(prev.projects, oldIndex, newIndex) };
      setPortfolioData(next);
      return next;
    });
  };

  const activeProject = activeId ? data.projects.find((p) => p.id === activeId) : null;

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">Projects</h2>
          <p className="dash-panel-desc">
            {data.projects.length} project{data.projects.length !== 1 ? 's' : ''} — drag to reorder
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={addProject}>+ Add project</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={projectIds} strategy={rectSortingStrategy}>
          <div className="dash-cards">
            {data.projects.map((project) => (
              <SortableProjectCard
                key={project.id}
                project={project}
                setData={setData}
                removeProject={removeProject}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeProject ? (
            <SortableProjectCard
              project={activeProject}
              setData={setData}
              removeProject={removeProject}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function ExperiencePanel({
  data,
  setData,
  addExperience,
  removeExperience,
}: {
  data: PortfolioData;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  addExperience: () => void;
  removeExperience: (id: string) => void;
}) {
  const updateEntry = (id: string, patch: Partial<ExperienceEntry>) => {
    setData((prev) => {
      const next = { ...prev, experience: prev.experience.map((ex) => ex.id === id ? { ...ex, ...patch } : ex) };
      setPortfolioData(next);
      return next;
    });
  };

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">Experience</h2>
          <p className="dash-panel-desc">{data.experience.length} entr{data.experience.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button type="button" className="admin-btn" onClick={addExperience}>+ Add entry</button>
      </div>

      <div className="dash-cards">
        {data.experience.map((entry) => (
          <div key={entry.id} className="admin-card">
            <div className="admin-card-head">
              <input
                className="admin-input"
                placeholder="Company name"
                value={entry.company}
                onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
              />
              <button type="button" className="admin-btn admin-btn-small danger" onClick={() => removeExperience(entry.id)}>Remove</button>
            </div>

            <div className="dash-two-col">
              <div>
                <label>Role / title</label>
                <input
                  className="admin-input"
                  placeholder="e.g. React Native Developer"
                  value={entry.role}
                  onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                />
              </div>
              <div>
                <label>Period</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Jan 2022 – Present"
                  value={entry.period}
                  onChange={(e) => updateEntry(entry.id, { period: e.target.value })}
                />
              </div>
            </div>

            <label>Highlights</label>
            <ChipList
              items={entry.highlights}
              splitCommaSeparated={false}
              placeholder="Add a highlight and press Enter…"
              onAdd={(values) => {
                setData((prev) => {
                  const highlights = [...(prev.experience.find((ex) => ex.id === entry.id)?.highlights ?? []), ...values];
                  const next = { ...prev, experience: prev.experience.map((ex) => ex.id === entry.id ? { ...ex, highlights } : ex) };
                  setPortfolioData(next);
                  return next;
                });
              }}
              onRemove={(index) => {
                setData((prev) => {
                  const highlights = (prev.experience.find((ex) => ex.id === entry.id)?.highlights ?? []).filter((_, i) => i !== index);
                  const next = { ...prev, experience: prev.experience.map((ex) => ex.id === entry.id ? { ...ex, highlights } : ex) };
                  setPortfolioData(next);
                  return next;
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPanel({
  data,
  update,
}: {
  data: PortfolioData;
  update: (u: Partial<PortfolioData>) => void;
}) {
  return (
    <div className="dash-panel">
      <h2 className="dash-panel-title">Contact</h2>
      <p className="dash-panel-desc">Links shown in the Contact section and footer.</p>

      <div className="dash-field-group">
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-email">Email address</label>
          <input id="d-email" className="admin-input" type="email" value={data.contact.email} onChange={(e) => update({ contact: { ...data.contact, email: e.target.value } })} />
        </div>
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-github">GitHub URL</label>
          <input id="d-github" className="admin-input" type="url" placeholder="https://github.com/…" value={data.contact.github} onChange={(e) => update({ contact: { ...data.contact, github: e.target.value } })} />
        </div>
        <div className="dash-field">
          <label className="dash-label" htmlFor="d-linkedin">LinkedIn URL</label>
          <input id="d-linkedin" className="admin-input" type="url" placeholder="https://linkedin.com/in/…" value={data.contact.linkedin} onChange={(e) => update({ contact: { ...data.contact, linkedin: e.target.value } })} />
        </div>
      </div>
    </div>
  );
}

/* ─── main dashboard ──────────────────────────────────────── */

function DashboardInner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [data, setData] = useState<PortfolioData>(getPortfolioData);
  const dataRef = useRef(data);
  dataRef.current = data;
  const [categoryRenameDraft, setCategoryRenameDraft] = useState<Record<string, string>>({});
  const apiSecret = getPortfolioApiSecret() ?? '';
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { getPortfolioDataAsync().then(setData); }, []);

  useEffect(() => {
    if (apiSecret.trim()) setPortfolioApiSecret(apiSecret);
    else setPortfolioApiSecret('');
  }, [apiSecret]);

  const update = useCallback((updates: Partial<PortfolioData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      setPortfolioData(next).then(setLastSync);
      return next;
    });
  }, []);

  const saveToCloud = useCallback(async () => {
    setSyncing(true); setLastSync(null);
    const result = await setPortfolioData(dataRef.current);
    setLastSync(result); setSyncing(false);
  }, []);

  const loadFromCloud = useCallback(async () => {
    setSyncing(true); setLastSync(null);
    try {
      const cloud = await getPortfolioDataAsync();
      setData(cloud); setLastSync({ synced: true });
    } catch {
      setLastSync({ synced: false, error: 'Failed to load' });
    }
    setSyncing(false);
  }, []);

  const addSkillCategory = useCallback(() => {
    const name = prompt('Category name (e.g. Frontend, Backend):')?.trim();
    if (!name) return;
    setData((prev) => {
      if (prev.skills[name]) return prev;
      const next = { ...prev, skills: { ...prev.skills, [name]: [] } };
      setPortfolioData(next);
      return next;
    });
  }, []);

  const removeSkillCategory = useCallback((category: string) => {
    setData((prev) => {
      const { [category]: _, ...rest } = prev.skills;
      const next = { ...prev, skills: rest };
      setPortfolioData(next);
      return next;
    });
  }, []);

  const addProject = useCallback(() => {
    const blank: Project = { id: newId(), title: '', description: '', techStack: [], role: '', image: '', link: '', playStoreLink: '' };
    setData((prev) => { const next = { ...prev, projects: [blank, ...prev.projects] }; setPortfolioData(next); return next; });
  }, []);

  const removeProject = useCallback((id: string) => {
    if (!confirm('Remove this project?')) return;
    setData((prev) => { const next = { ...prev, projects: prev.projects.filter((p) => p.id !== id) }; setPortfolioData(next); return next; });
  }, []);

  const addExperience = useCallback(() => {
    const blank: ExperienceEntry = { id: newId(), company: '', role: '', period: '', highlights: [] };
    setData((prev) => { const next = { ...prev, experience: [blank, ...prev.experience] }; setPortfolioData(next); return next; });
  }, []);

  const removeExperience = useCallback((id: string) => {
    if (!confirm('Remove this experience entry?')) return;
    setData((prev) => { const next = { ...prev, experience: prev.experience.filter((ex) => ex.id !== id) }; setPortfolioData(next); return next; });
  }, []);

  return (
    <div className="dash-layout">
      {/* Top header */}
      <header className="dash-header">
        <span className="dash-logo">Portfolio Admin</span>
        <div className="dash-header-actions">
          {lastSync && (
            <span className={`dash-sync-badge ${lastSync.synced ? 'success' : 'error'}`}>
              {lastSync.synced ? '✓ Saved' : '✗ Error'}
            </span>
          )}
          <button type="button" className="admin-btn secondary admin-btn-small" onClick={() => exportPortfolioJson(data)}>
            Export JSON
          </button>
          <button type="button" className="admin-btn admin-btn-small" onClick={() => { setAdmin(false); navigate('/admin', { replace: true }); }}>
            Logout
          </button>
        </div>
      </header>

      {/* Tab strip */}
      <div className="dash-tabs-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`dash-tab${activeTab === tab.id ? ' dash-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="dash-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'sync' && (
              <SyncPanel
                apiSecret={apiSecret}
                syncing={syncing}
                lastSync={lastSync}
                onSaveToCloud={saveToCloud}
                onLoadFromCloud={loadFromCloud}
              />
            )}
            {activeTab === 'hero' && <HeroPanel data={data} update={update} />}
            {activeTab === 'skills' && (
              <SkillsPanel
                data={data}
                setData={setData}
                categoryRenameDraft={categoryRenameDraft}
                setCategoryRenameDraft={setCategoryRenameDraft}
                addSkillCategory={addSkillCategory}
                removeSkillCategory={removeSkillCategory}
              />
            )}
            {activeTab === 'projects' && (
              <ProjectsPanel
                data={data}
                setData={setData}
                addProject={addProject}
                removeProject={removeProject}
              />
            )}
            {activeTab === 'experience' && (
              <ExperiencePanel
                data={data}
                setData={setData}
                addExperience={addExperience}
                removeExperience={removeExperience}
              />
            )}
            {activeTab === 'contact' && <ContactPanel data={data} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}
