# Build with the following syntax:
#
# version=`node ./version.js`
# rpmbuild -D "version ${version}" --build-in-place -bb --target noarch gridtracker.spec

Name:           gridtracker
Summary:        GridTracker: An amateur radio companion to WSJT-X or JTDX
Version:        %{version}
Release:        1%{?dist}
BuildArch:	noarch

License:        BSD 3-Clause License
URL:            https://gridtracker.org
Group:          Science & Math
Packager:       Matthew Chambers
Requires:	nwjs
# BuildRequires:	desktop-file-utils

%description
GridTracker listens to traffic from WSJT-X/JTDX, displays it on a map,
and has a sophisticated alerting and filtering system for finding and
working interesting stations. It also will upload QSO records to multiple
logging frameworks including Logbook of the World.

%prep
mkdir -pv ${RPM_BUILD_ROOT}

%build
make

%install
make install DESTDIR=${RPM_BUILD_ROOT}

%check
# desktop-file-validate desktop-file-validate %{buildroot}/%{_datadir}/applications/%{name}.desktop

%clean
make clean

%files
%{_bindir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/%{name}/
%{_mandir}/man1/%{name}.1*
%license %{_docdir}/%{name}/LICENSE
