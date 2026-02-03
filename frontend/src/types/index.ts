export * from './auth.types'
export * from './video.types'
export * from './detection.types'
export * from './search.types'

export interface Camera {
  camera_id: number
  camera_name: string
  location: string | null
  resolution: string | null
  fps: number | null
  mask_file_path: string | null
  is_active: boolean
  created_at: string
}

export interface MetricsSummary {
  total_videos: number
  total_detections: number
  average_fps: number
  average_area_reduction: number
  total_processing_time: number
}

export interface VideoMetrics {
  video_id: number
  filename: string
  avg_fps: number | null
  total_detections: number
  processing_time_seconds: number | null
  area_reduction_percentage: number | null
  recorded_at: string
}

export interface GenderDistribution {
  male: number
  female: number
  unknown: number
}

export interface ColorDistribution {
  color: string
  count: number
}

export interface MetricsDetail {
  summary: MetricsSummary
  gender_distribution: GenderDistribution
  upper_color_distribution: ColorDistribution[]
  lower_color_distribution: ColorDistribution[]
}

export interface RecentActivity {
  video_id: number
  filename: string
  status: string
  timestamp: string
  detection_count: number
  processing_time: number | null
  duration: number | null
}

export interface APIResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
