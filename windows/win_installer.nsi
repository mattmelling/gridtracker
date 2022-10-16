/*
    GridTracker Installation Script
*/

# Installer Attributes
RequestExecutionLevel highest
SetCompressor /SOLID LZMA
Unicode true
!include Sections.nsh
!include Registry.nsh
!include LogicLib.nsh
ReserveFile "${NSISDIR}/Plugins/x86-unicode/registry.dll"
CRCCheck on


# Define Common Variables
!define NAME "GridTracker"
!define COMPANY "Gridtracker.org"
!define VERSION  <versionplaceholder>
!define URL "http://gridtracker.org"
!define HELPURL "https://gitlab.com/gridtracker.org/gridtracker/-/wikis/Home"
!define REGPATH_UNINSTSUBKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${NAME}"
!define SMPATH "$SMPROGRAMS\${NAME}"
!define /date CPYEAR "%Y"
!define BUILDPATH  "<buildplaceholder>"
Name "${NAME} ${VERSION} Installer"
Icon "${BUILDPATH}/dist/GridTracker-${VERSION}-win-x86/gridview.ico"
OutFile "${BUILDPATH}/dist/GridTracker-Installer.${VERSION}.exe"


VIProductVersion ${VERSION}.0
VIAddVersionKey ProductName "${NAME}"
VIAddVersionKey ProductVersion "${VERSION}"
VIAddVersionKey CompanyName "${COMPANY}"
VIAddVersionKey CompanyWebsite "${URL}"
VIAddVersionKey FileVersion "${VERSION}"
VIAddVersionKey FileDescription "An Amateur Radio Community"
VIAddVersionKey LegalCopyright "${CPYEAR} Gridtracker.org"


# Add registry reading plugin early on as we need to see if we are installed already

# Set Default install dir then look at uninstall key to find if previously installed #
InstallDir "$ProgramFiles\${NAME}"

## For 32 bit installs on 64 bit OS this is located in the WOW6432Node [HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall] ##
InstallDirRegKey HKLM "${REGPATH_UNINSTSUBKEY}" "InstallPath"


# Pages displayed 
#Page license
Page directory
Page components
Page instfiles

# Display license file to user #
#LicenseData "LICENSE"

Function .onInit
    nsProcess::_FindProcess "GridTracker.exe"
    Pop $R0
    ${If} $R0 = 0
        MessageBox MB_OK|MB_ICONEXCLAMATION "GridTracker is still running. Please close GridTracker and run the installer again."
        Abort
    ${EndIf}
    call checkMSVC
FunctionEnd

Function checkMSVC
    ClearErrors
    ReadRegStr $0 HKCR "Installer\Dependencies\VC,redist.x86,x86,14.30,bundle" ""
    IfErrors 0 +15
        ClearErrors
        ReadRegStr $0 HKCR "Installer\Dependencies\Microsoft.VS.VC_RuntimeMinimumVSU_x86,v14" ""
        IfErrors  0 +12
            ClearErrors
            ReadRegStr $0 HKCR "Installer\Dependencies\Microsoft.VS.VC_RuntimeAdditionalVSU_x86,v14" ""
            IfErrors 0 +9
                ClearErrors
                ReadRegStr $0 HKCR "Installer\Products\679E80FBE29B63345BF612177149674C" "PackageCode"
                IfErrors 0 +6
                    MessageBox MB_YESNO|MB_ICONQUESTION "GridTracker requires MSVC Runtime Libraries. Do you want to install them now?" IDYES InstallNow IDNO Next
                    InstallNow:
                        Call InstallMSVC
                        Goto Next
                    Next:

FunctionEnd


Function InstallMSVC
    NSISdl::download "https://aka.ms/vs/17/release/vc_redist.x86.exe" "$TEMP\vc_redist.x86.exe" $0
    StrCmp $0 success fail
    success:
        ExecWait '"$TEMP\vc_redist.x86.exe" /PASSIVE /NORESTART' $1
        Goto is_reboot_requested
    fail:
        MessageBox MB_OK|MB_ICONEXCLAMATION "Unable to download MSVC Runtime files. Please see GridTracker.org for details on download"
    is_reboot_requested:
        ${If} $1 = 1641
        ${OrIf} $1 = 3010
           SetRebootFlag true
        ${EndIf}
FunctionEnd

InstType "Full"
InstType "Minimal"

Section "Program Files (Required)"
    SectionIn 1 2 RO
    SetOverwrite ifdiff

    RmDir /r $InstDir
    
    SetOutPath $InstDir
    File /r "${BUILDPATH}/dist/GridTracker-${VERSION}-win-x86/*"

    CreateDirectory "${SMPATH}"
    CreateShortcut "${SMPATH}\${NAME}.lnk" "$InstDir\${NAME}.exe"
    CreateShortcut "${SMPATH}\Help Wiki.lnk" "${HELPURL}" "" "$InstDir\gridview.ico"
    CreateShortcut "${SMPATH}\Uninstall.lnk" $InstDir\uninstall.exe

    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "DisplayName" "${NAME}"
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "DisplayVersion" "${VERSION}"
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "Publisher" "${COMPANY}"
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "URLInfoAbout" "${URL}"
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "DisplayIcon" "$InstDir\gridview.ico"
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "UninstallString" '"$InstDir\uninstall.exe"'
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "QuietUninstallString" '"$InstDir\uninstall.exe" /S'
    WriteRegStr HKLM "${REGPATH_UNINSTSUBKEY}" "InstallPath" $InstDir
    WriteRegDWORD HKLM "${REGPATH_UNINSTSUBKEY}" "NoModify" 1
    WriteRegDWORD HKLM "${REGPATH_UNINSTSUBKEY}" "NoRepair" 1

    WriteUninstaller "$InstDir\uninstall.exe"

SectionEnd

# Section for PDF when we have it #
/*
Section "Offline Help Docs"
    SectionIn 1
SectionEnd
*/

# Section for Locales when we have it #
/*
SectionGroup "Locales"
    SetOutPath $INSTDIR\locales
    Section "de"

    SectionEnd

    Section "es"

    SectionEnd
SectionGroupEnd
*/

# Give User Option for Desktop Shortcut #
Section "Desktop Shortcut"
    SectionIn 1
    CreateShortcut /NoWorkingDir "$DESKTOP\${NAME}.lnk" "$InstDir\${NAME}.exe"
SectionEnd

# Uninstall stuffs #
Section -un.Main
    RmDir /r /REBOOTOK $INSTDIR
    RmDir /r /REBOOTOK "${SMPATH}"
    Delete /REBOOTOK "$DESKTOP\${NAME}.lnk"
    DeleteRegKey HKLM "${REGPATH_UNINSTSUBKEY}"
    Delete "$InstDir\uninstall.exe"
SectionEnd
