#!/bin/bash

pwd

whoami

echo 'Removing folder "speaking-japanese"'
rm -rf speaking-japanese 

echo 'git clone speaking-japanese'
git clone https://github.com/MrOggy85/speaking-japanese.git

cd speaking-japanese

pwd

echo 'npm install & build'  
npm install && npm run build

echo 'replace current files with newly built'
rm -rf -v /www/speaking-japanese && \
mkdir /www/speaking-japanese && \
mv -v ./dist/* /www/speaking-japanese/

echo 'DONE'

exit 0