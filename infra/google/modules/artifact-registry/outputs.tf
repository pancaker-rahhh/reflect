output "repository_url" {
  description = "URL of the Artifact Registry repository"
  value       = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${data.google_project.project.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

data "google_project" "project" {}
