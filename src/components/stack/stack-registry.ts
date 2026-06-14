import type { ComponentType } from 'react'
import {
  SiAirtable,
  SiSupabase,
  SiPython,
  SiJavascript,
  SiDocker,
  SiNotion,
  SiGithub,
  SiGooglecloud,
  SiRailway,
} from '@icons-pack/react-simple-icons'
import { StackClaude } from './StackClaude'
import { StackN8n } from './StackN8n'
import { StackMake } from './StackMake'
import { StackApify } from './StackApify'

export type StackCategory = 'automation' | 'ai' | 'infrastructure' | 'languages' | 'data'

interface IconComponentProps {
  size?: number
  color?: string
  className?: string
}

export interface StackEntry {
  id: string
  name: string
  category: StackCategory
  Icon: ComponentType<IconComponentProps>
}

export const STACK: readonly StackEntry[] = [
  // Automation
  { id: 'make',     name: 'Make.com',     category: 'automation',    Icon: StackMake },
  { id: 'n8n',      name: 'n8n',          category: 'automation',    Icon: StackN8n },
  // AI
  { id: 'claude',   name: 'Claude / MCP', category: 'ai',            Icon: StackClaude },
  // Infrastructure
  { id: 'docker',   name: 'Docker',       category: 'infrastructure', Icon: SiDocker },
  { id: 'railway',  name: 'Railway',      category: 'infrastructure', Icon: SiRailway },
  { id: 'gcp',      name: 'Google Cloud', category: 'infrastructure', Icon: SiGooglecloud },
  { id: 'github',   name: 'GitHub',       category: 'infrastructure', Icon: SiGithub },
  // Languages
  { id: 'python',   name: 'Python',       category: 'languages',     Icon: SiPython },
  { id: 'js',       name: 'JavaScript',   category: 'languages',     Icon: SiJavascript },
  // Data
  { id: 'supabase', name: 'Supabase',     category: 'data',          Icon: SiSupabase },
  { id: 'airtable', name: 'Airtable',     category: 'data',          Icon: SiAirtable },
  { id: 'notion',   name: 'Notion',       category: 'data',          Icon: SiNotion },
  { id: 'apify',    name: 'Apify',        category: 'data',          Icon: StackApify },
] as const

export const STACK_ORDER: readonly StackCategory[] = [
  'automation',
  'ai',
  'infrastructure',
  'languages',
  'data',
] as const
