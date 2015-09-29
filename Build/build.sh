#!/bin/bash

appname="Drude Watch"
appfolder="../DrudeWatch"

nwjs="/Applications/nwjs.app"

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

appresult="$appname.app"
contents="./$appresult/Contents"
resources="$contents/Resources"

echo-green "Cleanup"
rm -r ./*.app 

echo-green "Copying nwjs.app"
if [ ! -d $nwjs ]; then
	echo-red "$nwjs was not found"
fi
cp -R "$nwjs" "$appresult"

echo-green "Bundling $appname"
cp -R "$appfolder" "$resources/app.nw"
 sed -i "" "s/Drude Watch-dev/Drude Watch/" "$resources/app.nw/package.json"

echo-green "Bundling Info.plist"
cp "../Resources/Info.plist" "$contents"

echo-green "Bundling nw.icns"
cp "../Resources/nw.icns" "$resources"

echo-green "Clearing icons cache"
touch "./$appname.app"
touch "./$appname.app/Contents/Info.plist"

echo-green "Running..."
sleep 1
"$appname.app/Contents/MacOS/nwjs" 2>/dev/null 1>/dev/null &