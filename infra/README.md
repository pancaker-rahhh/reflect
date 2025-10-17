## Manual Implementation Required -

1. Create fine-grained ServiceAccount for CI/CD pipelines by running the script `/scripts/setup-ci-cd-permissions.sh` and supplying required values for the variables mentioned in the script.
2. Create a key (command will be provided after running the script).
3. Create GitHub secret for this variable as dictated after running the script.
4. Also create GitHub secrets - for DATABASE_URL and DOCKER_IMAGE_TAG.