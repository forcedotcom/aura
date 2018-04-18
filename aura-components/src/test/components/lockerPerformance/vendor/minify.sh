#!/bin/sh

### LODASH
echo lodash...

uglifyjs lodash-4.17.4.src.js -o lodash.js

### BENCHMARK
echo Benchmark...

uglifyjs Benchmark-2.1.4.src.js -o benchmark.js

# Remove the while loop (since we provide it in our tests).
perl -i -0pe 's/while(i#--){m#.f#()}/m#.f#.call(m#,i#);/g' benchmark.js

### JQUERY
echo jQuery...

node ./replace-regex.js jquery-3.3.1.src.js testJQueryTableHelper.js

# Wrap with an exporter
perl -i -0pe 's/^(.*)$/({  init: function() { \1 }})/s' testJQueryTableHelper.js

cp testJQueryTableHelper.js ../testJQueryTable/testJQueryTableHelper.js
cp testJQueryTableHelper.js ../testJQueryTableSecure/testJQueryTableSecureHelper.js
rm testJQueryTableHelper.js

### CHART
echo Chart...

uglifyjs chart-2.7.1.src.js -o testChartHelper.js

# Wrap with an exporter
perl -i -0pe 's/^(.*)$/({  init: function() { \1 }})/s' testChartHelper.js

cp testChartHelper.js ../testChart/testChartHelper.js
cp testChartHelper.js ../testChartSecure/testChartSecureHelper.js
rm testChartHelper.js
