export interface InstanceAdapter {
  id: string
  template: string
  running?: boolean
  submitted?: boolean
  phase?: string
  url?: string
  labels: Map<string, string>
}