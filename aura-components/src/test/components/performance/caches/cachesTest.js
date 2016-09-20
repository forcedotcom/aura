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
    waitForResults : function(cmp, name, searchString) {
        var cacheSpan = cmp.find("cachename");
        var searchSpan = cmp.find("searchValue");
        $A.test.addWaitFor(name, function() { return $A.test.getText(cacheSpan.getElement()); });
        $A.test.addWaitFor(searchString, function() { return $A.test.getText(searchSpan.getElement()); });
    },

    assertFoundOne : function(cmp) {
        var foundSpan = cmp.find("count");
        $A.test.assertEquals("1", $A.test.getText(foundSpan.getElement()), "Should find a single item.");
    },

    //We can't test this because we may have loaded from cache, in which case it will fail.
    //Though, this one, unlike the others below, really should work.
    _testDepsCacheContainsApp: {
        labels : [ "threadHostile", "freshBrowserInstance" ],
        attributes: {cache:"defsCache",key:"foo"},
        test : [
            function (cmp) {
                this.waitForResults(cmp, "defsCache", "foo");
            },
            function (cmp) {
                cmp.set("v.cache", "depsCache");
                cmp.set("v.key", "APPLICATION:markup://performance:caches");
                cmp.updateCache();
            },
            function (cmp) {
                this.waitForResults(cmp, "depsCache", "APPLICATION:markup://performance:caches");
            },
            function (cmp) {
                // Deps cache should have both the uid version and the non-uid version.
                var foundSpan = cmp.find("count");
                $A.test.assertEquals("2", $A.test.getText(foundSpan.getElement()),
                    "Should find two items. Total size "+$A.test.getText(cmp.find("size").getElements()));
            }
        ]
    },

    testDefsCacheContainsApp: {
        labels : [ "threadHostile", "freshBrowserInstance" ],
        attributes: {cache:"defsCache",key:"markup://performance:caches"},
        test : [
            function (cmp) {
                this.waitForResults(cmp, "defsCache", "markup://performance:caches");
            },
            function (cmp) {
                this.assertFoundOne(cmp);
            }
        ]
    },

    //We can't test this because we may have loaded from cache, in which case it will fail.
    _testAltStringsCacheContainsAppJS: {
        labels : [ "threadHostile", "freshBrowserInstance" ],
        attributes: {cache:"altStringsCache",key:"markup://performance:caches@JS"},
        test : [
            function (cmp) {
                this.waitForResults(cmp, "altStringsCache", "markup://performance:caches@JS");
            },
            function (cmp) {
                this.assertFoundOne(cmp);
            }
        ]
    },

    //We can't test this because we may have loaded from cache, in which case it will fail.
    _testAltStringsCacheContainsAppCSS: {
        labels : [ "threadHostile", "freshBrowserInstance" ],
        attributes: {cache:"altStringsCache",key:"markup://performance:caches@CSS"},
        test : [
            function (cmp) {
                this.waitForResults(cmp, "altStringsCache", "markup://performance:caches@CSS");
            },
            function (cmp) {
                this.assertFoundOne(cmp);
            }
        ]
    },

    testJavaControllerInCache: {
        labels : [ "threadHostile", "freshBrowserInstance" ],
        attributes: {cache:"defsCache",key:"performance.CacheController"},
        test : [
            function (cmp) {
                this.waitForResults(cmp, "defsCache", "performance.CacheController");
            },
            function (cmp) {
                this.assertFoundOne(cmp);
            }
        ]
    }
})
