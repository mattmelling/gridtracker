# About GridTracker

# Developing GridTracker

GridTracker runs using [NWJS](https://nwjs.io/), a tools that wraps both Chrome windows and node processes into
a native application.

To work on GridTracker you need to clone this git repository and then invoke NWJS with the contents of `package.nw`.

NWJS comes in two flavors, "normal" and "sdk". GridTracker is distributed with the normal flavor,
but for development work we recommend the SDK flavor because it provides access to Chrome's Developer Tools,
among other things.

### Code Formatting

We use `prettier` to enforce code formatting rules, and we follow
the [JavaScript Standard Style](https://standardjs.com/)

You can use all kinds of plugins and configurations in your text editor to verify these rules, and even reformat code
automatically, but if you want to run on the command line, you can (after running `npm install`) run the
`npm run prettier-check` command to verify the formatting of all files, or `npm run prettier-write` to reformat
all files to match the standard.

If you want to know more about why these tools are useful,
[watch this talk](https://www.youtube.com/watch?v=kuHfMw8j4xk)

# Developer Environment Setup

## Developing on Windows

To access the Developer Tools, right-click on an unused area of a window, or press F12.

## Developing on Linux

To access the Developer Tools, right-click on an unused area of a window, or press F12.

## Developing on Mac

We suggest using the `macos/run.sh` script to launch GridTracker while developing. It will download the sdk flavor
of NWJS if needed, and use it to run the app.

To access the Developer Tools, right-click on an unused area of a window, or press F12.

# Building for Distribution

## Docker Build Environment

The following code uses docker to create a build environment for packaging
GridTracker for distribution. It can be used to support, or in lieu of,
GitLab's CI/CD chain.

- `docker/run-docker.sh`
  1. Build a build-environment container. This container does NOT carry the source code
     of GridTracker inside it, it is merely a build container.
  2. Execute the build container, linking it up to the current directory and `../gridtracker-dist`

- `docker/build-all.sh`
  1. Package the full debian release for gridtracker (which does not require binaries).
  2. Build npmjs+gridtracker native binaries for Win (32, 64) including installers,
     Mac OS (Intel 64), and Linux (I386 and AMD64) binaries.
     THe Linux binaries are for use in non-debian/raspbian/ubuntu distributions.

TODO:
  3. Package up a release for Fedora/RPM distributions.

Temporary artifacts are left in:
        gridtracker/node_modules (including cached copies of npmjs binaries)
        gridtracker/package-json.lock

Final build results are left in:
        gridtracker-dist/
        gridtracker-dist/debian
