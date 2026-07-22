// Graph-related types and mock data for the Resonance Graph page

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  status: 'prelude' | 'andante' | 'finale';
  rating: number;
  tags: string[];
  progress: number;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  bookId: string;
  bookTitle: string;
  description: string;
  importance: 'major' | 'minor';
  relations?: { characterId: string; strength: number }[];
}

export interface Tag {
  id: string;
  name: string;
}

export type NodeType = 'book' | 'character' | 'tag';
export type GraphMode = 'character' | 'knowledge';
export type EdgeType = 'book_character' | 'book_tag' | 'book_book' | 'character_character';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: NodeType;
  label: string;
  radius: number;
  color: string;
  data: Book | Character | Tag;
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  type: EdgeType;
  strength?: number;
  label?: string;
}

export interface GraphFilters {
  nodeTypes: NodeType[];
  searchQuery: string;
}

// ── Mock Data ──

export const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    status: 'finale',
    rating: 5,
    tags: ['魔幻现实主义', '家族', '孤独', '拉美文学', '史诗'],
    progress: 100,
    description: '布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰。',
  },
  {
    id: 'book-2',
    title: '活着',
    author: '余华',
    status: 'finale',
    rating: 5,
    tags: ['现实主义', '苦难', '生命', '中国历史', '人性'],
    progress: 100,
    description: '福贵一生的悲欢离合，面对亲人相继离世，依然坚韧地活着。',
  },
  {
    id: 'book-3',
    title: '挪威的森林',
    author: '村上春树',
    status: 'finale',
    rating: 4,
    tags: ['爱情', '青春', '孤独', '日本文学', '成长'],
    progress: 100,
    description: '渡边彻在两个女孩——直子和绿子之间的情感纠葛与成长历程。',
  },
  {
    id: 'book-4',
    title: '1984',
    author: '乔治·奥威尔',
    status: 'andante',
    rating: 5,
    tags: ['反乌托邦', '政治', '自由', '科幻', '社会'],
    progress: 65,
    description: '温斯顿·史密斯在极权主义社会中的反抗与觉醒。',
  },
  {
    id: 'book-5',
    title: '小王子',
    author: '圣埃克苏佩里',
    status: 'finale',
    rating: 5,
    tags: ['童话', '爱情', '成长', '哲理', '孤独'],
    progress: 100,
    description: '小王子离开自己的星球，在宇宙中旅行，最终明白什么是真正重要的。',
  },
  {
    id: 'book-6',
    title: '红楼梦',
    author: '曹雪芹',
    status: 'prelude',
    rating: 0,
    tags: ['古典', '家族', '爱情', '中国文学', '史诗'],
    progress: 0,
    description: '贾府由盛转衰的历史，以及贾宝玉与林黛玉、薛宝钗的爱情悲剧。',
  },
  {
    id: 'book-7',
    title: '追风筝的人',
    author: '卡勒德·胡赛尼',
    status: 'finale',
    rating: 4,
    tags: ['友谊', '救赎', '成长', '阿富汗', '人性'],
    progress: 100,
    description: '阿米尔与仆人哈桑之间的友谊与背叛，以及成年后的救赎之旅。',
  },
  {
    id: 'book-8',
    title: '三体',
    author: '刘慈欣',
    status: 'andante',
    rating: 5,
    tags: ['科幻', '宇宙', '文明', '中国社会', '史诗'],
    progress: 45,
    description: '地球文明与三体文明的首次接触，以及人类文明的命运抉择。',
  },
];

export const mockCharacters: Character[] = [
  // 百年孤独
  { id: 'char-1', name: '乌尔苏拉', bookId: 'book-1', bookTitle: '百年孤独', description: '布恩迪亚家族的女家长，活了115到122岁，是家族中道德和理性的支柱。', importance: 'major', relations: [{ characterId: 'char-2', strength: 0.9 }, { characterId: 'char-3', strength: 0.7 }] },
  { id: 'char-2', name: '何塞·阿尔卡蒂奥', bookId: 'book-1', bookTitle: '百年孤独', description: '布恩迪亚家族的创始人，痴迷于科学与炼金术。', importance: 'major', relations: [{ characterId: 'char-1', strength: 0.9 }, { characterId: 'char-4', strength: 0.6 }] },
  { id: 'char-3', name: '奥雷里亚诺上校', bookId: 'book-1', bookTitle: '百年孤独', description: '发动了32次起义全部失败，晚年只做小金鱼。', importance: 'major', relations: [{ characterId: 'char-1', strength: 0.7 }, { characterId: 'char-5', strength: 0.8 }] },
  { id: 'char-4', name: '蕾梅黛丝', bookId: 'book-1', bookTitle: '百年孤独', description: '美得惊人，最终升天而去。', importance: 'minor', relations: [{ characterId: 'char-2', strength: 0.5 }] },
  { id: 'char-5', name: '阿玛兰妲', bookId: 'book-1', bookTitle: '百年孤独', description: '因嫉妒和执念终身未嫁，晚年织寿衣。', importance: 'major', relations: [{ characterId: 'char-3', strength: 0.8 }, { characterId: 'char-1', strength: 0.6 }] },
  // 活着
  { id: 'char-6', name: '福贵', bookId: 'book-2', bookTitle: '活着', description: '从纨绔子弟到贫苦老人，经历了所有亲人的离世。', importance: 'major', relations: [{ characterId: 'char-7', strength: 0.9 }, { characterId: 'char-8', strength: 0.8 }] },
  { id: 'char-7', name: '家珍', bookId: 'book-2', bookTitle: '活着', description: '福贵的妻子，一生任劳任怨，始终不离不弃。', importance: 'major', relations: [{ characterId: 'char-6', strength: 0.9 }, { characterId: 'char-9', strength: 0.7 }] },
  { id: 'char-8', name: '凤霞', bookId: 'book-2', bookTitle: '活着', description: '福贵的女儿，因高烧变成哑巴，后难产而死。', importance: 'major', relations: [{ characterId: 'char-6', strength: 0.8 }, { characterId: 'char-7', strength: 0.7 }] },
  { id: 'char-9', name: '有庆', bookId: 'book-2', bookTitle: '活着', description: '福贵的儿子，因献血过多而死。', importance: 'minor', relations: [{ characterId: 'char-6', strength: 0.8 }, { characterId: 'char-7', strength: 0.7 }] },
  // 挪威的森林
  { id: 'char-10', name: '渡边彻', bookId: 'book-3', bookTitle: '挪威的森林', description: '故事的主人公，在直子和绿子之间摇摆不定。', importance: 'major', relations: [{ characterId: 'char-11', strength: 0.9 }, { characterId: 'char-12', strength: 0.8 }] },
  { id: 'char-11', name: '直子', bookId: 'book-3', bookTitle: '挪威的森林', description: '渡边已故好友木月的女友，内心脆弱，住进疗养院。', importance: 'major', relations: [{ characterId: 'char-10', strength: 0.9 }, { characterId: 'char-13', strength: 0.6 }] },
  { id: 'char-12', name: '绿子', bookId: 'book-3', bookTitle: '挪威的森林', description: '活泼开朗的女孩，对渡边有着热烈的感情。', importance: 'major', relations: [{ characterId: 'char-10', strength: 0.8 }] },
  { id: 'char-13', name: '玲子', bookId: 'book-3', bookTitle: '挪威的森林', description: '直子在疗养院的朋友，曾是钢琴老师。', importance: 'minor', relations: [{ characterId: 'char-11', strength: 0.6 }] },
  // 1984
  { id: 'char-14', name: '温斯顿', bookId: 'book-4', bookTitle: '1984', description: '在真理部工作的外围党员，开始写日记反抗老大哥。', importance: 'major', relations: [{ characterId: 'char-15', strength: 0.9 }, { characterId: 'char-16', strength: 0.5 }] },
  { id: 'char-15', name: '茱莉亚', bookId: 'book-4', bookTitle: '1984', description: '温斯顿的爱人，表面上循规蹈矩，实则暗中反抗。', importance: 'major', relations: [{ characterId: 'char-14', strength: 0.9 }] },
  { id: 'char-16', name: '奥勃良', bookId: 'book-4', bookTitle: '1984', description: '核心党员，看似是反抗者同盟，实则是思想警察。', importance: 'major', relations: [{ characterId: 'char-14', strength: 0.5 }] },
  // 小王子
  { id: 'char-17', name: '小王子', bookId: 'book-5', bookTitle: '小王子', description: '来自B-612小行星的金发男孩，纯真而忧伤。', importance: 'major', relations: [{ characterId: 'char-18', strength: 0.9 }, { characterId: 'char-19', strength: 0.8 }] },
  { id: 'char-18', name: '飞行员', bookId: 'book-5', bookTitle: '小王子', description: '在撒哈拉沙漠迫降的飞行员，听小王子讲述他的故事。', importance: 'major', relations: [{ characterId: 'char-17', strength: 0.9 }] },
  { id: 'char-19', name: '玫瑰', bookId: 'book-5', bookTitle: '小王子', description: '小王子星球上的玫瑰，骄傲而脆弱。', importance: 'major', relations: [{ characterId: 'char-17', strength: 0.8 }] },
  { id: 'char-20', name: '狐狸', bookId: 'book-5', bookTitle: '小王子', description: '教会小王子"驯服"的意义，关于建立联系的智慧。', importance: 'major', relations: [{ characterId: 'char-17', strength: 0.8 }] },
  // 红楼梦
  { id: 'char-21', name: '贾宝玉', bookId: 'book-6', bookTitle: '红楼梦', description: '贾府的贵公子，生性多情，厌恶科举仕途。', importance: 'major', relations: [{ characterId: 'char-22', strength: 0.9 }, { characterId: 'char-23', strength: 0.8 }] },
  { id: 'char-22', name: '林黛玉', bookId: 'book-6', bookTitle: '红楼梦', description: '贾宝玉的表妹，才华横溢，多愁善感。', importance: 'major', relations: [{ characterId: 'char-21', strength: 0.9 }, { characterId: 'char-23', strength: 0.5 }] },
  { id: 'char-23', name: '薛宝钗', bookId: 'book-6', bookTitle: '红楼梦', description: '端庄贤淑，最终与宝玉成婚。', importance: 'major', relations: [{ characterId: 'char-21', strength: 0.8 }, { characterId: 'char-22', strength: 0.5 }] },
  // 追风筝的人
  { id: 'char-24', name: '阿米尔', bookId: 'book-7', bookTitle: '追风筝的人', description: '富家少爷，因背叛哈桑而愧疚半生，最终踏上救赎之路。', importance: 'major', relations: [{ characterId: 'char-25', strength: 0.9 }, { characterId: 'char-26', strength: 0.7 }] },
  { id: 'char-25', name: '哈桑', bookId: 'book-7', bookTitle: '追风筝的人', description: '阿米尔的仆人兼好友，忠诚而勇敢，口头禅是"为你，千千万万遍"。', importance: 'major', relations: [{ characterId: 'char-24', strength: 0.9 }] },
  { id: 'char-26', name: ' Baba', bookId: 'book-7', bookTitle: '追风筝的人', description: '阿米尔的父亲，威严而正直，对阿米尔要求严格。', importance: 'minor', relations: [{ characterId: 'char-24', strength: 0.7 }] },
  // 三体
  { id: 'char-27', name: '叶文洁', bookId: 'book-8', bookTitle: '三体', description: '天体物理学家，向三体文明发送了地球的第一声啼鸣。', importance: 'major', relations: [{ characterId: 'char-28', strength: 0.6 }] },
  { id: 'char-28', name: '汪淼', bookId: 'book-8', bookTitle: '三体', description: '纳米材料科学家，被卷入三体组织的神秘事件中。', importance: 'major', relations: [{ characterId: 'char-27', strength: 0.6 }, { characterId: 'char-29', strength: 0.7 }] },
  { id: 'char-29', name: '史强', bookId: 'book-8', bookTitle: '三体', description: '刑警，看似粗犷实则心思缜密，保护汪淼。', importance: 'major', relations: [{ characterId: 'char-28', strength: 0.7 }] },
];

export const mockTags: Tag[] = [
  { id: 'tag-1', name: '魔幻现实主义' },
  { id: 'tag-2', name: '家族' },
  { id: 'tag-3', name: '孤独' },
  { id: 'tag-4', name: '拉美文学' },
  { id: 'tag-5', name: '史诗' },
  { id: 'tag-6', name: '现实主义' },
  { id: 'tag-7', name: '苦难' },
  { id: 'tag-8', name: '生命' },
  { id: 'tag-9', name: '中国历史' },
  { id: 'tag-10', name: '人性' },
  { id: 'tag-11', name: '爱情' },
  { id: 'tag-12', name: '青春' },
  { id: 'tag-13', name: '日本文学' },
  { id: 'tag-14', name: '成长' },
  { id: 'tag-15', name: '反乌托邦' },
  { id: 'tag-16', name: '政治' },
  { id: 'tag-17', name: '自由' },
  { id: 'tag-18', name: '科幻' },
  { id: 'tag-19', name: '社会' },
  { id: 'tag-20', name: '童话' },
  { id: 'tag-21', name: '哲理' },
  { id: 'tag-22', name: '古典' },
  { id: 'tag-23', name: '中国文学' },
  { id: 'tag-24', name: '友谊' },
  { id: 'tag-25', name: '救赎' },
  { id: 'tag-26', name: '阿富汗' },
  { id: 'tag-27', name: '宇宙' },
  { id: 'tag-28', name: '文明' },
];

// Color constants from design.md
export const COLORS = {
  bgCream: '#F8F6F0',
  bgCard: '#F0F0F0',
  bgPaper: '#F5F4EE',
  textPrimary: '#2C2C2C',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B8E',
  accentMorandi: '#5B7E71',
  accentHaze: '#6B8FAD',
  accentWarm: '#A67C52',
  borderSubtle: '#E2E0D8',
  borderActive: '#5B7E71',
} as const;

export const NODE_COLORS: Record<NodeType, string> = {
  book: COLORS.accentMorandi,
  character: COLORS.accentWarm,
  tag: COLORS.accentHaze,
};

export const NODE_RADIUS: Record<NodeType, number> = {
  book: 36,
  character: 24,
  tag: 18,
};

export const MODE_LABELS: Record<GraphMode, string> = {
  character: '角色关系',
  knowledge: '知识关联',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  book: '书籍',
  character: '角色',
  tag: '概念/标签',
};

export const EDGE_TYPE_LABELS: Partial<Record<EdgeType, string>> = {
  book_character: '书中角色',
  book_tag: '共享概念',
  book_book: '直接关联',
  character_character: '角色关联',
};
