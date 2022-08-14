# abort on errors
set -e

NODE_ENV=production

# build
npm run build

# navigate into the build output directory
cd docs

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
git push -f git@github.com:asagume/asagume.github.io.git main

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:asagume/gencalc3-test.git main:gh-pages

cd -
