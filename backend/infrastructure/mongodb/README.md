# MongoDB infrastructure

The root `docker-compose.yml` runs MongoDB for the Auth Service on the private backend network. The Compose service name is `mongodb`; the Auth Service receives its connection URI through `MONGODB_URI`.

MongoDB initialization scripts or migration tooling can be added here when the data model is defined. No database client library is installed in this scaffold.
