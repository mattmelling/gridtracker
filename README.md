# About GridTracker

# Developing GridTracker

GridTracker runs using [NWJS](https://nwjs.io/), a tools that wraps both Chrome windows and node processes into a native application.

To work on GridTracker you need to clone this git repository and then invoke NWJS with the contents of `package.nw`.

NWJS comes in two flavors, "normal" and "sdk". GridTracker is distributed with the normal flavor, but for development work
we recommend the SDK flavor because it provides access to Chrome's Developer Tools, among other things.

## Developing on Windows

To access the Developer Tools, right-click on an unused area of a window, or press F12.

## Developing on Linux

To access the Developer Tools, right-click on an unused area of a window, or press F12.

## Developing on Mac

We suggest using the `macos/run.sh` script to launch GridTracker while developing. It will download the sdk flavor of NWJS if needed,
and use it to run the app.

To access the Developer Tools, right-click on an unused area of a window, or press F12.
