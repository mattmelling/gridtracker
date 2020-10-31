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
