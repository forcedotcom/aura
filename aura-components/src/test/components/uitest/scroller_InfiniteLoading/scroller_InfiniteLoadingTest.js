({
    //test set infinite scroll label
    testInfiniteScrollLabel: {
        attributes : {"loadDelay_ms" : "100000"},
        test: [function(cmp) {
            // var scrollerWrapper = $document.querySelectorAll('#body > div')[0];
            var scrollerWrapper = $A.test.select('#body > div')[0];

            //keep scrolling to the bottom
            var interval  =setInterval(function(){
                scrollerWrapper.scrollTop = scrollerWrapper.scrollHeight;
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
                    scrollerWrapper.scrollTop = scrollerWrapper.scrollHeight;
                    clearInterval(interval);
                }
            )
        }]
    }
})
