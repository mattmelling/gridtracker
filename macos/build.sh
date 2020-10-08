NWJS_VERSION=0.49.0

if [ ! -e build/macos/nwjs-v$NWJS_VERSION-osx-x64/nwjs.app ]; then
  echo "Downloading NWJS $NWJS_VERSION"
  mkdir -p build/macos
  cd build/macos
  curl -O https://dl.nwjs.io/v$NWJS_VERSION/nwjs-v$NWJS_VERSION-osx-x64.zip
  unzip nwjs-v$NWJS_VERSION-osx-x64.zip
  cd ../..
fi

mkdir -p dist
rm -rf dist/GridTracker.app
cp -r build/macos/nwjs-v$NWJS_VERSION-osx-x64/nwjs.app build/macos/GridTracker.app

mv build/macos/GridTracker.app/Contents/MacOS/nwjs build/macos/GridTracker.app/Contents/MacOS/GridTracker
cp -r package.nw build/macos/GridTracker.app/Contents/Resources/app.nw
cp -f macos/app.icns build/macos/GridTracker.app/Contents/Resources/app.icns
cp -f macos/app.icns build/macos/GridTracker.app/Contents/Resources/document.icns

sed -i "" -e "s/<string>nwjs<\/string>/<string>GridTracker<\/string>/g" build/macos/GridTracker.app/Contents/Info.plist
sed -i "" -e "s/<string>io\.nwjs\.nwjs<\/string>/<string>org.gridtracker.GridTracker<\/string>/g" build/macos/GridTracker.app/Contents/Info.plist
sed -i "" -e "s/<string>NWJS<\/string>/<string>GridTracker<\/string>/g" build/macos/GridTracker.app/Contents/Info.plist

sed -i "" -e "s/\"nwjs\"/\"GridTracker\"/g" build/macos/GridTracker.app/Contents/Resources/en.lproj/InfoPlist.strings

sed -i "" -e s/\"product_string\"/\"ignore_product_string\"/g build/macos/GridTracker.app/Contents/Resources/app.nw/package.json

mv build/macos/GridTracker.app dist

echo ""
echo "GridTracker has been packaged for distribution and is available as 'dist/GridTracker.app'"
echo ""
