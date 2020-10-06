# MacOS-specific notes and instructions

# Development Environment

Gridtracker uses [NW](nwjs.io) (formerly known as node-webkit) to run.
Install the correct version of NW.js from (nwjs.io)[https://nwjs.io/] for your operating system.

To run the app, just call `macos/run.sh` from your local repository.

The script will download a copy of the right version of NWJS to the `build/macos` directory and use it to
run GridTracker from the source files.



# Building & Releasing

To package a version of GridTracker for distribution, update the NWJS version in `macos/build.sh` as needed
and run `./macos/build.sh` from the top level of your local repository.

The script will download a copy of NWJS and follow the steps described
[in the nwjs docs](https://nwjs.readthedocs.io/en/latest/For%20Users/Package%20and%20Distribute/)
to produce a `GridTracker.app` macOS application in the `dist` directory.



# Troubleshooting

### NWJS won't run GridTracker

If you see the error `"The display compositor is frequently crashing"` it's most likely because of
[this known issue](https://github.com/nwjs/nw.js/issues/7253) that requires `package.js` to
have a `product_string` value of `nwjs`, or not be present. The `macos/run.sh` script takes care of
this for you, but if you want to run it in a different way, you'll have to manually edit `package.json`
and remember not to commit those changes upstream.
