'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, Building2, BookOpen, GraduationCap, X } from 'lucide-react';

interface Filiere {
  id: string;
  nameFr: string;
  nameAr: string | null;
}

interface Establishment {
  id: string;
  nameFr: string;
  nameAr: string | null;
  filieres: Filiere[];
}

interface University {
  id: string;
  nameFr: string;
  nameAr: string | null;
  establishments: Establishment[];
}

interface Props {
  universities: University[];
  locale: string;
}

export default function FormationsExplorer({ universities, locale }: Props) {
  const isFr = locale === 'fr';
  const [search, setSearch] = useState('');
  const [expandedUnis, setExpandedUnis] = useState<Set<string>>(new Set());
  const [expandedEtabs, setExpandedEtabs] = useState<Set<string>>(new Set());

  const query = search.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!query) return universities;
    return universities
      .map(u => {
        const uMatch = u.nameFr.toLowerCase().includes(query) || u.nameAr?.toLowerCase().includes(query);
        const filteredEstabs = u.establishments
          .map(e => {
            const eMatch = e.nameFr.toLowerCase().includes(query) || e.nameAr?.toLowerCase().includes(query);
            const filteredFil = e.filieres.filter(f =>
              f.nameFr.toLowerCase().includes(query) || f.nameAr?.toLowerCase().includes(query)
            );
            if (uMatch || eMatch || filteredFil.length > 0) {
              return { ...e, filieres: uMatch || eMatch ? e.filieres : filteredFil };
            }
            return null;
          })
          .filter(Boolean) as Establishment[];
        if (uMatch || filteredEstabs.length > 0) {
          return { ...u, establishments: uMatch ? u.establishments : filteredEstabs };
        }
        return null;
      })
      .filter(Boolean) as University[];
  }, [query, universities]);

  // Auto-expand when searching
  const autoExpand = query.length > 0;

  function toggleUni(id: string) {
    const next = new Set(expandedUnis);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedUnis(next);
  }

  function toggleEtab(id: string) {
    const next = new Set(expandedEtabs);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedEtabs(next);
  }

  function isUniExpanded(id: string) { return autoExpand || expandedUnis.has(id); }
  function isEtabExpanded(id: string) { return autoExpand || expandedEtabs.has(id); }

  const highlight = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isFr ? 'Rechercher une université, établissement ou filière...' : 'Search university, establishment or program...'}
          className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
          style={{ '--tw-ring-color': '#233691' } as React.CSSProperties}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">{isFr ? 'Aucun résultat trouvé' : 'No results found'}</p>
          <p className="text-sm mt-1">{isFr ? 'Essayez un autre terme de recherche.' : 'Try a different search term.'}</p>
        </div>
      )}

      {/* University cards */}
      <div className="space-y-3">
        {filtered.map(uni => {
          const expanded = isUniExpanded(uni.id);
          return (
            <div key={uni.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* University header */}
              <button
                onClick={() => !autoExpand && toggleUni(uni.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/70 transition-colors"
              >
                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(35,54,145,0.08)' }}>
                  <GraduationCap className="h-5 w-5" style={{ color: '#233691' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base leading-snug">
                    {highlight(uni.nameFr)}
                  </h3>
                  {uni.nameAr && (
                    <p className="text-sm text-gray-400 mt-0.5" dir="rtl">{uni.nameAr}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {uni.establishments.length} {isFr ? 'établissements' : 'establishments'}
                  </span>
                  {autoExpand
                    ? <ChevronDown className="h-5 w-5 text-gray-400" />
                    : expanded
                      ? <ChevronDown className="h-5 w-5 text-gray-400" />
                      : <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </button>

              {/* Establishments */}
              {expanded && (
                <div className="border-t border-gray-100">
                  {uni.establishments.map((etab, etabIdx) => {
                    const etabExpanded = isEtabExpanded(etab.id);
                    return (
                      <div key={etab.id} className={etabIdx > 0 ? 'border-t border-gray-50' : ''}>
                        <button
                          onClick={() => !autoExpand && toggleEtab(etab.id)}
                          className="w-full flex items-center gap-3 pl-8 pr-5 py-3 text-left hover:bg-gray-50/70 transition-colors"
                        >
                          <Building2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800">
                              {highlight(etab.nameFr)}
                            </span>
                            {etab.nameAr && (
                              <span className="ml-2 text-xs text-gray-400" dir="rtl">{etab.nameAr}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="hidden sm:inline text-xs text-gray-400">
                              {etab.filieres.length} {isFr ? 'filières' : 'programs'}
                            </span>
                            {autoExpand
                              ? <ChevronDown className="h-4 w-4 text-gray-300" />
                              : etabExpanded
                                ? <ChevronDown className="h-4 w-4 text-gray-300" />
                                : <ChevronRight className="h-4 w-4 text-gray-300" />
                            }
                          </div>
                        </button>

                        {/* Filières */}
                        {etabExpanded && etab.filieres.length > 0 && (
                          <div className="pl-14 pr-5 pb-4 pt-2 border-t border-gray-50 flex flex-wrap gap-2">
                            {etab.filieres.map(fil => (
                              <span
                                key={fil.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                              >
                                <BookOpen className="h-3 w-3 opacity-60" />
                                {highlight(fil.nameFr)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
