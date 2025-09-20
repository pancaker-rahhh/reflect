interface StructuredDescriptionProps {
  description: string
  className?: string
}

export function StructuredDescription({ description, className = '' }: StructuredDescriptionProps) {
  if (!description) {
    return <span className="italic text-muted-foreground/70">No description provided</span>
  }

  const lines = description.split('\n')
  const sections: Array<{ title: string; content: string }> = []
  let currentTitle = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine && !trimmedLine.includes(' ') && trimmedLine.length < 50) {
      if (currentTitle && currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim(),
        })
      }
      currentTitle = trimmedLine
      currentContent = []
    } else if (currentTitle) {
      currentContent.push(line)
    } else {
      currentContent.push(line)
    }
  }

  if (currentTitle && currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim(),
    })
  }

  if (sections.length === 0) {
    return (
      <p
        className={`text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed ${className}`}
      >
        {description}
      </p>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section, index) => (
        <div key={index} className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed ml-0">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  )
}
