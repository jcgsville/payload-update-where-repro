# Payload Update Where Bug Repro

A minimal repro for what I think is a bug in Payload's update() API.

I created this repro using `pnpx create-payload-app@latest -t blank`. You can see my changes by comparing to the intial commit.

How to reproduce:

- Point your development environment to a Postgres database with the `DATABASE_URI` environment variable.
- Run `pnpm dev`
- Visit the following URL in a browser: `http://localhost:3000/combined?count=50`
- Note that in the JSON response, finalCount should be 50, but it likely is not 50
- If necessary, refresh a few times to show the behavior

What's going on here?

In Payload's `update()` API when the `where` arg is used, the Payload code uses a Promise.all() to perform the update query on all documents that are selected for update.

I don't know why this happens, but my observation is that using promise.all() with anything in payload that touches the db connection can result in behavior where the values are not committed to the database correctly. `update({ where })` is the example of this behavior I have found that fairly reliably reproduces it.

I tested this against a neon Postgres database in the cloud and against a Postgres.app database running locally on my mac. The behavior is the same.
