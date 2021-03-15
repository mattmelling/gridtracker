A PI DESKTOP LAUNCHER FOR RASPBIAN
Instead of opening a terminal instance to launch GridTracker on the
Raspberry pi running Raspbian*, there is an easy way to create a
launch icon on the desktop.

Included in this archive are two files; a desktop icon for GridTracker,
gridtracker.png, and a simple text file, GridTracker.desktop.

As an example, assume that GridTracker-Lunux-Arm1.18.xxxx.tar.gz was downloaded to /home/pi/Downloads/, and
extracted to a folder directly below it,
/home/pi/Downloads/GridTracker/.

Copy GridTracker.desktop to /home/pi/Desktop/, and
gridtracker.png to /home/pi/Downloads/GridTracker/.

If your GridTracker install uses other file locations, simply edit the
apporpriate lines in GridTracker.desktop to reference the proper
folders.

You should now see an icon on your desktop, . Simply double
click to launch GridTracker.

*Or other flavors of linux. Other changes may be required. See your package
documentation.

GridTracker.desktop example below

[Desktop Entry]
Name=GridTracker
Comment=GridTracker
GenericName=GridTracker, a WSJT-X Companion
Exec=/home/pi/Downloads/GridTracker/GridTracker
Icon=/home/pi/Downloads/GridTracker/gridtracker.png
Path=/home/pi/Downloads/GridTracker
Type=Application
Encoding=UTF-8
Terminal=false
Categories=None;
