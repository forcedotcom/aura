/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// usage: node compiler-cli.js compiler.js file.js output.js
if (process.argv.length != 5) {
    console.error('usage: ' + __filename + ' compiler.js input.js output.js');
    process.exit(-1);
}

const compilerJs = process.argv[2];
const componentPath = process.argv[3];
const outputPath = process.argv[4];

const compiler = require(compilerJs);
const fs = require('fs');

const promise = compiler.compile(componentPath, {format: 'aura', mapNamespaceFromPath: true });

promise.then((result) => {
    fs.writeFile(outputPath, result.code, function(err) {
        if(err) {
            console.error(err);
            process.exit(-1);
        }
    });
})
.catch((error) => {
    console.error(error);
    process.exit(-1);
});