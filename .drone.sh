# Go to project > Repository and set the branch filter
# Then click on "View Key" and paste it on github

npm install -g nvm
nvm download 0.11.14
nvm install 0.11.14
nvm use 0.11.14

npm update -g npm

node --version
npm --version

npm install -g jshint
npm install

echo "\n> Ensure that the code is warning free"
jshint *.js test || exit 1

echo "\n> Run tests for node"
node_modules/.bin/mocha --harmony -u tdd || exit 1
