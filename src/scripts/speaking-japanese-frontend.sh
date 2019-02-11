#!/bin/bash

pwd

echo 'Removing folder "speaking-japanese"'
rm -rf speaking-japanese 

echo 'git clone speaking-japanese'
git clone git@github.com:MrOggy85/speaking-japanese.git

cd speaking-japanese

pwd

echo 'npm install & build'  
npm install && npm run build

echo 'replace current files with newly built'
#rm -rf -v /usr/share/nginx/html/speaking-japanese && \
#mkdir /usr/share/nginx/html/speaking-japanese && \
#mv -v ./dist/* /usr/share/nginx/html/speaking-japanese/

echo 'DONE'

exit 0