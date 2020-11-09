BIN	= $(DESTDIR)/usr/bin
LIB	= $(DESTDIR)/usr/share/gridtracker
APP	= $(DESTDIR)/usr/share/applications
MAN	= $(DESTDIR)/usr/share/man/man1

all:

install:
	install -d $(BIN) $(LIB) $(APP) $(MAN)
	install -c -m 755 gridtracker.sh $(BIN)/gridtracker
	install -c -m 644 gridtracker.desktop $(APP)/gridtracker.desktop
	install -c -m 644 gridtracker.1 $(MAN)
	cp -r package.nw/* $(LIB)
