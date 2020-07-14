# Contributing

The Snowplow JavaScript Tracker is maintained by the Engineering team at Snowplow Analytics. We welcome suggestions for improvements and bug fixes to all Snowplow Trackers.  

We are extremely grateful for all contributions we receive, whether that is reporting an issue or a change to the code which can be made in the form of a pull request.

For support requests, please use our community support Discourse forum: https://discourse.snowplowanalytics.com/.

## Setting up an Environment

Instructions on how to build and run tests are available in the [README.md](README.md). The README will also list any requirements that you will need to install first before being able to build and run the tests.

You should ensure you are comfortable building and testing the existing release before adding new functionality or fixing issues.

## Issues

### Creating an issue

The project contains an issue template which should help guiding you through the process. However, please keep in mind that support requests should go to our Discourse forum: https://discourse.snowplowanalytics.com/ and not GitHub issues.

It's also a good idea to log an issue before starting to work on a pull request to discuss it with the maintainers. A pull request is just one solution to a problem and it is often a good idea to talk about the problem with the maintainers first.

### Working on an issue

If you see an issue you would like to work on, please let us know in the issue! That will help us in terms of scheduling and
not doubling the amount of work.

If you don't know where to start contributing, you can look at
[the issues labeled `good first issue`](https://github.com/snowplow/snowplow-javascript-tracker/labels/category%3Agood_first_issue).

## Pull requests

These are a few guidelines to keep in mind when opening pull requests.

### Guidelines

Please supply a good PR description. These are very helpful and help the maintainers to understand _why_ the change has been made, not just _what_ changes have been made.  

Please try and keep your PR to a single feature of fix. This might mean breaking up a feature into multiple PRs but this makes it easier for the maintainers to review and also reduces the risk in each change.

Please review your own PR as you would do it you were a reviewer first. This is a great way to spot any mistakes you made when writing the change. Additionally, ensure your code compiles and all tests pass.

### Commit hygiene

We keep a strict 1-to-1 correspondance between commits and issues, as such our commit messages are formatted in the following
fashion:

`Issue Description (closes #1234)`

for example:

`Fix Issue with Tracker (closes #1234)`

### Writing tests

Whenever necessary, it's good practice to add the corresponding tests to whichever feature you are working on.  
Any non-trivial PR must have tests and will not be accepted without them.

### Feedback cycle

Reviews should happen fairly quickly during weekdays.  
If you feel your pull request has been forgotten, please ping one or more maintainers in the pull request.

### Getting your pull request merged

If your pull request is fairly chunky, there might be a non-trivial delay between the moment the pull request is approved and the moment it gets merged. This is because your pull request will have been scheduled for a specific milestone which might or might not be actively worked on by a maintainer at the moment.

### Contributor license agreement

We require outside contributors to sign a Contributor license agreement (or CLA) before we can merge their pull requests.  
You can find more information on the topic in [the dedicated wiki page](https://github.com/snowplow/snowplow/wiki/CLA).  
The @snowplowcla bot will guide you through the process.

## Getting in touch

### Community support requests

Please do not log an issue if you are asking for support, all of our community support requests go through our Discourse forum: https://discourse.snowplowanalytics.com/.

Posting your problem there ensures more people will see it and you should get support faster than creating a new issue on GitHub. Please do create a new issue on GitHub if you think you've found a bug though!