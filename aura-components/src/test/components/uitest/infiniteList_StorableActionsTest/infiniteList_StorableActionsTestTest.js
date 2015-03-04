({
    /**
     * This test emulates an infiniteList using storable server actions to retrieve data for the list.
     *
     * When a server request for more data is made and the action is already cached, the cached response will be
     * returned immediately followed by the response from the server. This test's data provider emulates this by
     * updating data twice, first for "cached" data and again for "server" data.
     *
     * Setting v.cachedDataRows and v.serverDataRows tells the data provider how many rows of data to update the list
     * with, where 0 means do not try to update the list.
     */

    /**
     * The data provider will load some data in the list on initial load.
     */
    initialData: function() {
        return "0initial" + "1initial" + "2initial"
    },

    /**
     * Verify second set of data (emulated server data) overrides first set (emulated cached data) instead of being
     * appended to the end of the list.
     */
    testUpdateSameRowWithSameData: {
        attributes: {
            'cachedDataRows': 3,
            'serverDataRows': 3,
            'cachedTargetPage': 2,
            'serverTargetPage': 2
        },
        test: function(cmp) {
            this.doShowMore(cmp);

            $A.test.addWaitFor(false, $A.test.isActionPending,function() {
                var expected = this.initialData() + "0server" + "1server" + "2server";
                var output = this.getListOutput(cmp);
                $A.test.assertEqualsIgnoreWhitespace(expected, output);
            });
        }
    },

    /**
     * Verify when the 2nd set of data has less rows than what's currently in the list and we're on the last row,
     * the extra data at the end of the list is removed.
     */
    testUpdateSameRowWithLessData: {
        attributes: {
            'cachedDataRows': 3,
            'serverDataRows': 2,
            'cachedTargetPage': 2,
            'serverTargetPage': 2
        },
        test: function(cmp) {
            this.doShowMore(cmp);

            $A.test.addWaitFor(false, $A.test.isActionPending,function(){
                var expected = this.initialData() + "0server" + "1server";
                var output = this.getListOutput(cmp);
                $A.test.assertEqualsIgnoreWhitespace(expected, output);
            });
        }
    },

    /**
     * Verify the 2nd set of data can have more rows of data than what's on the current page.
     */
    testUpdateSameRowWithMoreData: {
        attributes: {
            'cachedDataRows': 2,
            'serverDataRows': 3,
            'cachedTargetPage': 2,
            'serverTargetPage': 2
        },
        test: function(cmp) {
            this.doShowMore(cmp);

            $A.test.addWaitFor(false, $A.test.isActionPending,function() {
                var expected = this.initialData() + "0server" + "1server" + "2server";
                var output = this.getListOutput(cmp);
                $A.test.assertEqualsIgnoreWhitespace(expected, output);
            });
        }
    },

    /**
     * Show more twice should append data twice to the end of the list.
     */
    testShowMoreTwice: {
        attributes: {
            'cachedDataRows': 3,
            'serverDataRows': 3
            // Not setting target pages will default to v.currentPage on the component
        },
        test: [function(cmp) {
            this.doShowMore(cmp);
            $A.test.addWaitFor(false, $A.test.isActionPending,function() {
                var expected = this.initialData() + "0server" + "1server" + "2server";
                var output = this.getListOutput(cmp);
                $A.test.assertEqualsIgnoreWhitespace(expected, output);
            });
        }, function(cmp) {
            this.doShowMore(cmp);
            $A.test.addWaitFor(false, $A.test.isActionPending,function(){
                var expected = this.initialData() + "0server" + "1server" + "2server" + "0server" + "1server" + "2server";
                var output = this.getListOutput(cmp);
                $A.test.assertEqualsIgnoreWhitespace(expected, output);
            });
        }]
    },

    /**
     * This test emulates a user doing a show more and then in between getting the initial set of data from cache and
     * the getting the real server data, does another show more. If the data from the server has less rows than was in
     * the cache we should still remove the extra stale data.
     */
    // TODO(W-2500568): we may be leaving stale data at end of list in this scenario.
    _testShowMoreBetweenCachedAndServerResponse: {
        attributes: {
            'cachedDataRows': 3,
            'serverDataRows': 0, // Only update list with "cached" data
            'cachedTargetPage': 2,
            'serverTargetPage': 2
        },
        test: [function(cmp) {
            this.doShowMore(cmp);
            var expected = this.initialData() + "0cached" + "1cached" + "2cached";
            var output = this.getListOutput(cmp);
            $A.test.assertEqualsIgnoreWhitespace(expected, output);
        }, function(cmp) {
            // Now emulate the server coming back with less data than was in cache after showMore is called a 2nd time.
            cmp.set("v.cachedDataRows", 0);
            cmp.set("v.serverDataRows", 2);
            this.doShowMore(cmp);
            var expected = this.initialData() + "0server" + "1server";
            var output = this.getListOutput(cmp);
            $A.test.assertEqualsIgnoreWhitespace(expected, output);
        }]
    },

    doShowMore: function(cmp) {
        cmp.find('list').getEvent('showMore').fire();
    },

    getListOutput: function(cmp) {
        var text = $A.test.getText(cmp.find("list").getElement());
        // infiniteList.cmp has a hidden loading message that we don't care about
        return text.replace("Loading...","");
    }
})