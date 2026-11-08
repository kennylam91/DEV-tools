/**
 * Represents a vcpkg package version entry from the versions JSON file
 */
export interface VcpkgVersionEntry {
  version: string
  'version-date'?: string
  'port-version'?: string
  'version-semver'?: string
  'version-string'?: string
  'git-tree': string
}

/**
 * Represents the structure of a vcpkg versions JSON file
 */
export interface VcpkgVersionsFile {
  versions: VcpkgVersionEntry[]
}

/**
 * Represents a git tree entry from GitHub API
 */
export interface VcpkgTreeEntry {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

/**
 * Represents a git tree response from GitHub API
 */
export interface VcpkgGitTree {
  sha: string
  url: string
  tree: VcpkgTreeEntry[]
  truncated: boolean
}

/**
 * Represents vcpkg package metadata from vcpkg.json
 */
export interface VcpkgMetadata {
  name: string
  version?: string
  'version-date'?: string
  'version-semver'?: string
  'version-string'?: string
  'port-version'?: number
  description?: string | string[]
  homepage?: string
  license?: string
  dependencies?: Array<string | { name: string; [key: string]: any }>
  features?: Record<string, { description: string; dependencies?: string[] }>
  [key: string]: any
}

/**
 * Represents parsed purl components
 */
export interface ParsedPurl {
  type: string
  namespace?: string
  name: string
  version?: string
}

/**
 * Step 1 result: version lookup
 */
export interface Step1Result {
  portName: string
  version: string
  gitTree: string
  allVersions: VcpkgVersionEntry[]
}

/**
 * Step 2 result: git tree exploration
 */
export interface Step2Result {
  gitTree: string
  treeEntries: VcpkgTreeEntry[]
  metadataFile?: VcpkgTreeEntry
}

/**
 * Step 3 result: metadata display
 */
export interface Step3Result {
  metadata: VcpkgMetadata
  rawContent: string
  fileName: string
}
