#!/bin/bash
apt-get -y build-dep .
dpkg-buildpackage -uc -us
test -d ../dist/debian || mkdir -p ../dist/debian
test -d ../dist/rpm || mkdir -p ../dist/rpm
mv ../*.{deb,dsc,buildinfo,changes,tar.xz} ../dist/debian
debian/rules clean
npm install
npm run dist
chmod 755 dist/*-linux-*/GridTracker dist/*-linux-*/lib dist/*-linux-*/locales dist/*-linux-*/swiftshader/
for dir in dist/*-linux-* ; do
    if [ -d $dir ] ; then
#        mkdir $dir/package.nw
#        for file in package.nw/* ; do
#          if [ `basename $file` = "lib" ] ; then
#            continue      # skip lib dir
#          fi
#          mv $dir/`basename $file` $dir/package.nw
#        done
#        pushd .
#        cd $dir/package.nw
#        zip ../package.nw.zip -r *
#        popd
#        rm -Rf $dir/package.nw
#        mv $dir/package.nw.zip $dir/package.nw
        tar -C dist -czf ${dir}.tar.gz `basename $dir`
    fi
done
mv dist/*{.exe,mac-x64.zip,.tar.gz} ../dist
rpmbuild -D "version `node ./version.js`" --build-in-place -bb gridtracker.i386.spec
rpmbuild -D "version `node ./version.js`" --build-in-place -bb gridtracker.x86_64.spec
mv $HOME/rpmbuild/RPMS/i386/gridtracker-*.i386.rpm ../dist/rpm
mv $HOME/rpmbuild/RPMS/x86_64/gridtracker-*.x86_64.rpm ../dist/rpm
