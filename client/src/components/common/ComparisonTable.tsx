import React from 'react'

type Row = {
  label: string
  reflect: React.ReactNode
  competitor: React.ReactNode
}

interface ComparisonTableProps {
  rows: Row[]
  competitorName?: string
}

export default function ComparisonTable({
  rows,
  competitorName = 'Competitor',
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="comparison-table w-full" aria-label="Product comparison table">
        <thead className="bg-muted">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Reflect</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
              {competitorName}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, index) => (
            <tr key={index} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 text-sm text-foreground">{r.label}</td>
              <td className="px-6 py-4 text-center">{r.reflect}</td>
              <td className="px-6 py-4 text-center">{r.competitor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
