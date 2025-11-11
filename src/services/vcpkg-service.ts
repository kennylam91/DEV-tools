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
    // Remove pkg: prefix if present
    const cleaned = purl.replace(/^pkg:/, '')

    // Split into type and rest
    const [type, rest] = cleaned.split('/', 2)

    if (type !== 'vcpkg') {
      throw new Error(`Invalid purl type: ${type}. Expected 'vcpkg'`)
    }

    if (!rest) {
      throw new Error('Invalid purl format. Expected pkg:vcpkg/portname@version')
    }

    // Split name and version
    const [name, version] = rest.split('@', 2)

    return {
      type,
      name,
      version
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
    // Match by version-date
    let entry = versions.find((v) => v['version-date'] === targetVersion)
    if (entry) return entry

    // Match by port-version (as string)
    entry = versions.find((v) => String(v['port-version']) === targetVersion)
    if (entry) return entry

    // Fallback: match by version
    entry = versions.find((v) => v.version === targetVersion)
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
