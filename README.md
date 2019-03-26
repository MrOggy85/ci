# CI
Simple Continuous Integration

Very basic attempt to make a personal CI for minimal use case.

## Background

I am running a server with all my apps on using docker. Since I'm a cheapskate I only have a server with 1 GB RAM. ~~This makes running Jenkins problematic~~ (actually with some swap the machine won't crash). And I can't use a cloud based CI since I will run into the same problem as this solution is currently addressing. 

I realized that I only needed a service that listens for a Githook and run a build script. Simple as pie. 

## Technical Description

There is only one endpoint: `/payload` which receives a POST request from Github.com when a push is made to `master`.

In the body of the request the `repository.id` is matched against known repos.

Github sends a sha1 encrypted secret signature in the Header which is matched against the expected secret.

## Usage

Currently the supported repos are hardcoded since there are only 2. The ID of the repo and Github secret is provided by ENV.

Each repo job has a corresponding script in the scripts folder which runs after successful authentication.

## Roadmap

* Support parallell jobs
