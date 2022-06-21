export interface InstanceAdapter {
  id: string
  template: string
  running?: boolean
  phase?: string
  url?: string
  labels: Map<string, string>
}