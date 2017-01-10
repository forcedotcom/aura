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
console.log("START: server-js-compile.js");

var scriptReady = false;
compiler.compile({
    componentPath: codes.componentPath,
    sourceTemplate: codes.sourceTemplate,
    sourceClass: codes.sourceClass
}).then((result) => {
    console.log('\n--- CODE START ---\n' + result.code + '--- CODE END ---');
    scriptReady = true;
}).catch((err) => {
    console.log('\n--- ERROR START ---\n' + err + '--- ERROR END ---');
    scriptReady = true; // otherwise will hit timeout when there's a compilation failure.
});
