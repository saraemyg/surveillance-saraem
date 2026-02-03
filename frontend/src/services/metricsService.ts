import api from './api'
import { MetricsSummary, VideoMetrics, MetricsDetail, RecentActivity } from '@/types'

export const metricsService = {
  async getSummary(): Promise<MetricsSummary> {
    const response = await api.get<MetricsSummary>('/metrics/summary')
    return response.data
  },

  async getVideoMetrics(limit: number = 20): Promise<VideoMetrics[]> {
    const response = await api.get<VideoMetrics[]>('/metrics/videos', {
      params: { limit },
    })
    return response.data
  },

  async getAttributeMetrics(): Promise<MetricsDetail> {
    const response = await api.get<MetricsDetail>('/metrics/attributes')
    return response.data
  },

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await api.get<RecentActivity[]>('/metrics/recent-activity', {
      params: { limit },
    })
    return response.data
  },
}
