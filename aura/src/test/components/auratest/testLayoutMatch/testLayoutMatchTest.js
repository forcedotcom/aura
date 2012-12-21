/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    waitForLayoutChange : function(component){
        $A.test.addWaitFor(true, function(){
            var elem = component.find("layoutTitle").getElement();
            var done = $A.util.hasClass(elem,"layoutChanged");
            if(done){
                $A.util.removeClass(elem,"layoutChanged");
            }
            return done;
        });
    },

    setUp : function(component){
        this.waitForLayoutChange(component);
    },

    /**
     * Exact name would have matched another layout.
     */
    testExactName: {
        attributes : {__layout: '#noMatch'},
        test: function(component){
            $A.test.assertEquals("noMatch", component.find("layoutTitle").getElement().innerHTML);
        }
    },

    /**
     * Matching layout name found.
     */
    testMatch: {
        attributes : {__layout: '#xfactor'},
        test: function(component){
            $A.test.assertEquals("xMatch", component.find("layoutTitle").getElement().innerHTML);
        }
    },

    /**
     * First (source order) matching layout returned if multiple matches possible.
     */
    testMultipleMatches: {
        attributes : {__layout: '#xtraMatch'},
        test: function(component){
            $A.test.assertEquals("endsWithMatch", component.find("layoutTitle").getElement().innerHTML);
        }
    },

    /**
     * Invalid match attributes ignored.  e.g. bad syntax, undefined, empty. Use undefined name to ensure pass over all defined layouts.
     */
    testInvalidMatchesIgnored: {
        attributes : {__layout: '#noMatch'},
        test : [function(component){
                $A.test.assertEquals("noMatch", component.find("layoutTitle").getElement().innerHTML);
                $A.layoutService.layout("match");
                this.waitForLayoutChange(component);
            }, function(component){
                // falls through to catchall
                $A.test.assertEquals("default", component.find("layoutTitle").getElement().innerHTML);
            }]
    }
})
