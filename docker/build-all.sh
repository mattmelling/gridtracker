#!/bin/bash
apt-get -y build-dep .
dpkg-buildpackage -uc -us
test -d ../dist/debian || mkdir -p ../dist/debian
test -d ../dist/rpm || mkdir -p ../dist/rpm
mv ../*.{deb,dsc,buildinfo,changes,tar.xz} ../dist/debian
debian/rules clean
npm install
npm run dist
for dir in dist/*-linux-* ; do
    if [ -d $dir ] ; then
        tar -C dist -cjf ${dir}.tar.bz `basename $dir`
    fi
done
mv dist/*{.exe,mac-x64.zip,.tar.bz} ../dist
rpmbuild -D "version `node ./version.js`" --build-in-place -bb gridtracker.spec
mv $HOME/rpmbuild/RPMS/noarch/gridtracker-*.noarch.rpm ../dist/rpm
