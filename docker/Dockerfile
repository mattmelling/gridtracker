# Generic builder environment for GridTracker using nwjs-builder-phoenix and debian.
# NOTE: We assume an amd64 environment that is capable of running i386 and wine (which
# are needed for resource hacking for Windows.

FROM debian:buster
RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y npm wine wine32 && \
    apt-get install -y build-essential devscripts lintian diffutils patch \
            patchutils quilt git && \
    apt-get install -y rpm zip nsis nsis nsis-pluginapi wget
RUN wget https://nsis.sourceforge.io/mediawiki/images/4/47/Registry.zip && \
    unzip Registry.zip && \
    mv Desktop/Plugin/registry.dll /usr/share/nsis/Plugins/x86-unicode/ && \
    mv Desktop/Include/Registry.nsh /usr/share/nsis/Include/

VOLUME /build/gridtracker
VOLUME /build/dist

WORKDIR /build/gridtracker
CMD docker/build-all.sh
