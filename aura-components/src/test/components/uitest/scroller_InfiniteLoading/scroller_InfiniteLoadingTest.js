({
    //test set infinite scroll label
    testInfiniteScrollLabel: {
        attributes : {"loadDelay_ms" : "100000"},
        test: [function(cmp) {
            var scrollWrapper = cmp.find("scrollWrapper").getElement();

            //keep scrolling to the bottom
            var interval = setInterval(function(){
                scrollWrapper.scrollTop = scrollWrapper.scrollHeight;
            }, 500);

            //assert for infinite scrolling label
            $A.test.addWaitForWithFailureMessage(
                'Test Loading...1234567890',
                function(){
                    return $A.util.trim(
                        $A.test.getText(
                            $A.test.select('.infinite-loading')[0]
                        )
                    )
                },
                'Infinite label should be visible and equals ',
                function(){//callback
                    //clear the interval
                    scrollWrapper.scrollTop = scrollWrapper.scrollHeight;
                    clearInterval(interval);
                }
            )
        }]
    },

    testAutoFillPageInitBeforeRender: {
        attributes: {
            "autoFillPage": true, "initBeforeRender": true,
            "initialSize": 1, "loadSize": 20
        },
        test: function(cmp) {
            var expNumItems = cmp.get("v.initialSize") + cmp.get("v.loadSize");
            this.waitForItemsLoaded(expNumItems);
        }
    },

    testAutoFillPageInitAfterRender: {
        attributes: {
            "autoFillPage": true, "initBeforeRender": false,
            "initialSize": 1, "loadSize": 20
        },
        test: function(cmp) {
            var expNumItems = cmp.get("v.initialSize") + cmp.get("v.loadSize");
            this.waitForItemsLoaded(expNumItems);
        }
    },

    // Helpers

    waitForItemsLoaded: function(expNumItems) {
        $A.test.addWaitForWithFailureMessage(expNumItems, function() {
            return $A.test.select(".item").length;
        }, expNumItems + " items should be loaded");
    }
})
