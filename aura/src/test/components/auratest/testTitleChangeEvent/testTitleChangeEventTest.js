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
    waitForLayoutChange: function(test, component, callback){
        aura.test.runAfterIf(
            function(){
                var elem = component.find("ready").getElement();
                var done = $A.util.hasClass(elem,"layoutChanged");
                if(done){
                    $A.util.removeClass(elem,"layoutChanged");
                    test.waitForTitleChange(component, callback);
                }
                return done;
            });
    },

    waitForTitleChange: function(component, callback){
        aura.test.runAfterIf(
            function(){
                var elem = component.find("ready").getElement();
                var done = $A.util.hasClass(elem,"titleChanged");
                if(done){
                    $A.util.removeClass(elem,"titleChanged");
                }
                return done;
            },
            callback);
    },

    assertTitleEventTitles: function(component, prev, curr){
        aura.test.assertEquals(prev, component._lastTitle, "titleChange prevTitle not expected");
        aura.test.assertEquals(curr, component._currTitle, "titleChange title not expected");
    },

    assertBothEventTitles: function(test, component, prev, curr){
        aura.test.assertEquals(prev, component._lastLayoutTitle, "layoutChange prevTitle not expected");
        aura.test.assertEquals(curr, component._currLayoutTitle, "layoutChange title not expected");
        test.assertTitleEventTitles(component, prev, curr);
    },

    assertNoEventsFired: function(component, callback){
        aura.test.runAfterIf(
            function(){
                return $A.eventService.hasPendingEvents;
            },
            function(){
                var elem = component.find("ready").getElement();
                aura.test.assertFalse($A.util.hasClass(elem,"layoutChanged"), "LayoutChange fired unexpectedly!");
                aura.test.assertFalse($A.util.hasClass(elem,"titleChanged"), "TitleChange fired unexpectedly!");
                if(callback)
                    callback();
            });
    },

    /**
     * Default layout fires change events with undefined prevTitle.
     */
    testDefaultTitle: {
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, 'this is the default');
            });
        }
    },

    /**
     * Changing layout with SimpleValue title to no title fires change events with undefined title.
     */
    testSimpleTitleToNoTitle: {
        attributes : {__layout: '#stringTitle'},
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, 'string title');
                $A.historyService.set("noTitle");
                t.waitForLayoutChange(t, component, function(){
                    t.assertBothEventTitles(t, component, 'string title', undefined);
                    $A.historyService.set("stringTitle");
                    t.waitForLayoutChange(t, component, function(){
                        t.assertBothEventTitles(t, component, undefined, 'string title');
                    });
                });
            });
        }
    },

    /**
     * Changing layout with no title to empty title fires change events with empty title.
     */
    testNoTitleToEmptyTitle: {
        attributes : {__layout: '#noTitle'},
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, undefined);
                $A.historyService.set("emptyTitle");
                t.waitForLayoutChange(t, component, function(){
                    t.assertBothEventTitles(t, component, undefined, '');
                    $A.historyService.set("noTitle");
                    t.waitForLayoutChange(t, component, function(){
                        t.assertBothEventTitles(t, component, '', undefined);
                    });
                });
            });
        }
    },

    /**
     * Changing layout with expression title to function title fires change events with evaluated title.
     */
    testTitleExpr: {
        attributes : {__layout: '#exprTitle'},
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, 'from expression');
                $A.historyService.set("funcTitle");
                t.waitForLayoutChange(t, component, function(){
                    t.assertBothEventTitles(t, component, 'from expression', 'from expression function');
                    $A.historyService.set("exprTitle");
                    t.waitForLayoutChange(t, component, function(){
                        t.assertBothEventTitles(t, component, 'from expression function', 'from expression');
                    });
                });
            });
        }
    },

    /**
     * Setting layout title to string fires change events with string title.
     */
    // W-1059942 https://gus.soma.salesforce.com/a07B0000000G0YwIAK
    testSetLayoutTitleToString: {
        attributes : {__layout: '#stringTitle'},
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, 'string title');
                $A.layoutService.setCurrentLayoutTitle('shiny new title');
                t.waitForTitleChange(component, function(){
                    t.assertTitleEventTitles(component, 'string title', 'shiny new title');
                    // check no layout events fired
                    t.assertNoEventsFired(component);
                });
            });
        }
    },

    /**
     * Setting layout title to null fires change events with null title.
     */
    // W-1059942 https://gus.soma.salesforce.com/a07B0000000G0YwIAK
    testSetLayoutTitleToNull: {
        attributes : {__layout: '#funcTitle'},
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function() {
                t.assertBothEventTitles(t, component, undefined, 'from expression function');
                $A.layoutService.setCurrentLayoutTitle(null);
                t.waitForTitleChange(component, function(){
                    t.assertTitleEventTitles(component, 'from expression function', null);

                    // check no layout events fired
                    t.assertNoEventsFired(component);
                });
            });
        }
    },

    /**
     * Setting layout title to undefined works as expected.
     */
    // W-1059942 https://gus.soma.salesforce.com/a07B0000000G0YwIAK
    testSetLayoutTitleToUndefined: {
        attributes : {__layout: '#stringTitle'},
        test: function(component){
            var t = this;
            var imnotdefined;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, 'string title');
                $A.log("setCurrentLayoutTitle to undefined");
                $A.layoutService.setCurrentLayoutTitle(imnotdefined);
                t.waitForTitleChange(component, function(){
                    t.assertTitleEventTitles(component, 'string title', undefined);

                    // check no layout events fired
                    t.assertNoEventsFired(component);
                });
            });
        }
    },

    /**
     * Setting layout title to same title does not fire change events.
     */
    // W-1059942 https://gus.soma.salesforce.com/a07B0000000G0YwIAK
    testSetLayoutTitleToSame: {
        attributes : {__layout: '#stringTitle'},
        test: function(component){
            var t = this;
            t.waitForLayoutChange(t, component, function(){
                t.assertBothEventTitles(t, component, undefined, 'string title');
                $A.log("setCurrentLayoutTitle to 'string title'");
                $A.layoutService.setCurrentLayoutTitle('string title');
                t.assertNoEventsFired(component);
            });
        }
    }
})
