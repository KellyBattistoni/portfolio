import type { StackEntry } from './stack-registry'

interface StackIconProps {
  entry: StackEntry
  size?: number
}

export function StackIcon({ entry, size = 36 }: StackIconProps) {
  const { Icon } = entry
  return <Icon size={size} color="currentColor" />
}
