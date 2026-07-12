import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphNode, Book, Character, Tag } from './types';
import { COLORS } from './types';

interface DetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
  allNodes: GraphNode[];
  onNodeClick: (node: GraphNode) => void;
}

function BookDetail({ book, allNodes, onNodeClick }: { book: Book; allNodes: GraphNode[]; onNodeClick: (node: GraphNode) => void }) {
  const relatedChars = allNodes.filter(
    (n) => n.type === 'character' && (n.data as Character).bookId === book.id
  );
  const relatedTags = allNodes.filter(
    (n) => n.type === 'tag' && book.tags.includes((n.data as Tag).name)
  );

  return (
    <div className="space-y-5">
      {/* Cover placeholder */}
      <div
        className="w-20 h-28 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-md"
        style={{ background: COLORS.accentMorandi }}
      >
        B
      </div>

      <div>
        <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary, fontFamily: 'LXGW WenKai, serif' }}>
          {book.title}
        </h3>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          {book.author}
        </p>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className="px-2.5 py-1 rounded-md text-xs font-medium"
          style={{
            background: book.status === 'prelude' ? `${COLORS.accentHaze}18` : book.status === 'andante' ? `${COLORS.accentMorandi}18` : `${COLORS.accentMorandi}18`,
            color: book.status === 'prelude' ? COLORS.accentHaze : COLORS.accentMorandi,
          }}
        >
          {book.status === 'prelude' ? 'Prelude' : book.status === 'andante' ? 'Andante' : 'Finale'}
        </span>
        {book.rating > 0 && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill={i < book.rating ? COLORS.accentWarm : COLORS.borderSubtle}>
                <path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8l-4.2 2.2.8-4.7L1.2 6l4.7-.7z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
        {book.description}
      </p>

      {/* Progress */}
      {book.progress > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: COLORS.textMuted }}>
            <span>阅读进度</span>
            <span>{book.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.borderSubtle }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: COLORS.accentMorandi }}
              initial={{ width: 0 }}
              animate={{ width: `${book.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {book.tags.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            标签
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  background: `${COLORS.accentHaze}18`,
                  color: COLORS.accentHaze,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Characters */}
      {relatedChars.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            角色 ({relatedChars.length})
          </h4>
          <div className="space-y-2">
            {relatedChars.map((charNode) => {
              const char = charNode.data as Character;
              return (
                <button
                  key={charNode.id}
                  onClick={() => onNodeClick(charNode)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: COLORS.accentWarm }}
                  >
                    {char.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: COLORS.textPrimary }}>
                      {char.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: COLORS.textMuted }}>
                      {char.importance === 'major' ? '主要角色' : '次要角色'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Tags as knowledge links */}
      {relatedTags.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            关联概念
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {relatedTags.map((tagNode) => {
              const tag = tagNode.data as Tag;
              return (
                <button
                  key={tagNode.id}
                  onClick={() => onNodeClick(tagNode)}
                  className="px-2.5 py-1 rounded-md text-xs hover:opacity-80 transition-opacity"
                  style={{
                    background: `${COLORS.accentHaze}15`,
                    color: COLORS.accentHaze,
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CharacterDetail({ character, allNodes, onNodeClick }: { character: Character; allNodes: GraphNode[]; onNodeClick: (node: GraphNode) => void }) {
  const bookNode = allNodes.find(
    (n) => n.type === 'book' && (n.data as Book).id === character.bookId
  );

  const relatedCharIds = new Set(
    (character.relations || []).map((r) => r.characterId)
  );
  const relatedChars = allNodes.filter(
    (n) => n.type === 'character' && relatedCharIds.has(n.id)
  );

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
        style={{ background: COLORS.accentWarm }}
      >
        {character.name.charAt(0)}
      </div>

      <div>
        <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary, fontFamily: 'LXGW WenKai, serif' }}>
          {character.name}
        </h3>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          {character.bookTitle}
        </p>
      </div>

      {/* Importance badge */}
      <div>
        <span
          className="px-2.5 py-1 rounded-md text-xs font-medium"
          style={{
            background: `${COLORS.accentWarm}18`,
            color: COLORS.accentWarm,
          }}
        >
          {character.importance === 'major' ? '主要角色' : '次要角色'}
        </span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
        {character.description}
      </p>

      {/* Book link */}
      {bookNode && (
        <div>
          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            出处
          </h4>
          <button
            onClick={() => onNodeClick(bookNode)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors text-left"
          >
            <div
              className="w-8 h-10 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: COLORS.accentMorandi }}
            >
              B
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: COLORS.textPrimary }}>
                {(bookNode.data as Book).title}
              </p>
              <p className="text-xs truncate" style={{ color: COLORS.textMuted }}>
                {(bookNode.data as Book).author}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Relations */}
      {relatedChars.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            关系 ({relatedChars.length})
          </h4>
          <div className="space-y-2">
            {relatedChars.map((charNode) => {
              const char = charNode.data as Character;
              const relation = character.relations?.find((r) => r.characterId === charNode.id);
              return (
                <button
                  key={charNode.id}
                  onClick={() => onNodeClick(charNode)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: COLORS.accentWarm }}
                  >
                    {char.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: COLORS.textPrimary }}>
                      {char.name}
                    </p>
                    {relation && (
                      <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: COLORS.borderSubtle }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${relation.strength * 100}%`,
                            background: COLORS.accentWarm,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TagDetail({ tag, allNodes, onNodeClick }: { tag: Tag; allNodes: GraphNode[]; onNodeClick: (node: GraphNode) => void }) {
  const relatedBooks = allNodes.filter(
    (n) => n.type === 'book' && (n.data as Book).tags.includes(tag.name)
  );

  return (
    <div className="space-y-5">
      {/* Tag icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
        style={{ background: COLORS.accentHaze }}
      >
        #
      </div>

      <div>
        <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary, fontFamily: 'LXGW WenKai, serif' }}>
          {tag.name}
        </h3>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          概念/标签
        </p>
      </div>

      {/* Connected books */}
      {relatedBooks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            相关书籍 ({relatedBooks.length})
          </h4>
          <div className="space-y-2">
            {relatedBooks.map((bookNode) => {
              const book = bookNode.data as Book;
              return (
                <button
                  key={bookNode.id}
                  onClick={() => onNodeClick(bookNode)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors text-left"
                >
                  <div
                    className="w-8 h-10 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: COLORS.accentMorandi }}
                  >
                    B
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: COLORS.textPrimary }}>
                      {book.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: COLORS.textMuted }}>
                      {book.author}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailPanel({ node, onClose, allNodes, onNodeClick }: DetailPanelProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(44,44,44,0.2)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto shadow-2xl"
            style={{
              width: '100%',
              maxWidth: 400,
              background: COLORS.bgCream,
              borderLeft: `1px solid ${COLORS.borderSubtle}`,
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 28,
            }}
          >
            {/* Close button */}
            <div className="sticky top-0 z-10 flex justify-end p-4" style={{ background: COLORS.bgCream }}>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
                style={{ border: `1px solid ${COLORS.borderSubtle}` }}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={COLORS.textSecondary} strokeWidth="2">
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {node.type === 'book' && (
                <BookDetail book={node.data as Book} allNodes={allNodes} onNodeClick={onNodeClick} />
              )}
              {node.type === 'character' && (
                <CharacterDetail character={node.data as unknown as Character} allNodes={allNodes} onNodeClick={onNodeClick} />
              )}
              {node.type === 'tag' && (
                <TagDetail tag={node.data as Tag} allNodes={allNodes} onNodeClick={onNodeClick} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
