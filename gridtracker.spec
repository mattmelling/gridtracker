Name:           {{{ git_name name=gridtracker }}}
Summary:        GridTracker: An amateur radio companion to WSJT-X or JTDX
Version:        {{{ git_version lead=1.22 }}}
Release:        1%{?dist}
BuildArch:      noarch
Source0:        {{{ git_dir_pack }}}

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
{{{ git_dir_setup_macro }}}

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
* Mon May 02 2022 Matthew Chambers <nr0q@gridtracker.org> - 1.22.0502-1
- [Bug Fixes]
  - Fixed broken Call Roster due to online assets being moved from a web server to Google Storage Bucket.
  - Don't highlight "CQ" rows if filtering by "CQ Only".
  - Resolved #126 Windows Installer script updated to fix issues with install location and missing registry keys
  - Resolved #124 removing IP-Geolocation when no all other means of locating failed, we now tell the user to
    start WSJT-X or enter a location  as Geo-Location services are costly and unreliable
  - Resolved #137 missing libatomic dependency in Linux DEB and RPM spec files
- [Enhancements]
  - Include version number in main window title
  - Call Roster colums refactored and wanted column added
* Fri Dec 17 2021 Matthew Chambers <nr0q@gridtracker.org> - 1.21.1217-1
- Changed to newer NWJS to fix upstream bug that caused media playback to fail.
* Sun Dec 12 2021 Matthew Chambers <nr0q@gridtracker.org> - 1.21.1212-1
- Release build with the call roster refactor code that's been in the works for some time.
- [Bug Fixes]
  - Fix #76, unfinished ignore CQ and ITU zones.
  - Improved handling of stations that are not in a valid DXCC (ie; /MM stations)
  - Improved handling of free text decodes that don't contain valid callsigns (ie "HI BOB" and "MERRY XMAS")
  - Fix how the Call Roster title bar counts are calculated.
- [Enhancements]
  - More clarity when a ULS Zip code falls in more then one county, replacing ~ with ? symbols and better tool tip message.
  - Fix #107, where the call roster timeout was longer then a single FT4 cycle.
  - Fix #91, CQ is always highlighted, no matter status of CQ Only.
  - Performance improvement by changing how call roster vars are handled ('let' vs 'var')
  - Build system improved to push to Arch AUR, building of Debian (.deb) packages and triggering
    of COPR RPM builds for Fedora/Cent/RHEL and their cousins.
* Thu Sep 30 2021 Matthew Chambers <nr0q@gridtracker.org> - 1.21.0928-1
- First attempt at repo grade RPM builds
