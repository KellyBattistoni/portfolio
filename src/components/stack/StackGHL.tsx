interface IconProps {
  size?: number
  color?: string
  className?: string
}

export function StackGHL({ size = 32, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2L4 10h5v10h6V10h5L12 2z" />
    </svg>
  )
}
