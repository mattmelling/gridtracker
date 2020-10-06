NWJS_VERSION=0.49.0

if [ ! -e build/macos/nwjs-v$NWJS_VERSION-osx-x64/nwjs.app ]; then
  echo "Downloading NWJS $NWJS_VERSION"
  mkdir -p build/macos
  cd build/macos
  curl -O https://dl.nwjs.io/v$NWJS_VERSION/nwjs-v$NWJS_VERSION-osx-x64.zip
  unzip nwjs-v$NWJS_VERSION-osx-x64.zip
  cd ../..
fi

sed -i "" -e s/\"product_string\"/\"ignore_product_string\"/g package.nw/package.json

build/macos/nwjs-v$NWJS_VERSION-osx-x64/nwjs.app/Contents/MacOS/nwjs ./package.nw

sed -i "" -e s/\"ignore_product_string\"/\"product_string\"/g package.nw/package.json
