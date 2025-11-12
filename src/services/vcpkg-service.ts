import type {
  ParsedPurl,
  VcpkgVersionsFile,
  VcpkgVersionEntry,
  VcpkgGitTree,
  VcpkgTreeEntry,
  VcpkgMetadata,
  Step1Result,
  Step2Result,
  Step3Result
} from '@/models/vcpkg-package'
import { PackageURL } from 'packageurl-js'

const GITHUB_API_BASE = 'https://api.github.com'
const VCPKG_REPO = 'microsoft/vcpkg'

export interface VcpkgService {
  parsePackageUrl(purl: string): ParsedPurl
  fetchVersions(portName: string): Promise<VcpkgVersionsFile>
  findVersionEntry(versions: VcpkgVersionEntry[], targetVersion: string): VcpkgVersionEntry | null
  fetchGitTree(sha: string): Promise<VcpkgGitTree>
  findMetadataFile(treeEntries: VcpkgTreeEntry[]): VcpkgTreeEntry | null
  fetchFileBlob(sha: string): Promise<string>
  parseMetadata(content: string, fileName: string): VcpkgMetadata
  executeStep1(purl: string): Promise<Step1Result>
  executeStep2(gitTreeSha: string): Promise<Step2Result>
  executeStep3(metadataFileSha: string, fileName: string): Promise<Step3Result>
}

class VcpkgServiceImpl implements VcpkgService {
  /**
   * Parse a package URL (purl) in the format: pkg:vcpkg/portname@version
   */
  parsePackageUrl(purl: string): ParsedPurl {
    // Use packageurl-js to parse the purl
    let pkg: any
    try {
      pkg = PackageURL.fromString(purl)
    } catch (e) {
      throw new Error(`Invalid purl: ${purl}`)
    }
    if (pkg.type !== 'vcpkg') {
      throw new Error(`Invalid purl type: ${pkg.type}. Expected 'vcpkg'`)
    }
    // Always use only the port name (ignore namespace)
    let portName = pkg.name
    if (portName.includes('/')) {
      // Strip namespace if present
      portName = portName.split('/').pop() || portName
    }
    return {
      type: pkg.type,
      name: portName,
      version: pkg.version
    }
  }

  /**
   * Fetch versions JSON file from vcpkg repository
   */
  async fetchVersions(portName: string): Promise<VcpkgVersionsFile> {
    // Calculate prefix character (first letter of port name)
    const prefix = portName.charAt(0).toLowerCase()

    const url = `${GITHUB_API_BASE}/repos/${VCPKG_REPO}/contents/versions/${prefix}-/${portName}.json`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * Find a specific version entry in the versions array
   */
  findVersionEntry(versions: VcpkgVersionEntry[], targetVersion: string): VcpkgVersionEntry | null {
    // Normalize targetVersion (strip leading 'v' and '{portName}-' if present)
    let normalizedVersion = targetVersion
    if (normalizedVersion.startsWith('v')) {
      normalizedVersion = normalizedVersion.slice(1)
    }
    // Try to strip '{portName}-' prefix
    if (versions.length > 0) {
      // Try to infer portName from context (not always possible, so fallback to regex)
      const regex = /^([a-zA-Z0-9_-]+)-(.+)$/
      const match = normalizedVersion.match(regex)
      if (match && match[2]) {
        // If the suffix matches a version in the list, use it
        if (
          versions.some(
            (v) =>
              v.version === match[2] ||
              v['version-string'] === match[2] ||
              v['version-semver'] === match[2]
          )
        ) {
          normalizedVersion = match[2]
        }
      }
    }

    // Match by version-date
    let entry = versions.find((v) => v['version-date'] === normalizedVersion)
    if (entry) return entry

    // Match by port-version (as string)
    entry = versions.find((v) => String(v['port-version']) === normalizedVersion)
    if (entry) return entry

    // Match by version-semver (as string)
    entry = versions.find((v) => String(v['version-semver']) === normalizedVersion)
    if (entry) return entry

    // Match by version-string (as string)
    entry = versions.find((v) => String(v['version-string']) === normalizedVersion)
    if (entry) return entry

    // Fallback: match by version
    entry = versions.find((v) => v.version === normalizedVersion)
    if (entry) return entry

    return null
  }

  /**
   * Fetch git tree from GitHub API
   */
  async fetchGitTree(sha: string): Promise<VcpkgGitTree> {
    const url = `${GITHUB_API_BASE}/repos/${VCPKG_REPO}/git/trees/${sha}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch git tree: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * Find metadata file (vcpkg.json or CONTROL) in tree entries
   */
  findMetadataFile(treeEntries: VcpkgTreeEntry[]): VcpkgTreeEntry | null {
    // Prefer vcpkg.json over CONTROL
    const vcpkgJson = treeEntries.find(
      (entry) => entry.path === 'vcpkg.json' && entry.type === 'blob'
    )

    if (vcpkgJson) return vcpkgJson

    const control = treeEntries.find((entry) => entry.path === 'CONTROL' && entry.type === 'blob')

    return control || null
  }

  /**
   * Fetch file blob content from GitHub API
   */
  async fetchFileBlob(sha: string): Promise<string> {
    const url = `${GITHUB_API_BASE}/repos/${VCPKG_REPO}/git/blobs/${sha}`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file blob: ${response.status} ${response.statusText}`)
    }

    const content = await response.text()
    return content
  }

  /**
   * Parse metadata content (JSON or CONTROL format)
   */
  parseMetadata(content: string, fileName: string): VcpkgMetadata {
    if (fileName === 'vcpkg.json') {
      return JSON.parse(content)
    }

    // Parse CONTROL format (key-value pairs)
    const metadata: VcpkgMetadata = { name: '' }
    const lines = content.split('\n')

    let currentKey = ''

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) continue

      if (line.startsWith(' ') && currentKey) {
        // Continuation of previous value
        const currentValue = metadata[currentKey]
        if (typeof currentValue === 'string') {
          metadata[currentKey] = currentValue + ' ' + trimmed
        }
      } else {
        // New key-value pair
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex > 0) {
          currentKey = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()
          metadata[currentKey] = value
        }
      }
    }

    return metadata
  }

  /**
   * Execute Step 1: Parse purl and fetch version information
   */
  async executeStep1(purl: string): Promise<Step1Result> {
    const parsed = this.parsePackageUrl(purl)

    if (!parsed.version) {
      throw new Error('Version is required in the purl')
    }

    const versionsFile = await this.fetchVersions(parsed.name)

    const versionEntry = this.findVersionEntry(versionsFile.versions, parsed.version)

    if (!versionEntry) {
      throw new Error(`Version ${parsed.version} not found for port ${parsed.name}`)
    }

    return {
      portName: parsed.name,
      version: parsed.version,
      gitTree: versionEntry['git-tree'],
      allVersions: versionsFile.versions
    }
  }

  /**
   * Execute Step 2: Fetch git tree and find metadata file
   */
  async executeStep2(gitTreeSha: string): Promise<Step2Result> {
    const gitTree = await this.fetchGitTree(gitTreeSha)

    const metadataFile = this.findMetadataFile(gitTree.tree)

    return {
      gitTree: gitTreeSha,
      treeEntries: gitTree.tree,
      metadataFile: metadataFile || undefined
    }
  }

  /**
   * Execute Step 3: Fetch and parse metadata file
   */
  async executeStep3(metadataFileSha: string, fileName: string): Promise<Step3Result> {
    const content = await this.fetchFileBlob(metadataFileSha)

    const metadata = this.parseMetadata(content, fileName)

    return {
      metadata,
      rawContent: content,
      fileName
    }
  }
}

let serviceInstance: VcpkgService | null = null

export function getVcpkgService(): VcpkgService {
  if (!serviceInstance) {
    serviceInstance = new VcpkgServiceImpl()
  }
  return serviceInstance
}
