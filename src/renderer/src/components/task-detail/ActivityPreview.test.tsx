import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActivityPreview } from './ActivityPreview'
import type { ActivityEntry } from '@shared/types'

vi.mock('./ActivityDialog', () => ({
  ActivityDialog: ({ entries, onClose }: any) => (
    <div data-testid="activity-dialog">
      <span>Dialog with {entries.length} entries</span>
      <button data-testid="dialog-close" onClick={onClose}>
        Close
      </button>
    </div>
  )
}))

vi.mock('@renderer/lib/file-change-hub', () => ({
  onFileChange: vi.fn().mockReturnValue(() => {})
}))

const mockEntries: ActivityEntry[] = [
  {
    id: 'a1',
    timestamp: '2026-01-01T00:00:00.000Z',
    type: 'created',
    message: 'Task created'
  },
  {
    id: 'a2',
    timestamp: '2026-01-01T01:00:00.000Z',
    type: 'note',
    message: 'Started implementation'
  }
]

const mockApi = {
  readTaskActivity: vi.fn(),
  appendActivity: vi.fn(),
  watchProjectDir: vi.fn().mockReturnValue(() => {})
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(window as any).api = { ...((window as any).api ?? {}), ...mockApi }
  mockApi.readTaskActivity.mockResolvedValue(mockEntries)
  mockApi.appendActivity.mockResolvedValue(undefined)
})

describe('ActivityPreview', () => {
  it('shows last activity entry', async () => {
    render(<ActivityPreview taskId="tsk_abc" />)

    await waitFor(() => {
      expect(screen.getByText('Started implementation')).toBeInTheDocument()
    })
  })

  it('shows "No activity yet" when empty', async () => {
    mockApi.readTaskActivity.mockResolvedValue([])
    render(<ActivityPreview taskId="tsk_abc" />)

    await waitFor(() => {
      expect(screen.getByText('No activity yet')).toBeInTheDocument()
    })
  })

  it('shows entry count in expand button', async () => {
    render(<ActivityPreview taskId="tsk_abc" />)

    await waitFor(() => {
      expect(screen.getByText('View all (2)')).toBeInTheDocument()
    })
  })

  it('opens dialog when expand button is clicked', async () => {
    render(<ActivityPreview taskId="tsk_abc" />)

    await waitFor(() => {
      expect(screen.getByText('View all (2)')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('View all (2)'))

    expect(screen.getByTestId('activity-dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog with 2 entries')).toBeInTheDocument()
  })

  it('closes dialog when close is clicked', async () => {
    render(<ActivityPreview taskId="tsk_abc" />)

    await waitFor(() => {
      expect(screen.getByText('View all (2)')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('View all (2)'))
    expect(screen.getByTestId('activity-dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('dialog-close'))
    expect(screen.queryByTestId('activity-dialog')).not.toBeInTheDocument()
  })

  it('loads activity for the given taskId', async () => {
    render(<ActivityPreview taskId="tsk_xyz" />)

    await waitFor(() => {
      expect(mockApi.readTaskActivity).toHaveBeenCalledWith('tsk_xyz')
    })
  })

  it('shows "View" button when no entries', async () => {
    mockApi.readTaskActivity.mockResolvedValue([])
    render(<ActivityPreview taskId="tsk_abc" />)

    await waitFor(() => {
      expect(screen.getByText('View')).toBeInTheDocument()
    })
  })
})
