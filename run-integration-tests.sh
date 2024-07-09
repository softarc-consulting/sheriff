set -e

# This is necessary because @angular-eslint uses nx and would
# use root as workspace... ending up in strange error messages.
# This can go away as soon as angular-eslint switches to flat
# config.

mv nx.json nx.json.bak

echo "Testing against Angular 15 (ESLint Legacy)"
cd test-projects/angular-i
bash ./integration-test.sh

echo "Testing against Angular 18 (ESLint Flat)"
cd ../angular-iv
bash ./integration-test.sh

cd ../typescript-i
bash ./integration-test.sh

cd ../..
mv nx.json.bak nx.json
