set -e

cd test-projects/angular-i
sh integration-test.sh

cd ..
cd typescript-i
sh ./integration-test.sh

