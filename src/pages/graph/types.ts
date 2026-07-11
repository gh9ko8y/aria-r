export interface GraphNode {
  id: string
  label: string
  type: 'book' | 'character' | 'tag'
  color: string
  radius: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  data: Record<string, unknown>
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: string
  strength: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export type GraphMode = 'character' | 'knowledge'

export const NODE_COLORS = {
  book: '#5B7E71',
  character: '#A67C52',
  tag: '#6B8FAD',
}

export const NODE_RADIUS = {
  book: 24,
  character: 16,
  tag: 12,
}
