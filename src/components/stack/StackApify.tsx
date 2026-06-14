interface IconProps {
  size?: number
  color?: string
  className?: string
}

export function StackApify({ size = 32, color = 'currentColor', className }: IconProps) {
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
      <path d="M12 2L2 19.5h4.5L12 8.5l5.5 11H22L12 2zm0 9.5l3 6H9l3-6z" />
    </svg>
  )
}
