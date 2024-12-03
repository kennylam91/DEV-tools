export class RelationshipGraph {
  private graph: Map<string, Set<string>>
  private root: string

  constructor(root: string) {
    this.root = root
    this.graph = new Map<string, Set<string>>()
    this.graph.set(root, new Set())
  }

  addRelationship(spdxElementId: string, relatedSpdxElementId: string) {
    if (!this.graph.has(spdxElementId)) {
      this.graph.set(spdxElementId, new Set())
    }

    this.graph.get(spdxElementId)!.add(relatedSpdxElementId)
  }

  traverse(maxLevel: number, func: (c: string, p?: string) => void) {
    return this.internalTraverse(0, maxLevel, func, this.root)
  }

  private internalTraverse(
    level: number,
    maxLevel: number,
    func: (c: string, p?: string) => void,
    node: string,
    parent?: string
  ) {
    if (level > maxLevel) {
      return
    }
    func(node, parent)

    this.graph.get(node)?.forEach((child) => {
      this.internalTraverse(level + 1, maxLevel, func, child, node)
    })
  }
}
