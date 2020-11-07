#!/bin/sh
# Build a docker environment and run it to do the build
docker build -t gridtracker-build docker
test -d ../gridtracker-dist || mkdir ../gridtracker-dist
docker run --rm \
    -v `/bin/pwd`:/build/gridtracker \
    -v `/bin/pwd`/../gridtracker-dist:/build/dist \
    gridtracker-build $*
