#!/bin/sh

set -e

pwd

whoami

echo 'Removing folder "speaking-japanese"'
rm -rf speaking-japanese

echo 'git clone speaking-japanese'
git clone https://github.com/MrOggy85/speaking-japanese.git

cd speaking-japanese

pwd

echo 'npm install'
npm install

echo 'npm run build'
npm run build

echo 'rm -rf -v /www/speaking-japanese'
rm -rf -v /www/speaking-japanese

echo 'mkdir /www/speaking-japanese'
mkdir /www/speaking-japanese

echo 'mv -v ./dist/* /www/speaking-japanese/'
mv -v ./dist/* /www/speaking-japanese/

echo 'DONE'

exit 0
