export interface SpdxJson {
  packages: {
    externalRefs?: {
      referenceType: string
      referenceLocator: string
    }[]
  }[]
}
