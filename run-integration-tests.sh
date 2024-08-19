set -e

# We copy the test projects to a temporary directory to avoid any potential
# issues with the dependencies from the root project.

# Check if .test-projects exists and is a symbolic link
if [ -L .test-projects ]; then
  TARGET_DIR=$(readlink .test-projects)
  rm .test-projects
  rm -rf "$TARGET_DIR"
  echo "Removing $TARGET_DIR"
fi

export TMP_DIR=$(mktemp -d)
rsync -a --exclude node_modules --exclude .angular test-projects/ "$TMP_DIR"
ln -sf "$TMP_DIR" .test-projects

echo "Temporary directory created at $TMP_DIR"

echo "Testing against Angular 15 (ESLint Legacy)"
cd .test-projects/angular-i
bash ./integration-test.sh

echo "Testing against Angular 18 (ESLint Flat)"
cd ../angular-iv
bash ./integration-test.sh

cd ../typescript-i
bash ./integration-test.sh

cd ../..

echo "Tests finished successfully"
