.DEFAULT_GOAL := help

DESTDIR ?= ./build
BIN ?= $(DESTDIR)/usr/bin
LIB ?= $(DESTDIR)/usr/share/gridtracker
APP ?= $(DESTDIR)/usr/share/applications
MAN ?= $(DESTDIR)/usr/share/man/man1
DOC ?= $(DESTDIR)/usr/share/doc/gridtracker

.PHONY: help
help:
	@echo "Specify a target to build:"
	@echo "  -> make install"
	@echo "    install gridtracker in DESTDIR (default: ./build)"
	@echo "  -> make clean"
	@echo "    remove built files from DESTDIR"

.PHONY: clean
clean:
	@echo "Cleaning $(DESTDIR)..."
	rm -rf $(DESTDIR)/*

.PHONY: install
install:
	@echo "Installing gridtracker in $(DESTDIR)..."
	install -Dcm 755 gridtracker.sh $(BIN)/gridtracker
	install -Dcm 644 gridtracker.desktop $(APP)/gridtracker.desktop
	install -Dcm 644 gridtracker.1 $(MAN)/gridtracker.1
	install -Dcm 644 LICENSE $(DOC)/LICENSE
	mkdir -p $(LIB)
	cp -r package.nw/* $(LIB)

