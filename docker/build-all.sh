#!/bin/bash
apt-get -y build-dep .
dpkg-buildpackage -uc -us
test -d ../dist/debian || mkdir -p ../dist/debian
test -d ../dist/rpm || mkdir -p ../dist/rpm
mv ../*.{deb,dsc,buildinfo,changes,tar.xz} ../dist/debian
debian/rules clean
npm install
npm run dist-win
npm run dist-nix
chmod 755 dist/*-linux-*/GridTracker dist/*-linux-*/lib dist/*-linux-*/locales dist/*-linux-*/swiftshader/
for dir in dist/*-linux-* ; do
    if [ -d $dir ] ; then
        tar -C dist -czf ${dir}.tar.gz `basename $dir`
    fi
done
for dir in dist/*-win-* ; do
    if [ -d $dir ] ; then
        mkdir $dir/package.nw
        for file in package.nw/* ; do
          mv $dir/`basename $file` $dir/package.nw
        done
    elif [  -f $dir ] && [[ "$dir" == *"win-x86-Setup.exe"* ]] ; then
      echo "would delete broken installer $dir"
      # rm $dir
    fi
done
pwd
sed "s#GridTracker-1.21.0307-win-x86/#`pwd`/dist/GridTracker-1.21.0307-win-x86/#g" windows/setup.nsi.tmpl > windows/setup.nsi.tmp
sed "s#GridTracker-Installer.#`pwd`/dist/GridTracker-Installer.#g" windows/setup.nsi.tmp > windows/setup.nsi
makensis windows/setup.nsi
# clean up generated files
rm windows/setup.nsi
rm windows/setup.nsi.tmp

mv dist/*{.exe,mac-x64.zip,.tar.gz} ../dist
rpmbuild -D "version `node ./version.js`" --build-in-place -bb gridtracker.i386.spec
rpmbuild -D "version `node ./version.js`" --build-in-place -bb gridtracker.x86_64.spec
mv $HOME/rpmbuild/RPMS/i386/gridtracker-*.i386.rpm ../dist/rpm
mv $HOME/rpmbuild/RPMS/x86_64/gridtracker-*.x86_64.rpm ../dist/rpm
