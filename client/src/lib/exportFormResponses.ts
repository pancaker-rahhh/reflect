import * as XLSX from 'xlsx'
import type { FormFieldV2, FormResponseV2 } from '@/types'

interface ColumnGroup {
  groupName?: string
  fields: FormFieldV2[]
}

function getSurveyTypeFromConfig(field: FormFieldV2): string | null {
  if (!Array.isArray(field.config)) return null
  const surveyTypeConfig = field.config.find((c: any) => c.key === 'survey_type')
  return surveyTypeConfig?.value || null
}

function organizeColumns(fields: FormFieldV2[]): ColumnGroup[] {
  const groups: ColumnGroup[] = []
  const processed = new Set<string>()

  const surveyTypes = ['nps', 'csat', 'ces', 'review']

  surveyTypes.forEach((surveyType) => {
    const ratingField = fields.find(
      (f) =>
        getSurveyTypeFromConfig(f) === surveyType &&
        f.field_type === 'number' &&
        !processed.has(f.id)
    )

    const commentField = fields.find(
      (f) =>
        getSurveyTypeFromConfig(f) === surveyType &&
        f.field_type === 'text' &&
        (f.field_key.toLowerCase().includes('comment') ||
          f.label.toLowerCase().includes('reason') ||
          f.label.toLowerCase().includes('comment')) &&
        !processed.has(f.id)
    )

    if (ratingField || commentField) {
      const groupFields = [ratingField, commentField].filter(Boolean) as FormFieldV2[]
      groups.push({
        groupName: surveyType.toUpperCase() + ' Survey',
        fields: groupFields.sort((a, b) => a.order_index - b.order_index),
      })
      groupFields.forEach((f) => processed.add(f.id))
    }
  })

  const bugFields = fields.filter(
    (f) => f.field_key.toLowerCase().includes('bug_') && !processed.has(f.id)
  )
  if (bugFields.length > 0) {
    groups.push({
      groupName: 'Bug Report',
      fields: bugFields.sort((a, b) => a.order_index - b.order_index),
    })
    bugFields.forEach((f) => processed.add(f.id))
  }

  const featureFields = fields.filter(
    (f) => f.field_key.toLowerCase().includes('feature_') && !processed.has(f.id)
  )
  if (featureFields.length > 0) {
    groups.push({
      groupName: 'Feature Request',
      fields: featureFields.sort((a, b) => a.order_index - b.order_index),
    })
    featureFields.forEach((f) => processed.add(f.id))
  }

  const remainingFields = fields
    .filter((f) => !processed.has(f.id))
    .sort((a, b) => a.order_index - b.order_index)

  if (remainingFields.length > 0) {
    groups.push({
      fields: remainingFields,
    })
  }

  return groups
}

function formatAnswer(answer: any, field: FormFieldV2 | undefined): string {
  if (answer === null || answer === undefined || answer === '') {
    return ''
  }

  if (Array.isArray(answer)) {
    return answer.map((item) => String(item)).join('; ')
  }

  if (field?.field_type === 'number') {
    return String(Number(answer))
  }

  return String(answer)
}

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToCSV(
  responses: FormResponseV2[],
  fields: FormFieldV2[],
  formName: string
): void {
  const groups = organizeColumns(fields)
  const allFields = groups.flatMap((g) => g.fields)

  const headers = ['Response ID', 'Submitted At', ...allFields.map((f) => f.label)]

  const rows = responses.map((response) => {
    const row = [
      response.id,
      new Date(response.created_at)
        .toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        .replace(',', ''),
      ...allFields.map((field) => {
        const answer = response.answers[field.field_key]
        return formatAnswer(answer, field)
      }),
    ]
    return row.map((cell) => escapeCSVValue(String(cell)))
  })

  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  const sanitizedFormName = formName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  link.setAttribute(
    'download',
    `${sanitizedFormName}_responses_${new Date().toISOString().split('T')[0]}.csv`
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToExcel(
  responses: FormResponseV2[],
  fields: FormFieldV2[],
  formName: string
): void {
  const groups = organizeColumns(fields)
  const allFields = groups.flatMap((g) => g.fields)

  const headers = ['Response ID', 'Submitted At', ...allFields.map((f) => f.label)]

  const data = [
    headers,
    ...responses.map((response) => {
      return [
        response.id,
        new Date(response.created_at)
          .toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          .replace(',', ''),
        ...allFields.map((field) => {
          const answer = response.answers[field.field_key]
          return formatAnswer(answer, field)
        }),
      ]
    }),
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)

  const colWidths = headers.map((header, idx) => {
    const maxLength = Math.max(
      header.length,
      ...data.slice(1).map((row) => String(row[idx] || '').length)
    )
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Responses')

  const sanitizedFormName = formName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  XLSX.writeFile(
    wb,
    `${sanitizedFormName}_responses_${new Date().toISOString().split('T')[0]}.xlsx`
  )
}
