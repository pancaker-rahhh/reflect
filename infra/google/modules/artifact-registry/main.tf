resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = var.repository_name
  description   = "Docker images for Reflect API"
  format        = "DOCKER"

  cleanup_policies {
    id     = "delete-prerelease"
    action = "DELETE"
    condition {
      tag_state    = "TAGGED"
      tag_prefixes = ["sha-"]
      older_than   = "604800s" # 7 days
    }
  }

  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-old-versions"
    action = "DELETE"
    condition {
      tag_state  = "TAGGED"
      older_than = "2592000s" # 30 days
    }
  }
}

resource "google_artifact_registry_repository_iam_member" "writer" {
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${var.service_account_email}"
}
