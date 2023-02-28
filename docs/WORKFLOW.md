GIT Workflow
============

1. Pull current master branch
2. Create branch describing what you do: `feat/<name>` or `bug/<description>`
3. Make your changes and commit changes grouped into logical sections, where every commit should always function. If
   there are bigger changes, which mean the current commit would not run, prefix the commit message with `WIP:`. Make
   good commit message[1]
4. Push your results to gitlab and open a merge request. You can also do this to deploy your version, if you are not
   done yet. If so, prefix the merge request with `WIP:`
5. Delete your local branch and the remote branch, if the branch is merged and the work on the branch is complete. You
   can also continue working on the branch, push again and make a new merge request on the same branch.

Merge Request
=============

Before creating a merge request, make sure to do the following things:

1. Run tests, linting and build: `cd frontend && npm run lint && npm run test && npm run build && ls build/index.html`
   and make sure it succeeds. If you skip that step, the CI pipeline will check these things for you and you may have 
   to interrupt your future work to fix some linting. If you changed code in the backend run 
   `cd backend && npm run lint && npm run test && npm run build`
2. Run E2E Tests (see E2E.md) or open most important pages and check for ERRORs in the logs.

[1]: https://github.com/RomuloOliveira/commit-messages-guide