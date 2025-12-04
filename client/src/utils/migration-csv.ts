/**
 * Simple utility to convert an array of objects into CSV string using a mapping.
 * Example usage:
 *  const csv = exportMigrationCSV(dataArray, {
 *    external_id: 'canny.id',
 *    title: 'canny.title',
 *    description: 'canny.description'
 *  });
 */
export function exportMigrationCSV(
  data: Record<string, any>[],
  mapping: Record<string, string[]>
): string {
  // mapping: { targetColumn: ['path','to','value'] } where path is dot-separated keys or a key name
  const headers = Object.keys(mapping)
  const rows = data.map((item) =>
    headers
      .map((h) => {
        const path = mapping[h]
        if (!Array.isArray(path)) return ''
        let val: any = item
        for (const p of path) {
          if (val == null) break
          val = val[p]
        }
        if (val == null) return ''
        // escape quotes
        const s = String(val).replace(/"/g, '""')
        return `"${s}"`
      })
      .join(',')
  )
  return `${headers.join(',')}\n${rows.join('\n')}`
}
