set -e

cd test-projects/angular-i
bash integration-test.sh

cd ..
cd typescript-i
bash ./integration-test.sh

