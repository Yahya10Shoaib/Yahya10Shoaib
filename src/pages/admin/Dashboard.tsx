import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProtectedRoute, setAdmin } from '../../routes/ProtectedRoute';
import { getPortfolioData, getPortfolioDataAsync, setPortfolioData, exportPortfolioJson, getPortfolioApiSecret, setPortfolioApiSecret, type SyncResult } from '../../utils/portfolioStore';
import type { PortfolioData, Project, ExperienceEntry } from '../../types/portfolio';

function newId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ChipList({
  items,
  onAdd,
  onRemove,
  placeholder = 'Add item…',
}: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const v = input.trim();
      if (v) {
        onAdd(v);
        setInput('');
      }
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
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="admin-chip-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function DashboardInner() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioData>(getPortfolioData);
  const [categoryRenameDraft, setCategoryRenameDraft] = useState<Record<string, string>>({});
  const [apiSecret, setApiSecret] = useState(getPortfolioApiSecret() ?? '');
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getPortfolioDataAsync().then(setData);
  }, []);

  useEffect(() => {
    if (apiSecret.trim()) setPortfolioApiSecret(apiSecret);
    else setPortfolioApiSecret('');
  }, [apiSecret]);

  const saveToCloud = useCallback(async () => {
    setSyncing(true);
    setLastSync(null);
    const result = await setPortfolioData(data);
    setLastSync(result);
    setSyncing(false);
  }, [data]);

  const loadFromCloud = useCallback(async () => {
    setSyncing(true);
    setLastSync(null);
    try {
      const cloud = await getPortfolioDataAsync();
      setData(cloud);
      setLastSync({ synced: true });
    } catch {
      setLastSync({ synced: false, error: 'Failed to load' });
    }
    setSyncing(false);
  }, []);

  const update = useCallback((updates: Partial<PortfolioData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      setPortfolioData(next).then(setLastSync);
      return next;
    });
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
    const blank: Project = {
      id: newId(),
      title: '',
      description: '',
      techStack: [],
      role: '',
      image: '',
      link: '',
    };
    setData((prev) => {
      const next = { ...prev, projects: [blank, ...prev.projects] };
      setPortfolioData(next);
      return next;
    });
  }, []);

  const removeProject = useCallback((id: string) => {
    if (!confirm('Remove this project?')) return;
    setData((prev) => {
      const next = { ...prev, projects: prev.projects.filter((p) => p.id !== id) };
      setPortfolioData(next);
      return next;
    });
  }, []);

  const addExperience = useCallback(() => {
    const blank: ExperienceEntry = {
      id: newId(),
      company: '',
      role: '',
      period: '',
      highlights: [],
    };
    setData((prev) => {
      const next = { ...prev, experience: [blank, ...prev.experience] };
      setPortfolioData(next);
      return next;
    });
  }, []);

  const removeExperience = useCallback((id: string) => {
    if (!confirm('Remove this experience entry?')) return;
    setData((prev) => {
      const next = { ...prev, experience: prev.experience.filter((ex) => ex.id !== id) };
      setPortfolioData(next);
      return next;
    });
  }, []);

  const handleExport = () => exportPortfolioJson(data);

  const handleLogout = () => {
    setAdmin(false);
    navigate('/admin', { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Portfolio Admin</h1>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn secondary" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="admin-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <motion.main
        className="admin-sections"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <section className="admin-section cyber-border admin-sync-section">
          <h2>Cloud sync</h2>
          <p className="admin-hint">Set the same value as <code>PORTFOLIO_API_SECRET</code> in Vercel. Create a Blob store in Vercel (Storage) and redeploy after adding env vars.</p>
          <label>API secret</label>
          <input
            className="admin-input"
            type="password"
            autoComplete="off"
            placeholder="Same as Vercel env PORTFOLIO_API_SECRET"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
          />
          <div className="admin-sync-actions">
            <button type="button" className="admin-btn" onClick={saveToCloud} disabled={!apiSecret.trim() || syncing}>
              {syncing ? '…' : 'Save to cloud now'}
            </button>
            <button type="button" className="admin-btn secondary" onClick={loadFromCloud} disabled={syncing}>
              Load from cloud
            </button>
          </div>
          {lastSync && (
            <p className={`admin-sync-status ${lastSync.synced ? 'success' : 'error'}`}>
              {lastSync.synced ? '✓ Synced to cloud' : `✗ ${lastSync.error ?? 'Sync failed'}`}
            </p>
          )}
        </section>

        <section className="admin-section cyber-border">
          <h2>Hero</h2>
          <label>Name</label>
          <input
            className="admin-input"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <label>Title</label>
          <input
            className="admin-input"
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
          />
          <label>Experience label</label>
          <input
            className="admin-input"
            value={data.experienceYears}
            onChange={(e) => update({ experienceYears: e.target.value })}
          />
          <label>Intro</label>
          <textarea
            className="admin-input admin-textarea"
            value={data.intro}
            onChange={(e) => update({ intro: e.target.value })}
            rows={4}
          />
        </section>

        <section className="admin-section cyber-border">
          <h2>Skills</h2>
          <p className="admin-hint">Add categories, then add skills as chips. Press Enter or comma to add.</p>
          {Object.entries(data.skills).map(([category, skills]) => (
            <div key={category} className="admin-skill-category">
              <div className="admin-skill-category-header">
                <input
                  className="admin-input admin-input-inline"
                  value={categoryRenameDraft[category] ?? category}
                  onChange={(e) => setCategoryRenameDraft((prev) => ({ ...prev, [category]: e.target.value }))}
                  onBlur={() => {
                    const newName = (categoryRenameDraft[category] ?? category).trim();
                    setCategoryRenameDraft((prev) => {
                      const next = { ...prev };
                      delete next[category];
                      return next;
                    });
                    if (newName && newName !== category) {
                      setData((prev) => {
                        const { [category]: list, ...rest } = prev.skills;
                        const next = { ...prev, skills: { ...rest, [newName]: list } };
                        setPortfolioData(next);
                        return next;
                      });
                    }
                  }}
                  placeholder="Category name"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-small danger"
                  onClick={() => removeSkillCategory(category)}
                  aria-label={`Remove category ${category}`}
                >
                  Remove category
                </button>
              </div>
              <ChipList
                items={skills}
                placeholder={`Add skill in ${category}…`}
                onAdd={(value) => {
                  setData((prev) => {
                    const list = [...(prev.skills[category] ?? []), value];
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
          ))}
          <button type="button" className="admin-btn secondary admin-add-category" onClick={addSkillCategory}>
            + Add category
          </button>
        </section>

        <section className="admin-section cyber-border">
          <div className="admin-section-head">
            <h2>Projects</h2>
            <button type="button" className="admin-btn" onClick={addProject}>
              + Add project
            </button>
          </div>
          {data.projects.map((project) => (
            <div key={project.id} className="admin-card">
              <div className="admin-card-head">
                <input
                  className="admin-input"
                  placeholder="Title"
                  value={project.title}
                  onChange={(e) => {
                    setData((prev) => {
                      const next = {
                        ...prev,
                        projects: prev.projects.map((p) =>
                          p.id === project.id ? { ...p, title: e.target.value } : p
                        ),
                      };
                      setPortfolioData(next);
                      return next;
                    });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-small danger"
                  onClick={() => removeProject(project.id)}
                  aria-label="Remove project"
                >
                  Remove
                </button>
              </div>
              <label>Description</label>
              <textarea
                className="admin-input admin-textarea"
                placeholder="Description"
                value={project.description}
                onChange={(e) => {
                  setData((prev) => {
                    const next = {
                      ...prev,
                      projects: prev.projects.map((p) =>
                        p.id === project.id ? { ...p, description: e.target.value } : p
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
                rows={2}
              />
              <label>Tech stack</label>
              <ChipList
                items={project.techStack}
                placeholder="e.g. React, Node…"
                onAdd={(value) => {
                  setData((prev) => {
                    const techStack = [...(prev.projects.find((p) => p.id === project.id)?.techStack ?? []), value];
                    const next = {
                      ...prev,
                      projects: prev.projects.map((p) =>
                        p.id === project.id ? { ...p, techStack } : p
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
                onRemove={(index) => {
                  setData((prev) => {
                    const techStack = (prev.projects.find((p) => p.id === project.id)?.techStack ?? []).filter(
                      (_, i) => i !== index
                    );
                    const next = {
                      ...prev,
                      projects: prev.projects.map((p) =>
                        p.id === project.id ? { ...p, techStack } : p
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
              <label>Role / contribution</label>
              <input
                className="admin-input"
                placeholder="Role / contribution"
                value={project.role}
                onChange={(e) => {
                  setData((prev) => {
                    const next = {
                      ...prev,
                      projects: prev.projects.map((p) =>
                        p.id === project.id ? { ...p, role: e.target.value } : p
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
              <label>Image URL (shown on card flip)</label>
              <input
                className="admin-input"
                type="url"
                placeholder="https://…"
                value={project.image ?? ''}
                onChange={(e) => {
                  setData((prev) => {
                    const next = {
                      ...prev,
                      projects: prev.projects.map((p) =>
                        p.id === project.id ? { ...p, image: e.target.value } : p
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
              <label>Link (Visit button & icon, if available)</label>
              <input
                className="admin-input"
                type="url"
                placeholder="https://…"
                value={project.link ?? ''}
                onChange={(e) => {
                  setData((prev) => {
                    const next = {
                      ...prev,
                      projects: prev.projects.map((p) =>
                        p.id === project.id ? { ...p, link: e.target.value } : p
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
            </div>
          ))}
        </section>

        <section className="admin-section cyber-border">
          <div className="admin-section-head">
            <h2>Experience</h2>
            <button type="button" className="admin-btn" onClick={addExperience}>
              + Add experience
            </button>
          </div>
          {data.experience.map((entry) => (
            <div key={entry.id} className="admin-card">
              <div className="admin-card-head">
                <input
                  className="admin-input"
                  placeholder="Company"
                  value={entry.company}
                  onChange={(e) => {
                    setData((prev) => {
                      const next = {
                        ...prev,
                        experience: prev.experience.map((ex) =>
                          ex.id === entry.id ? { ...ex, company: e.target.value } : ex
                        ),
                      };
                      setPortfolioData(next);
                      return next;
                    });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-small danger"
                  onClick={() => removeExperience(entry.id)}
                  aria-label="Remove experience"
                >
                  Remove
                </button>
              </div>
              <label>Role</label>
              <input
                className="admin-input"
                placeholder="Role"
                value={entry.role}
                onChange={(e) => {
                  setData((prev) => {
                    const next = {
                      ...prev,
                      experience: prev.experience.map((ex) =>
                        ex.id === entry.id ? { ...ex, role: e.target.value } : ex
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
              <label>Period</label>
              <input
                className="admin-input"
                placeholder="e.g. Jan 2020 – Present"
                value={entry.period}
                onChange={(e) => {
                  setData((prev) => {
                    const next = {
                      ...prev,
                      experience: prev.experience.map((ex) =>
                        ex.id === entry.id ? { ...ex, period: e.target.value } : ex
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
              <label>Highlights</label>
              <ChipList
                items={entry.highlights}
                placeholder="Add highlight…"
                onAdd={(value) => {
                  setData((prev) => {
                    const highlights = [...(prev.experience.find((ex) => ex.id === entry.id)?.highlights ?? []), value];
                    const next = {
                      ...prev,
                      experience: prev.experience.map((ex) =>
                        ex.id === entry.id ? { ...ex, highlights } : ex
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
                onRemove={(index) => {
                  setData((prev) => {
                    const highlights = (prev.experience.find((ex) => ex.id === entry.id)?.highlights ?? []).filter(
                      (_, i) => i !== index
                    );
                    const next = {
                      ...prev,
                      experience: prev.experience.map((ex) =>
                        ex.id === entry.id ? { ...ex, highlights } : ex
                      ),
                    };
                    setPortfolioData(next);
                    return next;
                  });
                }}
              />
            </div>
          ))}
        </section>

        <section className="admin-section cyber-border">
          <h2>Contact</h2>
          <label>Email</label>
          <input
            className="admin-input"
            type="email"
            value={data.contact.email}
            onChange={(e) => update({ contact: { ...data.contact, email: e.target.value } })}
          />
          <label>GitHub URL</label>
          <input
            className="admin-input"
            value={data.contact.github}
            onChange={(e) => update({ contact: { ...data.contact, github: e.target.value } })}
          />
          <label>LinkedIn URL</label>
          <input
            className="admin-input"
            value={data.contact.linkedin}
            onChange={(e) => update({ contact: { ...data.contact, linkedin: e.target.value } })}
          />
        </section>
      </motion.main>
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
