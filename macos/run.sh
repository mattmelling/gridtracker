NWJS_VERSION=0.49.0
NWJS_FULL_NAME=nwjs-sdk-v$NWJS_VERSION-osx-x64

if [ ! -e build/macos/$NWJS_FULL_NAME/nwjs.app ]; then
  echo "Downloading NWJS $NWJS_VERSION ($NWJS_FULL_NAME)"
  mkdir -p build/macos
  cd build/macos
  curl -O https://dl.nwjs.io/v$NWJS_VERSION/$NWJS_FULL_NAME.zip
  unzip $NWJS_FULL_NAME.zip
  cd ../..
fi

# Disable `product_string` before running nwjs (see https://github.com/nwjs/nw.js/issues/7253)
sed -i "" -e s/\"product_string\"/\"ignore_product_string\"/g package.nw/package.json

# Give time (15 seconds) for nwjs to start and then restore `product_string`
( sleep 15 ; sed -i "" -e s/\"ignore_product_string\"/\"product_string\"/g package.nw/package.json ) &

build/macos/$NWJS_FULL_NAME/nwjs.app/Contents/MacOS/nwjs ./package.nw


