#!/bin/bash
apt-get -y build-dep .
dpkg-buildpackage -uc -us
test -d ../dist/debian || mkdir -p ../dist/debian
mv ../*.{deb,dsc,buildinfo,changes,tar.xz} ../dist/debian
debian/rules clean
npm install
npm run dist
mv package.nw/dist/*.{exe,7z,zip,json} ../dist
