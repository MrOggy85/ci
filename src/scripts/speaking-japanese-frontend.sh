#!/bin/sh

set -e

pwd

whoami

echo -e 'Removing folder "speaking-japanese"\n'
rm -rf speaking-japanese

echo -e 'git clone speaking-japanese\n'
git clone https://github.com/MrOggy85/speaking-japanese.git

cd speaking-japanese

export NODE_ENV=

echo -e 'npm install\n'
npm install

export NODE_ENV=production

echo -e 'npm run build\n'
npm run build

echo 'rm -rf -v /www/speaking-japanese'
rm -rf -v /www/speaking-japanese

echo 'mkdir /www/speaking-japanese'
mkdir /www/speaking-japanese

echo 'mv -v ./dist/* /www/speaking-japanese/'
mv -v ./dist/* /www/speaking-japanese/

echo 'DONE'

exit 0
