# Shared contracts

This is source-only TypeScript shared by the backend services. It currently contains service names and the health response shape. Services import the source by relative path, and each Dockerfile copies it into the image. There is no package manifest, lockfile, third-party dependency, or install step here.

Keep service-specific business logic and configuration inside the owning service. Add a package manifest only if this needs to become an independently versioned or dependency-bearing package.
