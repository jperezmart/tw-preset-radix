---
'tw-preset-radix': patch
---

Add npm version and license badges to the README.

The README ships in the tarball and is what npmjs.com renders, so this reaches
the registry page rather than only GitHub. The version badge reads live from the
registry, which makes "what is actually published right now" answerable at a
glance and removes a number nobody has to remember to update.

This is also the first release under the publishing standard: changesets plus npm
OIDC trusted publishing, with provenance and no npm token anywhere.
