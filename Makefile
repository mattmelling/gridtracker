BIN	= $(DESTDIR)/usr/bin
LIB	= $(DESTDIR)/usr/share/gridtracker
APP	= $(DESTDIR)/usr/share/applications
MAN	= $(DESTDIR)/usr/share/man/man1
DOC	= $(DESTDIR)/usr/share/doc/gridtracker

all:

clean:

install:
	install -d $(BIN) $(LIB) $(APP) $(MAN) $(DOC)
	install -c -m 755 gridtracker.sh $(BIN)/gridtracker
	install -c -m 644 gridtracker.desktop $(APP)/gridtracker.desktop
	install -c -m 644 gridtracker.1 $(MAN)
	install -c -m 644 LICENSE $(DOC)
	cp -r package.nw/* $(LIB)
