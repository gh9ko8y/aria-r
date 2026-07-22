import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge, GraphMode, GraphFilters } from './types';
import { COLORS } from './types';

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  mode: GraphMode;
  filters: GraphFilters;
  selectedNodeId: string | null;
  onNodeClick: (node: GraphNode) => void;
  onNodeHover: (node: GraphNode | null) => void;
}

export default function ForceGraph({
  nodes,
  edges,
  mode,
  filters,
  selectedNodeId,
  onNodeClick,
  onNodeHover,
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const dimensionsRef = useRef({ width: 800, height: 600 });
  const filtersRef = useRef(filters);
  const selectedNodeIdRef = useRef(selectedNodeId);
  const nodesRef = useRef<GraphNode[]>(nodes);
  const edgesRef = useRef<GraphEdge[]>(edges);
  const hoveredNodeRef = useRef<string | null>(null);

  // Keep refs in sync
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { selectedNodeIdRef.current = selectedNodeId; }, [selectedNodeId]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // Check if a node matches current filters
  const nodeMatchesFilter = useCallback((node: GraphNode) => {
    const f = filtersRef.current;
    if (f.nodeTypes.length > 0 && !f.nodeTypes.includes(node.type)) return false;
    if (f.searchQuery) {
      const q = f.searchQuery.toLowerCase();
      return node.label.toLowerCase().includes(q);
    }
    return true;
  }, []);

  // Helper to safely get node id from link end (handles D3's string | number | GraphNode)
  const getNodeId = useCallback((ref: string | number | GraphNode): string => {
    if (typeof ref === 'string') return ref;
    if (typeof ref === 'number') return String(ref);
    return ref.id;
  }, []);

  // Get connected node ids for a given node
  const getConnectedNodeIds = useCallback((nodeId: string) => {
    const connected = new Set<string>();
    connected.add(nodeId);
    edgesRef.current.forEach(e => {
      const s = getNodeId(e.source);
      const t = getNodeId(e.target);
      if (s === nodeId) connected.add(t);
      if (t === nodeId) connected.add(s);
    });
    return connected;
  }, [getNodeId]);

  // Apply filter-based opacity
  const applyFilterOpacity = useCallback(() => {
    if (!gRef.current) return;
    const g = gRef.current;
    const hoveredId = hoveredNodeRef.current;
    const connectedIds = hoveredId ? getConnectedNodeIds(hoveredId) : null;

    g.selectAll<SVGGElement, GraphNode>('.graph-node')
      .transition()
      .duration(400)
      .style('opacity', (d) => {
        if (connectedIds) {
          return connectedIds.has(d.id) ? 1 : 0.15;
        }
        return nodeMatchesFilter(d) ? 1 : 0.15;
      });

    g.selectAll<SVGLineElement, GraphEdge>('.graph-edge')
      .transition()
      .duration(400)
      .style('opacity', (d) => {
        const s = getNodeId(d.source);
        const t = getNodeId(d.target);
        if (connectedIds) {
          return (connectedIds.has(s) && connectedIds.has(t)) ? 1 : 0.05;
        }
        const sMatch = nodeMatchesFilter(nodesRef.current.find(n => n.id === s) || nodesRef.current[0]);
        const tMatch = nodeMatchesFilter(nodesRef.current.find(n => n.id === t) || nodesRef.current[0]);
        return (sMatch && tMatch) ? 0.6 : 0.05;
      });

    g.selectAll<SVGTextElement, GraphNode>('.node-label')
      .transition()
      .duration(400)
      .style('opacity', (d) => {
        if (connectedIds) {
          return connectedIds.has(d.id) ? 1 : 0.15;
        }
        return nodeMatchesFilter(d) ? 1 : 0.15;
      });
  }, [nodeMatchesFilter, getConnectedNodeIds]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition().duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.3);
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition().duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
  }, []);

  const zoomToFit = useCallback(() => {
    if (!svgRef.current || !gRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    const g = gRef.current;
    const { width, height } = dimensionsRef.current;

    const nodeEls = g.selectAll<SVGGElement, GraphNode>('.graph-node').data();
    if (nodeEls.length === 0) return;

    const xs = nodeEls.map(d => d.x || 0);
    const ys = nodeEls.map(d => d.y || 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const dx = maxX - minX;
    const dy = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const scale = Math.min(
      (width - 80) / (dx + 120),
      (height - 80) / (dy + 120),
      1.5
    );
    const clampedScale = Math.max(0.1, Math.min(3, scale));

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(clampedScale)
      .translate(-cx, -cy);

    svg.transition().duration(500)
      .call(zoomBehaviorRef.current!.transform, transform);
  }, [nodes.length]);

  // Zoom to selected node
  const zoomToNode = useCallback((nodeId: string) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node || node.x == null || node.y == null) return;

    const { width, height } = dimensionsRef.current;
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1.5)
      .translate(-node.x, -node.y);

    d3.select(svgRef.current)
      .transition().duration(500)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, transform);
  }, []);

  // Apply highlight ring to selected node
  const applySelectedHighlight = useCallback(() => {
    if (!gRef.current) return;
    const g = gRef.current;
    g.selectAll<SVGCircleElement, GraphNode>('.node-circle')
      .transition().duration(200)
      .attr('stroke-width', (d) => d.id === selectedNodeIdRef.current ? 4 : 0)
      .attr('stroke', (d) => d.id === selectedNodeIdRef.current ? d.color : 'none')
      .attr('stroke-opacity', 0.8);
  }, []);

  // Main D3 setup effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensionsRef.current;

    // Create main group
    const g = svg.append('g');
    gRef.current = g;

    // Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        g.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Double-click to fit
    svg.on('dblclick.zoom', () => {
      zoomToFit();
    });

    // Edge group (behind nodes)
    const edgeGroup = g.append('g').attr('class', 'edges');
    // Node group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    // Label group
    const labelGroup = g.append('g').attr('class', 'labels');

    // Prepare links with resolved node refs
    const links: GraphEdge[] = edges.map(e => ({ ...e }));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    links.forEach(l => {
      if (typeof l.source === 'string') l.source = nodeMap.get(l.source) || l.source;
      if (typeof l.target === 'string') l.target = nodeMap.get(l.target) || l.target;
    });

    // Render edges
    const edgeSel = edgeGroup.selectAll<SVGLineElement, GraphEdge>('line.graph-edge')
      .data(links, (d: any) => d.id)
      .join('line')
      .attr('class', 'graph-edge')
      .attr('stroke', (d) => {
        if (d.type === 'book_tag') return COLORS.accentHaze;
        if (d.type === 'character_character') return COLORS.accentWarm;
        return COLORS.borderSubtle;
      })
      .attr('stroke-width', (d) => {
        if (d.type === 'book_book') return 2;
        return 1;
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => {
        if (d.type === 'book_tag') return '6,4';
        if (d.type === 'character_character') return '2,3';
        return 'none';
      });

    // Render nodes
    const nodeSel = nodeGroup.selectAll<SVGGElement, GraphNode>('g.graph-node')
      .data(nodes, (d: any) => d.id)
      .join('g')
      .attr('class', 'graph-node')
      .style('cursor', 'pointer');

    // Node circles
    nodeSel.append('circle')
      .attr('class', 'node-circle')
      .attr('r', 0) // start at 0 for entrance animation
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.9)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Entrance animation: scale from 0 to full radius with stagger
    nodeSel.selectAll<SVGCircleElement, GraphNode>('circle.node-circle')
      .transition()
      .delay((_, i) => i * 30)
      .duration(600)
      .ease(d3.easeBackOut)
      .attr('r', (d) => d.radius);

    // Node labels (inside or below)
    nodeSel.each(function (d) {
      const el = d3.select(this);
      if (d.type === 'book') {
        // Book icon: text inside circle
        el.append('text')
          .attr('class', 'node-icon')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', d.radius * 0.8)
          .attr('font-family', 'serif')
          .attr('font-weight', 'bold')
          .text('B')
          .style('opacity', 0)
          .transition()
          .delay(800)
          .duration(400)
          .style('opacity', 0.9);
      } else if (d.type === 'tag') {
        el.append('text')
          .attr('class', 'node-icon')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', d.radius * 0.7)
          .text('#')
          .style('opacity', 0)
          .transition()
          .delay(800)
          .duration(400)
          .style('opacity', 0.9);
      } else {
        // Character: initials inside
        const initials = d.label.slice(0, 1);
        el.append('text')
          .attr('class', 'node-icon')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', d.radius * 0.7)
          .attr('font-weight', '600')
          .text(initials)
          .style('opacity', 0)
          .transition()
          .delay(800)
          .duration(400)
          .style('opacity', 0.9);
      }
    });

    // External labels
    const labelSel = labelGroup.selectAll<SVGTextElement, GraphNode>('text.node-label')
      .data(nodes, (d: any) => d.id)
      .join('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 14)
      .attr('fill', COLORS.textPrimary)
      .attr('font-size', 11)
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0)
      .text((d) => d.label);

    // Label fade-in after simulation settles
    setTimeout(() => {
      labelSel.transition().duration(600).style('opacity', 0.85);
    }, 1200);

    // Drag behavior
    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });

    nodeSel.call(dragBehavior);

    // Hover interactions
    nodeSel
      .on('mouseenter', function (_event, d) {
        hoveredNodeRef.current = d.id;
        d3.select(this).select('circle.node-circle')
          .transition().duration(200)
          .attr('r', d.radius * 1.15)
          .attr('stroke-width', 3)
          .attr('stroke', d.color)
          .attr('stroke-opacity', 0.6);
        applyFilterOpacity();
        onNodeHover(d);
      })
      .on('mouseleave', function (_event, d) {
        hoveredNodeRef.current = null;
        d3.select(this).select('circle.node-circle')
          .transition().duration(200)
          .attr('r', d.radius)
          .attr('stroke-width', d.id === selectedNodeIdRef.current ? 4 : 2)
          .attr('stroke', d.id === selectedNodeIdRef.current ? d.color : 'white')
          .attr('stroke-opacity', d.id === selectedNodeIdRef.current ? 0.8 : 1);
        applyFilterOpacity();
        onNodeHover(null);
      })
      .on('click', (_event, d) => {
        onNodeClick(d);
        zoomToNode(d.id);
      });

    // Force simulation
    const linkForce = d3.forceLink<GraphNode, GraphEdge>(links)
      .id((d: any) => d.id)
      .distance((d: GraphEdge) => {
        if (mode === 'character') return 120;
        if (d.type === 'book_tag') return 150;
        return 180;
      })
      .strength((d: GraphEdge) => {
        if (mode === 'character') return 0.3;
        if (d.type === 'book_book') return 0.2;
        return 0.15;
      });

    const chargeForce = d3.forceManyBody<GraphNode>()
      .strength(() => mode === 'character' ? -600 : -900)
      .distanceMax(500);

    const centerForce = d3.forceCenter(width / 2, height / 2)
      .strength(mode === 'character' ? 0.05 : 0.08);

    const collisionForce = d3.forceCollide<GraphNode>()
      .radius((d) => d.radius + (mode === 'character' ? 15 : 25))
      .strength(0.7);

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('center', centerForce)
      .force('collision', collisionForce)
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    simulationRef.current = simulation;

    simulation.on('tick', () => {
      edgeSel
        .attr('x1', (d) => (d.source as GraphNode).x || 0)
        .attr('y1', (d) => (d.source as GraphNode).y || 0)
        .attr('x2', (d) => (d.target as GraphNode).x || 0)
        .attr('y2', (d) => (d.target as GraphNode).y || 0);

      nodeSel.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
      labelSel
        .attr('x', (d) => d.x || 0)
        .attr('y', (d) => d.y || 0);
    });

    // Initial zoom to fit after settling
    const initialFitTimer = setTimeout(() => {
      zoomToFit();
    }, 1500);

    return () => {
      clearTimeout(initialFitTimer);
      simulation.stop();
      svg.selectAll('*').remove();
      simulationRef.current = null;
      gRef.current = null;
      zoomBehaviorRef.current = null;
    };
  }, [nodes, edges, mode, onNodeClick, onNodeHover, zoomToFit, zoomToNode, applyFilterOpacity]);

  // Update filter opacity when filters change
  useEffect(() => {
    applyFilterOpacity();
  }, [filters, applyFilterOpacity]);

  // Update selected highlight when selectedNodeId changes
  useEffect(() => {
    applySelectedHighlight();
  }, [selectedNodeId, applySelectedHighlight]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        dimensionsRef.current = { width, height };
        if (svgRef.current) {
          d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);
        }
        if (simulationRef.current) {
          const centerForce = simulationRef.current.force('center') as d3.ForceCenter<GraphNode>;
          if (centerForce) {
            centerForce.x(width / 2);
            centerForce.y(height / 2);
          }
          simulationRef.current.alpha(0.3).restart();
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={zoomIn}
          className="w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-[#5B7E71] hover:text-white flex items-center justify-center shadow-md transition-all duration-200 border border-[#E2E0D8]"
          title="放大"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-[#5B7E71] hover:text-white flex items-center justify-center shadow-md transition-all duration-200 border border-[#E2E0D8]"
          title="缩小"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </button>
        <button
          onClick={zoomToFit}
          className="w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-[#5B7E71] hover:text-white flex items-center justify-center shadow-md transition-all duration-200 border border-[#E2E0D8]"
          title="适应屏幕"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4.5V1h3.5M15 4.5V1h-3.5M1 11.5V15h3.5M15 11.5V15h-3.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
