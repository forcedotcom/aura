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

    //Test turning on shared container sets panels as child of container and sets zindexes accordingly
    //Test turning off shared container sets panels as child of panel manager and sets zindexes accordingly
    //Test public apis from stack manager bringToFront, sendToBack, setStackingContextRoot
    //Test multiple panel managers with container manager together

    browsers: ["-IE7","-IE8"],

    testUseSharedContainer: {
        test: [function(cmp) {
            $A.test.addWaitFor();
            cmp.find("create").get("e.press").fire();
        }, function(cmp) {

        }]
    },


})