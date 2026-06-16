import type { ComponentType } from 'react'
import {
  SiAirtable,
  SiSupabase,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiReact,
  SiDocker,
  SiRedis,
  SiNotion,
  SiGithub,
  SiGooglecloud,
  SiGoogledrive,
  SiGoogleanalytics,
  SiGooglesearchconsole,
  SiRailway,
  SiPerplexity,
  SiJson,
  SiOllama,
  SiVite,
  SiHubspot,
  SiLooker,
} from '@icons-pack/react-simple-icons'
import { StackClaude } from './StackClaude'
import { StackN8n } from './StackN8n'
import { StackMake } from './StackMake'
import { StackApify } from './StackApify'
import { StackOpenAI } from './StackOpenAI'
import { StackGHL } from './StackGHL'
import { StackBuzz } from './StackBuzz'

export type StackCategory = 'automation' | 'ai' | 'infrastructure' | 'development' | 'data'

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
  url: string
  brandColor: string
}

export const STACK: readonly StackEntry[] = [
  // Automation
  {
    id: 'n8n',
    name: 'n8n',
    category: 'automation',
    Icon: StackN8n,
    url: 'https://n8n.io',
    brandColor: '#EA4B71',
  },
  {
    id: 'make',
    name: 'Make.com',
    category: 'automation',
    Icon: StackMake,
    url: 'https://make.com',
    brandColor: '#6D00CC',
  },
  {
    id: 'apify',
    name: 'Apify',
    category: 'automation',
    Icon: StackApify,
    url: 'https://apify.com',
    brandColor: '#FF9012',
  },
  {
    id: 'ghl',
    name: 'GoHighLevel',
    category: 'automation',
    Icon: StackGHL,
    url: 'https://gohighlevel.com',
    brandColor: '#00C896',
  },
  {
    id: 'buzz',
    name: 'Buzz.ai',
    category: 'automation',
    Icon: StackBuzz,
    url: 'https://buzz.ai',
    brandColor: '#F59E0B',
  },
  // AI
  {
    id: 'claude',
    name: 'Claude',
    category: 'ai',
    Icon: StackClaude,
    url: 'https://claude.ai',
    brandColor: '#D97757',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    Icon: StackOpenAI,
    url: 'https://openai.com',
    brandColor: '#10A37F',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'ai',
    Icon: SiPerplexity,
    url: 'https://perplexity.ai',
    brandColor: '#1FB8CD',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    category: 'ai',
    Icon: SiOllama,
    url: 'https://ollama.com',
    brandColor: '#FFFFFF',
  },
  // Infrastructure
  {
    id: 'docker',
    name: 'Docker',
    category: 'infrastructure',
    Icon: SiDocker,
    url: 'https://docker.com',
    brandColor: '#2496ED',
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'infrastructure',
    Icon: SiRedis,
    url: 'https://redis.io',
    brandColor: '#FF4438',
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'infrastructure',
    Icon: SiRailway,
    url: 'https://railway.app',
    brandColor: '#B835FF',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'infrastructure',
    Icon: SiGithub,
    url: 'https://github.com',
    brandColor: '#FFFFFF',
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    category: 'infrastructure',
    Icon: SiGooglecloud,
    url: 'https://cloud.google.com',
    brandColor: '#4285F4',
  },
  // Development
  {
    id: 'python',
    name: 'Python',
    category: 'development',
    Icon: SiPython,
    url: 'https://python.org',
    brandColor: '#3776AB',
  },
  {
    id: 'js',
    name: 'JavaScript',
    category: 'development',
    Icon: SiJavascript,
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    brandColor: '#F7DF1E',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'development',
    Icon: SiTypescript,
    url: 'https://typescriptlang.org',
    brandColor: '#3178C6',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'development',
    Icon: SiNodedotjs,
    url: 'https://nodejs.org',
    brandColor: '#5FA04E',
  },
  {
    id: 'react',
    name: 'React',
    category: 'development',
    Icon: SiReact,
    url: 'https://react.dev',
    brandColor: '#61DAFB',
  },
  {
    id: 'json',
    name: 'JSON',
    category: 'development',
    Icon: SiJson,
    url: 'https://json.org',
    brandColor: '#000000',
  },
  {
    id: 'vite',
    name: 'Vite',
    category: 'development',
    Icon: SiVite,
    url: 'https://vitejs.dev',
    brandColor: '#646CFF',
  },
  // Data & Workspace
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'data',
    Icon: SiSupabase,
    url: 'https://supabase.com',
    brandColor: '#3ECF8E',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'data',
    Icon: SiAirtable,
    url: 'https://airtable.com',
    brandColor: '#18BFFF',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'data',
    Icon: SiNotion,
    url: 'https://notion.so',
    brandColor: '#FFFFFF',
  },
  {
    id: 'googleworkspace',
    name: 'Google Workspace',
    category: 'data',
    Icon: SiGoogledrive,
    url: 'https://workspace.google.com',
    brandColor: '#4285F4',
  },
  {
    id: 'googleanalytics',
    name: 'Google Analytics',
    category: 'data',
    Icon: SiGoogleanalytics,
    url: 'https://analytics.google.com',
    brandColor: '#E37400',
  },
  {
    id: 'searchconsole',
    name: 'Search Console',
    category: 'data',
    Icon: SiGooglesearchconsole,
    url: 'https://search.google.com/search-console',
    brandColor: '#458CF5',
  },
  {
    id: 'lookerstudio',
    name: 'Looker Studio',
    category: 'data',
    Icon: SiLooker,
    url: 'https://lookerstudio.google.com',
    brandColor: '#4285F4',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'data',
    Icon: SiHubspot,
    url: 'https://hubspot.com',
    brandColor: '#FF7A59',
  },
] as const

export const STACK_ORDER: readonly StackCategory[] = [
  'automation',
  'ai',
  'infrastructure',
  'development',
  'data',
] as const
