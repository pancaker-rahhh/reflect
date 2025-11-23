import React from 'react'

interface BrandWordmarkProps {
  className?: string
  textClassName?: string
  size?: number
  showText?: boolean
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = '',
  textClassName = 'text-primary',
  size = 24,
  showText = true,
}) => {
  const logoSize = size

  return (
    <span className={`inline-flex items-end gap-0 ${className}`}>
      <img
        src={new URL(
          'https://cdn.reflectfeedback.com/assets/logo-bg-removed.svg',
          import.meta.url
        ).toString()}
        alt="R logo"
        width={logoSize}
        height={Math.round(logoSize * (419 / 365))}
        style={{ display: 'block' }}
        loading="eager"
        decoding="async"
      />
      {showText && (
        <span
          className={`font-bold tracking-normal leading-none ml-[0.5px] translate-y-[1px] ${textClassName}`}
        >
          eflect
        </span>
      )}
    </span>
  )
}
