stat dedup.js && rm index.js
echo '#!/usr/bin/env node' > index.js
coffee -p --no-header -c src/index.coffee >> index.js && echo 'success'
