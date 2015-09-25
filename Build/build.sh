#!/bin/bash

appfolder="../DrudeWatch"

# Console colors
red='\033[0;31m'
green='\033[0;32m'
yellow='\033[1;33m'
NC='\033[0m'

echo-red () { echo -e "${red}$1${NC}"; }
echo-green () { echo -e "${green}$1${NC}"; }
echo-yellow () { echo -e "${yellow}$1${NC}"; }

if_failed ()
{
	if [ ! $? -eq 0 ]; then
		if [[ "$1" == "" ]]; then msg="dsh: error"; else msg="$1"; fi
		echo-red "dsh: $msg";
		exit 1;
	fi
}

#-------- Build  ---------

echo-green "Copying nwjs"
nwapp="/Applications/nwjs.app"
if [ ! -d $nwapp ]; then
	echo-red "$nwapp was not found"
fi
cp -r $nwapp .

echo-green "Moving app in place"
content="./nwjs.app/Contents"
res="$content/Resources"
cp -R $appfolder $res
mv "$res/$(basename $appfolder)" "$res/app.nw"

echo-green "Moving Info.plist"
cp "../Resources/Info.plist" "$content"

echo-green "Moving nw.icns"
cp "../Resources/nw.icns" "$content"