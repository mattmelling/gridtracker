# Build with the following syntax:
#
# version=`node ./version.js`
# rpmbuild -D "version ${version}" --build-in-place -bb --target i386 gridtracker.i386.spec

Name:           gridtracker
Summary:        GridTracker: An amateur radio companion to WSJT-X or JTDX
Version:        %{version}
Release:        1%{?dist}
BuildArch:	   i386
Source0:        GridTracker-%{version}-linux-x86.tar.gz

License:        BSD 3-Clause License
URL:            https://gridtracker.org
Group:          Science & Math
Packager:       Matthew Chambers <nr0q@gridtracker.org>
# Requires:	nwjs
# BuildRequires:	desktop-file-utils

%description
GridTracker listens to traffic from WSJT-X/JTDX, displays it on a map,
and has a sophisticated alerting and filtering system for finding and
working interesting stations. It also will upload QSO records to multiple
logging frameworks including Logbook of the World.

%prep
%setup -n GridTracker

#%build


%install
mkdir -p ${RPM_BUILD_ROOT}/usr/share/%{name}
cp -aR dist/*-linux-x86/* ${RPM_BUILD_ROOT}/usr/share/%{name}/
mkdir -p ${RPM_BUILD_ROOT}%{_mandir}/man1
cp -a %{name}.1 ${RPM_BUILD_ROOT}%{_mandir}/man1/
mkdir -p ${RPM_BUILD_ROOT}%{_docdir}/%{name}
cp -a LICENSE ${RPM_BUILD_ROOT}%{_docdir}/%{name}/
mkdir -p ${RPM_BUILD_ROOT}/usr/share/applications
cat > ${RPM_BUILD_ROOT}/usr/share/applications/%{name}.desktop << 'EOF'
[Desktop Entry]
Name=GridTracker
Comment=GridTracker
Exec=/usr/share/%{name}/GridTracker
Icon=/usr/share/%{name}/gridtracker.png
Path=/usr/share/%{name}
Type=Application
Encoding=UTF-8
Terminal=false
Categories=DataVisualization,Geography,Education;
EOF

chmod 755 ${RPM_BUILD_ROOT}/usr/share/%{name}/; chmod 755 ${RPM_BUILD_ROOT}/usr/share/%{name}/GridTracker; chmod 755 ${RPM_BUILD_ROOT}/usr/share/%{name}/lib; chmod 755 ${RPM_BUILD_ROOT}/usr/share/%{name}/locales
find ${RPM_BUILD_ROOT}/usr/share/ -type f \( -name '*.so' -o -name '*.so.*' \) -exec chmod 755 {} +

# %check

# %clean

%files
/usr/share/%{name}/
/usr/share/applications/%{name}.desktop
%{_datadir}/%{name}/
%{_mandir}/man1/
%license %{_docdir}/%{name}/
