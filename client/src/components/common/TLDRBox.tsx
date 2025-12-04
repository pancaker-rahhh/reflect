import React from 'react'

interface TLDRBoxProps {
  children: React.ReactNode
}

export default function TLDRBox({ children }: TLDRBoxProps) {
  return (
    <aside className="tldr-box" aria-label="Summary">
      <strong>TL;DR</strong>
      <div>{children}</div>
    </aside>
  )
}
