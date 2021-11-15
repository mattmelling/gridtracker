# About GridTracker

GridTracker is designed for Amateur radio use. It's original tag-line was:   "GridTracker listens to traffic from WSJT-X and displays it on a map. It will also load ADIF log files".
This was back in February of 2018.  At its core GridTracker has remained true to that description but it has evolved to be a very powerful amateur radio tool and not just for FT8.
GridTracker is a warehouse of amateur radio information presented in an easy to use interface, from live traffic decodes, logbooks, spot reports, weather, current solar conditions and more.
[Read more](https://gitlab.com/gridtracker.org/gridtracker/-/wikis/Introduction/What-is-GridTracker)

See the [Wiki](https://gitlab.com/gridtracker.org/gridtracker/-/wikis/home) for the user documentation.

# Getting GridTracker
GridTracker can be downloaded for nearly all common platforms (Windows, MacOS, Linux, Raspberry Pi) from the [downloads](https://gridtracker.org/downloads/) page on our website GridTracker.org.

# Developing GridTracker

GridTracker runs using [NWJS](https://nwjs.io/), a tools that wraps both Chrome windows and node processes into
a native application.

To work on GridTracker you need to clone this git repository and then invoke NWJS with the contents of `package.nw`.

NWJS comes in two flavors, "normal" and "sdk". GridTracker is distributed with the normal flavor,
but for development work we recommend the SDK flavor because it provides access to Chrome's Developer Tools,
among other things.

### Code Formatting

We use `eslint` to enforce code formatting rules.

You can use all kinds of plugins and configurations in your text editor to verify these rules, and even reformat code
automatically, but if you want to run on the command line, you can (after running `npm install`) run the
`npm run lint-check` command to verify the formatting of all files, or `npm run lint-fix` to reformat all files to match the standard.

# Developer Environment Setup

Our builds and development environment are usually managed by [nwjs-builder-phoenix](https://github.com/evshiron/nwjs-builder-phoenix), but it only supports Intel-based architectures.

## x86-based Windows, Mac, Linux

Run `npm install` and then `npm start`

## Apple Silicon Macs (M1, M1 Pro, M1 Max)

Phoenix does not support ARM-based macs, so we have to explicitly tell it to use Intel-based versions of NWJS.

Run `npm install` and then `npm start-x64`

## ARM-based Raspberry

Run `npm install`.

Install the SDK version of the [unofficial NWJS for ARM](https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases)

For example, by running these commands in the parent directory containing your local copy of the GridTracker repository.
```
mkdir -p nwjs && cd nwjs
wget https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases/download/nw49_2020-11-22/nw49_2020-11-22.tar.gz
tar zxvf nw49_2020-11-22.tar.gz
cd usr/docker/dist/nwjs-sdk-chrome-ffmpeg-branding
tar zxvf nwjs-sdk-v0.49.3-linux-arm.tar.gz
mv nwjs-sdk-v0.49.3-linux-arm ../../../nwjs-sdk
cd ..
```

And now you can run GridTracker from your local repository with a command like
```
../nwjs/nwjs-sdk/nw ./package.nw
```

# Developer Tips

To access the Developer Tools, right-click on an unused area of a window, or press F12.

In the map window, most of the right column background areas will respond with the developer context menu.

In the roster window, only the "Transmit/Receive" indicator on the left side, and the "more controls" link on the right
will respond with the developer context menu.

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

# Editing GeoJSON files

We've had success using https://vector.rocks/ and then cleaning up the output with https://jsonformatter.org/
