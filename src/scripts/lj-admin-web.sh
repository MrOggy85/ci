#!/bin/sh

set -e

echo -e 'Removing folder "lj-admin"\n'
rm -rf learning-japanese-admin-web

echo -e 'git clone learning-japanese-admin-web\n'
git clone https://github.com/MrOggy85/learning-japanese-admin-web.git

cd learning-japanese-admin-web

export NODE_ENV=

echo -e 'npm install\n'
npm install

export NODE_ENV=production

echo -e 'npm run build\n'
npm run build

echo 'rm -rf -v /www/lj-admin'
rm -rf -v /www/lj-admin

echo 'mkdir /www/lj-admin'
mkdir /www/lj-admin

echo 'mv -v ./dist/* /www/lj-admin/'
mv -v ./dist/* /www/lj-admin/

echo 'DONE'

exit 0
