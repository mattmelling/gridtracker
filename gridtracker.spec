Name:           gridtracker
Summary:        GridTracker: An amateur radio companion to WSJT-X or JTDX
Version:        1.21.1212
Release:        1%{?dist}
BuildArch:      noarch
Source0:        %{name}-%{version}.tar.gz

License:        BSD 3-Clause License
URL:            https://gridtracker.org
Group:          Science & Math
Packager:       Matthew Chambers <nr0q@gridtracker.org>
Requires:       nwjs
BuildRequires:  desktop-file-utils make nodejs

%description
GridTracker listens to traffic from WSJT-X/JTDX, displays it on a map,
and has a sophisticated alerting and filtering system for finding and
working interesting stations. It also will upload QSO records to multiple
logging frameworks including Logbook of the World.

%prep
%setup -q GridTracker

%build

%install
DESTDIR=${RPM_BUILD_ROOT} make NO_DIST_INSTALL=true install

%check

%clean
DESTDIR=${RPM_BUILD_ROOT} make clean

%files
%{_datadir}/%{name}/
%{_datadir}/applications/%{name}.desktop
%{_datadir}/%{name}/
%{_bindir}/%{name}
%{_mandir}/man1/
%license %{_docdir}/%{name}/

%changelog
* Sun Dec 13 2021 Matthew Chambers <nr0q@gridtracker.org> - 1.21.1212-1
- Release with refactored Call Roster code and minor improvements.
* Thu Sep 30 2021 Matthew Chambers <nr0q@gridtracker.org> - 1.21.0928-1
- First attempt at repo grade RPM builds
