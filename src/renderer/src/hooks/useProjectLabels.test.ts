import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProjectLabels } from './useProjectLabels'
import { DEFAULT_LABELS } from '@shared/constants'

const mockUnwatch = vi.fn()
const mockApi = {
  readSettings: vi.fn(),
  watchProjectDir: vi.fn().mockReturnValue(mockUnwatch)
}

;(window as any).api = mockApi

describe('useProjectLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.watchProjectDir.mockReturnValue(mockUnwatch)
  })

  it('returns DEFAULT_LABELS initially', () => {
    mockApi.readSettings.mockResolvedValue({})
    const { result } = renderHook(() => useProjectLabels())
    expect(result.current).toEqual(DEFAULT_LABELS)
  })

  it('loads labels from settings', async () => {
    const customLabels = [{ name: 'custom', color: '#ff0000' }]
    mockApi.readSettings.mockResolvedValue({ labels: customLabels })

    const { result } = renderHook(() => useProjectLabels())

    await waitFor(() => {
      expect(result.current).toEqual(customLabels)
    })
  })

  it('falls back to defaults when readSettings fails', async () => {
    mockApi.readSettings.mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useProjectLabels())

    await waitFor(() => {
      expect(mockApi.readSettings).toHaveBeenCalled()
    })
    expect(result.current).toEqual(DEFAULT_LABELS)
  })

  it('updates when labels-updated event fires', async () => {
    mockApi.readSettings.mockResolvedValue({ labels: DEFAULT_LABELS })

    const { result } = renderHook(() => useProjectLabels())

    await waitFor(() => {
      expect(mockApi.readSettings).toHaveBeenCalled()
    })

    const newLabels = [{ name: 'updated', color: '#00ff00' }]
    act(() => {
      window.dispatchEvent(new CustomEvent('labels-updated', { detail: newLabels }))
    })

    await waitFor(() => {
      expect(result.current).toEqual(newLabels)
    })
  })

  it('handles empty labels array from settings', async () => {
    mockApi.readSettings.mockResolvedValue({ labels: [] })

    const { result } = renderHook(() => useProjectLabels())

    await waitFor(() => {
      expect(result.current).toEqual([])
    })
  })

  it('re-fetches labels when file watcher fires', async () => {
    mockApi.readSettings.mockResolvedValue({ labels: DEFAULT_LABELS })

    renderHook(() => useProjectLabels())

    await waitFor(() => {
      expect(mockApi.readSettings).toHaveBeenCalledOnce()
    })

    // Simulate file watcher callback
    const updatedLabels = [{ name: 'fromcli', color: '#ff0000' }]
    mockApi.readSettings.mockResolvedValue({ labels: updatedLabels })

    const watchCallback = mockApi.watchProjectDir.mock.calls[0][0]
    await act(async () => {
      watchCallback()
    })

    await waitFor(() => {
      expect(mockApi.readSettings).toHaveBeenCalledTimes(2)
    })
  })

  it('cleans up watcher on unmount', () => {
    mockApi.readSettings.mockResolvedValue({})

    const { unmount } = renderHook(() => useProjectLabels())
    unmount()

    expect(mockUnwatch).toHaveBeenCalled()
  })
})
