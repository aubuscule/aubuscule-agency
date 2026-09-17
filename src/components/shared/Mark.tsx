interface MarkProps {
  idPrefix: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Mark({ idPrefix, className, style, children }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <defs>
        {children}
        <mask id={`${idPrefix}c`}>
          <rect width="100" height="100" fill="#fff" />
          <circle cx="63" cy="39" r="29" fill="#000" />
        </mask>
        <mask id={`${idPrefix}k`}>
          <rect width="100" height="100" fill="#000" />
          <circle cx="57" cy="47" r="35" fill="#fff" />
          <circle cx="50" cy="51" r="30" fill="#000" />
        </mask>
        <pattern
          id={`${idPrefix}d`}
          width="2.7"
          height="2.7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <circle cx="1.35" cy="1.35" r="0.52" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#${idPrefix}d)`} mask={`url(#${idPrefix}k)`} />
      <circle cx="50" cy="51" r="29" fill="currentColor" mask={`url(#${idPrefix}c)`} />
    </svg>
  )
}
