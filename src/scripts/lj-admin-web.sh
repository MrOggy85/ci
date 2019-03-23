#!/bin/bash

set -e

pwd

whoami

echo 'Removing folder "lj-admin"'
rm -rf lj-admin

echo 'git clone learning-japanese-admin-web'
git clone https://github.com/MrOggy85/learning-japanese-admin-web.git

cd learning-japanese-admin-web

pwd

echo 'npm install'
npm install

echo 'npm run build'
npm run build

echo 'rm -rf -v /www/lj-admin'
rm -rf -v /www/lj-admin

echo 'mkdir /www/lj-admin'
mkdir /www/lj-admin

echo 'mv -v ./dist/* /www/lj-admin/'
mv -v ./dist/* /www/lj-admin/

echo 'DONE'

exit 0
