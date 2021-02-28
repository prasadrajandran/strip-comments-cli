#!/usr/bin/env bash

# 1. Clear "dist" dir
rm -rf dist

# 2. Build
npm run build;

# 3. Add hashbang to CLI
echo '#!/usr/bin/env node' | cat - ./dist/cli.js > temp && mv temp ./dist/cli.js

# 4. Test
npm test

# 5. Run Prettier
npm run prettier-fix

package_version=`cat package.json | grep version`
package_version=${package_version/  \"version\"\: /} # remove `  "version": `
package_version=${package_version/,/} # remove `,`

echo
echo "--- RELEASE PREP COMPLETE ---"
echo
echo "1. update the package version if necessary: $package_version"
echo "2. do not forget to run \"npm install\" if the package version is updated"
echo "3. create PR to main (from development), merge PR, and create a GitHub release"
echo "4. switch to the main branch locally and run \"git pull\""
echo "5. to publish the package run: \"npm publish --access public\""
echo "6. switch back to development and merge main into development"
