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
({
    typeMap : {
        "typeif": "ifTest:testIf",//It is not true.It is literally not false.
        "typeifelse": "ifTest:testIfElse",//It wishes it was true.It is not true.
        "typeifnested": "ifTest:testIfNested",//It wishes it was true.It is not true.
        "typeifserver": "ifTest:testIf"
        /* "typeifserver": "ifTest:testIfServer"
         * W-2022347
         * ifTest:testIfServer is removed from test because the difference between loading it alone
         * ({! !v.thang} is undefined), and loading it through iterationWJSProviderOnly ({! !v.thang} is true). 
        "typeifserver": "ifTest:testIfServer"//It is literally not false.
        */
    }
})