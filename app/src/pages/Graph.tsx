import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GraphNode, GraphEdge, GraphMode, GraphFilters, NodeType, Book as GraphBook, Tag as GraphTag } from './graph/types';
import {
  COLORS,
  NODE_COLORS,
  NODE_RADIUS,
  MODE_LABELS,
  NODE_TYPE_LABELS,
} from './graph/types';
import ForceGraph from './graph/ForceGraph';
import DetailPanel from './graph/DetailPanel';
import { getBooks, getTags, getCharacters, initializeData } from '@/lib/storage';

// ── Empty State SVG ──
function EmptyGraphState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Floating node illustration */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          {/* Central node */}
          <circle cx="80" cy="80" r="20" fill={COLORS.accentMorandi} fillOpacity="0.15" />
          <circle cx="80" cy="80" r="12" fill={COLORS.accentMorandi} fillOpacity="0.3" />
          <circle cx="80" cy="80" r="6" fill={COLORS.accentMorandi} />
          {/* Dotted connection lines */}
          <line x1="80" y1="40" x2="80" y2="60" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.4" />
          <line x1="80" y1="100" x2="80" y2="120" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.4" />
          <line x1="40" y1="80" x2="60" y2="80" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.4" />
          <line x1="100" y1="80" x2="120" y2="80" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.4" />
          {/* Peripheral nodes */}
          <circle cx="80" cy="30" r="5" fill={COLORS.accentHaze} fillOpacity="0.4" />
          <circle cx="80" cy="130" r="5" fill={COLORS.accentWarm} fillOpacity="0.4" />
          <circle cx="30" cy="80" r="5" fill={COLORS.accentHaze} fillOpacity="0.4" />
          <circle cx="130" cy="80" r="5" fill={COLORS.accentWarm} fillOpacity="0.4" />
          {/* Diagonal connections */}
          <line x1="55" y1="55" x2="68" y2="68" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.3" />
          <line x1="105" y1="55" x2="92" y2="68" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.3" />
          <circle cx="45" cy="45" r="3" fill={COLORS.accentMorandi} fillOpacity="0.25" />
          <circle cx="115" cy="45" r="3" fill={COLORS.accentMorandi} fillOpacity="0.25" />
        </svg>
      </motion.div>

      <h3
        className="mt-6 text-lg font-semibold"
        style={{ color: COLORS.textPrimary, fontFamily: 'LXGW WenKai, serif' }}
      >
        还没有足够的数据
      </h3>
      <p className="mt-2 text-sm text-center max-w-xs" style={{ color: COLORS.textSecondary }}>
        添加多本书并记录摘录后，图谱将自动展现书籍间的联系
      </p>
      <div className="mt-6 flex gap-3">
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: COLORS.accentMorandi }}
          type="button"
        >
          添加书籍
        </button>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: `${COLORS.accentHaze}15`,
            color: COLORS.accentHaze,
            border: `1px solid ${COLORS.borderSubtle}`,
          }}
          type="button"
        >
          记录摘录
        </button>
      </div>
    </motion.div>
  );
}

// ── Legend Component ──
function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);

  const nodeTypes: { type: NodeType; label: string }[] = [
    { type: 'book', label: NODE_TYPE_LABELS.book },
    { type: 'character', label: NODE_TYPE_LABELS.character },
    { type: 'tag', label: NODE_TYPE_LABELS.tag },
  ];

  const edgeTypes = [
    { style: 'solid', label: '直接关联', color: COLORS.borderSubtle },
    { style: 'dashed', label: '共享概念', color: COLORS.accentHaze },
    { style: 'dotted', label: '角色相似', color: COLORS.accentWarm },
  ];

  return (
    <motion.div
      className="absolute bottom-4 left-4 z-10 rounded-lg overflow-hidden shadow-md"
      style={{
        background: `${COLORS.bgCard}e6`,
        border: `1px solid ${COLORS.borderSubtle}`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-black/5 transition-colors"
        type="button"
      >
        <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
          图例
        </span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke={COLORS.textMuted}
          strokeWidth="1.5"
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M3 5l3 3 3-3" />
        </motion.svg>
      </button>

      {!collapsed && (
        <motion.div
          className="px-3 pb-3 space-y-2"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Node types */}
          <div className="space-y-1.5">
            {nodeTypes.map(({ type, label }) => (
              <div key={type} className="flex items-center gap-2">
                <svg width="12" height="12">
                  <circle cx="6" cy="6" r="5" fill={NODE_COLORS[type]} />
                </svg>
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.borderSubtle}` }} className="pt-1.5 space-y-1.5">
            {edgeTypes.map(({ style, label, color }) => (
              <div key={style} className="flex items-center gap-2">
                <svg width="20" height="4">
                  <line
                    x1="0"
                    y1="2"
                    x2="20"
                    y2="2"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray={
                      style === 'dashed' ? '5,3' : style === 'dotted' ? '2,2' : 'none'
                    }
                  />
                </svg>
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Filter Bar ──
function FilterBar({
  filters,
  onChange,
}: {
  filters: GraphFilters;
  onChange: (f: GraphFilters) => void;
}) {
  const [localQuery, setLocalQuery] = useState(filters.searchQuery);

  const handleSearch = (val: string) => {
    setLocalQuery(val);
    // Debounce
    const timeout = setTimeout(() => {
      onChange({ ...filters, searchQuery: val });
    }, 200);
    return () => clearTimeout(timeout);
  };

  const toggleNodeType = (type: NodeType) => {
    const current = filters.nodeTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...filters, nodeTypes: next });
  };

  const allActive = filters.nodeTypes.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke={COLORS.textMuted}
          strokeWidth="1.5"
        >
          <circle cx="6" cy="6" r="4.5" />
          <line x1="9.5" y1="9.5" x2="13" y2="13" />
        </svg>
        <input
          type="text"
          placeholder="搜索节点..."
          value={localQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all focus:ring-2"
          style={{
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.borderSubtle}`,
            color: COLORS.textPrimary,
            width: 140,
          }}
        />
      </div>

      <div className="w-px h-5" style={{ background: COLORS.borderSubtle }} />

      {/* Node type filters */}
      <div className="flex gap-1">
        {(['all', 'book', 'tag', 'character'] as const).map((key) => {
          const isAll = key === 'all';
          const isActive = isAll ? allActive : filters.nodeTypes.includes(key);
          return (
            <button
              key={key}
              onClick={() => {
                if (isAll) {
                  onChange({ ...filters, nodeTypes: [] });
                } else {
                  toggleNodeType(key);
                }
              }}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={
                isActive
                  ? {
                      background: COLORS.accentMorandi,
                      color: 'white',
                    }
                  : {
                      background: COLORS.bgCard,
                      color: COLORS.textSecondary,
                      border: `1px solid ${COLORS.borderSubtle}`,
                    }
              }
              type="button"
            >
              {isAll ? '全部' : NODE_TYPE_LABELS[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Graph Page ──
export default function Graph() {
  useEffect(() => { initializeData(); }, []);

  const [mode, setMode] = useState<GraphMode>('knowledge');
  const [filters, setFilters] = useState<GraphFilters>({ nodeTypes: [], searchQuery: '' });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Load data from localStorage only (no mock fallback)
  const { books: graphBooks, tags: graphTags, characters: localCharacters } = useMemo(() => {
    const storedBooks = getBooks();
    const storedTags = getTags();
    const storedCharacters = getCharacters();

    const books: GraphBook[] = storedBooks.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      cover: b.cover,
      status: b.status,
      rating: b.rating,
      tags: b.tags,
      progress: b.progress,
      description: b.description,
    }));

    const tags: GraphTag[] = storedTags.map((t) => ({ id: t.id, name: t.name }));

    // Convert localStorage characters to graph format
    const characters = storedCharacters.map((c) => ({
      id: c.id,
      name: c.name,
      bookId: c.bookIds[0] || '',
      bookTitle: storedBooks.find(b => b.id === c.bookIds[0])?.title || '',
      description: c.description,
      importance: 'major' as const,
      relations: [],
    }));

    return { books, tags, characters };
  }, []);

  // Build graph data
  const { nodes, edges } = useMemo(() => {
    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];

    if (mode === 'character') {
      // Character graph: book at center + its characters orbiting
      // Use first book as default center
      if (graphBooks.length === 0) return { nodes: graphNodes, edges: graphEdges };
      const centerBook = graphBooks[0];

      // Book node (center)
      graphNodes.push({
        id: centerBook.id,
        type: 'book',
        label: centerBook.title,
        radius: 42,
        color: NODE_COLORS.book,
        data: centerBook,
      });

      // Character nodes for this book (from localStorage)
      const bookChars = localCharacters.filter((c) => c.bookId === centerBook.id);
      bookChars.forEach((char, idx) => {
        const node: GraphNode = {
          id: char.id,
          type: 'character',
          label: char.name,
          radius: char.importance === 'major' ? 26 : 20,
          color: NODE_COLORS.character,
          data: char,
        };
        // Position characters in a rough circle around center
        const angle = (idx / Math.max(bookChars.length, 1)) * Math.PI * 2;
        const dist = 180;
        node.x = 400 + Math.cos(angle) * dist;
        node.y = 300 + Math.sin(angle) * dist;
        graphNodes.push(node);

        // Edge: book → character
        graphEdges.push({
          id: `edge-${centerBook.id}-${char.id}`,
          source: centerBook.id,
          target: char.id,
          type: 'book_character',
        });
      });

      // Character-character relations (localStorage characters don't have relations, so skip)
    } else {
      // Knowledge graph: books + tags + cross-book connections
      // Book nodes
      graphBooks.forEach((book) => {
        graphNodes.push({
          id: book.id,
          type: 'book',
          label: book.title,
          radius: NODE_RADIUS.book,
          color: NODE_COLORS.book,
          data: book,
        });
      });

      // Tag nodes
      graphTags.forEach((tag) => {
        graphNodes.push({
          id: tag.id,
          type: 'tag',
          label: tag.name,
          radius: NODE_RADIUS.tag,
          color: NODE_COLORS.tag,
          data: tag,
        });
      });

      // Character nodes (from localStorage, major characters only, limited)
      const majorChars = localCharacters.filter((c) => c.importance === 'major').slice(0, 12);
      majorChars.forEach((char) => {
        graphNodes.push({
          id: char.id,
          type: 'character',
          label: char.name,
          radius: NODE_RADIUS.character,
          color: NODE_COLORS.character,
          data: char,
        });
      });

      // Edges: book → tag (book has tag)
      graphBooks.forEach((book) => {
        book.tags.forEach((tagName) => {
          const tag = graphTags.find((t) => t.name === tagName);
          if (tag) {
            graphEdges.push({
              id: `edge-${book.id}-${tag.id}`,
              source: book.id,
              target: tag.id,
              type: 'book_tag',
            });
          }
        });
      });

      // Edges: book → character
      majorChars.forEach((char) => {
        if (char.bookId) {
          graphEdges.push({
            id: `edge-bookchar-${char.bookId}-${char.id}`,
            source: char.bookId,
            target: char.id,
            type: 'book_character',
          });
        }
      });

      // Edges: book → book (share 2+ tags)
      for (let i = 0; i < graphBooks.length; i++) {
        for (let j = i + 1; j < graphBooks.length; j++) {
          const b1 = graphBooks[i];
          const b2 = graphBooks[j];
          const shared = b1.tags.filter((t) => b2.tags.includes(t));
          if (shared.length >= 2) {
            graphEdges.push({
              id: `edge-bookbook-${b1.id}-${b2.id}`,
              source: b1.id,
              target: b2.id,
              type: 'book_book',
              label: `${shared.length}个共享概念`,
            });
          }
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges };
  }, [mode, graphBooks, graphTags]);

  // Check if we have data
  const hasData = graphBooks.length > 0;

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]" style={{ background: COLORS.bgCream }}>
      {/* Header */}
      <motion.div
        className="px-6 pt-6 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: COLORS.textPrimary, fontFamily: 'LXGW WenKai, serif' }}
          >
            共鸣图谱
          </h1>
          <p className="text-sm mt-0.5" style={{ color: COLORS.textSecondary }}>
            看见书籍之间的隐秘联系
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className="inline-flex rounded-full p-1 gap-0.5"
          style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.borderSubtle}` }}
        >
          {(['character', 'knowledge'] as GraphMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSelectedNode(null);
              }}
              className="relative px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
              style={{
                color: mode === m ? 'white' : COLORS.textSecondary,
              }}
              type="button"
            >
              {mode === m && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: COLORS.accentMorandi }}
                  layoutId="graphModePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{MODE_LABELS[m]}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filter Bar */}
      {hasData && (
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <FilterBar filters={filters} onChange={setFilters} />
        </motion.div>
      )}

      {/* Graph Canvas */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {hasData ? (
          <>
            <ForceGraph
              nodes={nodes}
              edges={edges}
              mode={mode}
              filters={filters}
              selectedNodeId={selectedNode?.id || null}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
            />
            <GraphLegend />
          </>
        ) : (
          <EmptyGraphState />
        )}
      </div>

      {/* Hover tooltip */}
      {hoveredNode && !selectedNode && (
        <div
          className="fixed z-30 pointer-events-none px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium"
          style={{
            background: COLORS.textPrimary,
            color: 'white',
            left: '50%',
            bottom: 80,
            transform: 'translateX(-50%)',
          }}
        >
          {hoveredNode.label}
          <span className="ml-1.5 opacity-60">
            {hoveredNode.type === 'book' ? '书籍' : hoveredNode.type === 'character' ? '角色' : '标签'}
          </span>
        </div>
      )}

      {/* Detail Panel */}
      <DetailPanel
        node={selectedNode}
        onClose={handleClosePanel}
        allNodes={nodes}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}
