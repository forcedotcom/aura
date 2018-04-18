#!/bin/sh

uglifyjs chart-2.7.1.src.js -o testChartHelper.js

# Wrap with an exporter
perl -i -0pe 's/^(.*)$/({  init: function() {\n\1\n}})/s' testChartHelper.js
