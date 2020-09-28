BIN	= $(DESTDIR)/usr/bin
LIB	= $(DESTDIR)/usr/share/gridtracker
APP	= $(DESTDIR)/usr/share/applications

all:

install:
	install -d $(BIN) $(LIB) $(APP)
	install -c -m 755 debian/gridtracker.sh $(BIN)/gridtracker
	install -c -m 644 debian/gridtracker.desktop $(APP)/gridtracker.desktop
	cp -r package.nw/* $(LIB)
