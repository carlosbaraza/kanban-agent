import { useUIStore } from '@renderer/stores/ui-store'
import styles from './Header.module.css'

interface HeaderProps {
  projectName: string
}

export function Header({ projectName }: HeaderProps): React.JSX.Element {
  const { filters, setFilter, clearFilters } = useUIStore()

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.priority.length > 0 ||
    filters.labels.length > 0 ||
    filters.agentStatus.length > 0

  return (
    <header className={styles.header}>
      <span className={styles.projectName}>{projectName}</span>

      <div className={styles.searchArea}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <button
          className={`${styles.filterButton} ${filters.priority.length > 0 ? styles.filterButtonActive : ''}`}
          onClick={() => {
            if (filters.priority.length > 0) {
              setFilter('priority', [])
            } else {
              setFilter('priority', ['urgent', 'high'])
            }
          }}
        >
          Priority
        </button>

        <button
          className={`${styles.filterButton} ${filters.agentStatus.length > 0 ? styles.filterButtonActive : ''}`}
          onClick={() => {
            if (filters.agentStatus.length > 0) {
              setFilter('agentStatus', [])
            } else {
              setFilter('agentStatus', ['running'])
            }
          }}
        >
          Agent
        </button>

        {hasActiveFilters && (
          <button className={styles.clearFilters} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>
    </header>
  )
}
