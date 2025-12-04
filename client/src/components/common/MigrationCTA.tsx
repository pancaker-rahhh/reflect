import { Link } from 'react-router-dom'

interface MigrationCTAProps {
  competitor?: string
}

export default function MigrationCTA({ competitor = 'Canny' }: MigrationCTAProps) {
  return (
    <div className="migration-cta" role="region" aria-label={`Migrate from ${competitor}`}>
      <h3>Switch from {competitor} to Reflect</h3>
      <p>
        Get a free migration assessment and checklist to move feedback, votes, and roadmap items
        quickly.
      </p>
      <Link to="/contact" className="btn btn-primary">
        Get migration plan
      </Link>
    </div>
  )
}
