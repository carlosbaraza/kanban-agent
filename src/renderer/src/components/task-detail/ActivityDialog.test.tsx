import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityDialog } from './ActivityDialog'
import type { ActivityEntry } from '@shared/types'

vi.mock('./ActivityEntry', () => ({
  ActivityEntryComponent: ({ entry }: any) => (
    <div data-testid="activity-entry">{entry.message}</div>
  )
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

describe('ActivityDialog', () => {
  const defaultProps = {
    entries: mockEntries,
    noteText: '',
    sending: false,
    onNoteTextChange: vi.fn(),
    onAddNote: vi.fn(),
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all activity entries', () => {
    render(<ActivityDialog {...defaultProps} />)

    const entries = screen.getAllByTestId('activity-entry')
    expect(entries).toHaveLength(2)
    expect(screen.getByText('Task created')).toBeInTheDocument()
    expect(screen.getByText('Started implementation')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(<ActivityDialog {...defaultProps} entries={[]} />)
    expect(screen.getByText('No activity yet')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<ActivityDialog {...defaultProps} />)
    fireEvent.click(screen.getByText('\u00D7'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay is clicked', () => {
    const { container } = render(<ActivityDialog {...defaultProps} />)
    // Click the overlay (first child)
    fireEvent.click(container.firstChild!)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('does not call onClose when dialog body is clicked', () => {
    render(<ActivityDialog {...defaultProps} />)
    fireEvent.click(screen.getByText('Activity Log'))
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    render(<ActivityDialog {...defaultProps} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('renders note input', () => {
    render(<ActivityDialog {...defaultProps} />)
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument()
  })

  it('calls onNoteTextChange when typing', () => {
    render(<ActivityDialog {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Add a note...'), {
      target: { value: 'hello' }
    })
    expect(defaultProps.onNoteTextChange).toHaveBeenCalledWith('hello')
  })

  it('calls onAddNote when Enter is pressed in input', () => {
    render(<ActivityDialog {...defaultProps} noteText="test note" />)
    fireEvent.keyDown(screen.getByPlaceholderText('Add a note...'), { key: 'Enter' })
    expect(defaultProps.onAddNote).toHaveBeenCalled()
  })

  it('disables send button when noteText is empty', () => {
    render(<ActivityDialog {...defaultProps} />)
    expect(screen.getByText('Send')).toBeDisabled()
  })

  it('enables send button when noteText has content', () => {
    render(<ActivityDialog {...defaultProps} noteText="hello" />)
    expect(screen.getByText('Send')).not.toBeDisabled()
  })

  it('disables input when sending', () => {
    render(<ActivityDialog {...defaultProps} sending={true} />)
    expect(screen.getByPlaceholderText('Add a note...')).toBeDisabled()
  })
})
