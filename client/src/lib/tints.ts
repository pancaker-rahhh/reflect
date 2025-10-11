export function getTintByScoreOutOfFive(score?: number) {
    if (score == null) return 'tint-neutral'
    if (score >= 4.5) return 'tint-success'
    if (score >= 3) return 'tint-info'
    if (score >= 2) return 'tint-warning'
    return 'tint-danger'
}

export function getTintByScoreOutOfTen(score?: number) {
    if (score == null) return 'tint-neutral'
    if (score >= 4.5) return 'tint-success'
    if (score >= 3) return 'tint-info'
    if (score >= 2) return 'tint-warning'
    return 'tint-danger'
}
  