({
    _testNoDataPresent : {
        attributes : {"pageSize" : 0},
        test : function(cmp){
            var pager = cmp.find("pagerNextPrev");
            this.verifyNumberOfTrs(0, cmp.find("grid").getElement());
            this.verifyPageInfoSaysCorrectNumber(cmp.find("pageInfo"), "0 - 0 of 0");
            this.verifyElementDisabled(pager, "pager:first", true);
            this.verifyElementDisabled(pager, "pager:previous", true);
            this.verifyElementDisabled(pager, "pager:next", true);
            this.verifyElementDisabled(pager, "pager:last", true);
            
        }
    },
    testWithAverageData : {
        attributes : {"pageSize" : 99},
        test : function(cmp){
            var pager = cmp.find("pagerNextPrev");
            this.verifyNumberOfTrs(99, cmp.find("grid").getElement());
            this.verifyPageInfoSaysCorrectNumber(cmp.find("pageInfo"), "1 - 99 of 495");
            this.verifyElementDisabled(pager, "pager:first", true);
            this.verifyElementDisabled(pager, "pager:previous", true);
            this.verifyElementDisabled(pager, "pager:next",false);
            this.verifyElementDisabled(pager, "pager:last", false);
        }
    },
    
    testStartingOnDifferentPage : {
        attributes : {"pageSize" : 100, "currentPage":2},
        test : function(cmp){
            var pager = cmp.find("pagerNextPrev");
            this.verifyNumberOfTrs(100, cmp.find("grid").getElement());
            this.verifyPageInfoSaysCorrectNumber(cmp.find("pageInfo"), "101 - 200 of 500");
            this.verifyElementDisabled(pager, "pager:first", false);
            this.verifyElementDisabled(pager, "pager:previous", false);
            this.verifyElementDisabled(pager, "pager:next",false);
            this.verifyElementDisabled(pager, "pager:last", false);
        }
    },
    
    _testWithLargeData : {
        attributes : {"pageSize" : 3000, "currentPage" : 5},
        test : function(cmp){
            var pager = cmp.find("pagerNextPrev");
            this.verifyNumberOfTrs(3000, cmp.find("grid").getElement());
            this.verifyPageInfoSaysCorrectNumber(cmp.find("pageInfo"), "12001 - 15000 of 15000");
            this.verifyElementDisabled(pager, "pager:first", false);
            this.verifyElementDisabled(pager, "pager:previous", false);
            this.verifyElementDisabled(pager, "pager:next",true);
            this.verifyElementDisabled(pager, "pager:last", true);
        }
    },
    
    testPagination : {
        attributes : {"pageSize" : 50, "currentPage" : 1, "sortBy" : "-id"},
        test : function(cmp){
            //Click on the next button
            var pager = cmp.find("pagerNextPrev").find("pager:next").getElement();
            $A.test.clickOrTouch(pager);
            var trs = cmp.find("grid").getElement().getElementsByTagName("tbody")[0].children;
            var firstTr = $A.util.getText(trs[0]);
            var lastTr = $A.util.getText(trs[trs.length-1]);
            
            $A.test.assertTrue(firstTr.indexOf("100")>-1,"We are on the wrong page, we should be on row 51-100");
            $A.test.assertTrue(lastTr.indexOf("51")>-1,"We are on the wrong page, we should be on row 51-100"); 
        }
    },
    
    /**
     * Need to click twice to make item sortable.
     * Bug tracking this: W-2251122
     */
    testSorting : {
        attributes : {"pageSize" : 50, "currentPage" : 1},
        test : function(cmp){
                var anchor = $A.test.getElementByClass("toggle")[0];
                $A.test.clickOrTouch(anchor);
                var trs = cmp.find("grid").getElement().getElementsByTagName("tbody")[0].children;
                var firstTr = $A.util.getText(trs[0]);
                var lastTr = $A.util.getText(trs[trs.length-1]);
                
                $A.test.assertTrue(firstTr.indexOf("50")>-1,"We are on the wrong page, we should be on row 50-1");
                $A.test.assertTrue(lastTr.indexOf("1")>-1,"We are on the wrong page, we should be on row 50-1");
        }
    },
    
    /**
     * Helper functions
     */
    verifyPageInfoSaysCorrectNumber : function (cmp, expectedText){
        $A.test.assertEquals($A.test.getTextByComponent(cmp), expectedText, "There should be not elements through pagerinfo");
        
    },
    
    verifyNumberOfTrs : function(number, tbl){
        var trs = tbl.getElementsByTagName("tbody")[0].children;
        $A.test.assertEquals(number, trs.length, "The correct number of trs ("+number+") is currently not in the table");
    },
    
    verifyElementDisabled : function(cmp, pagerId, disabled){
        var pagerText = $A.test.getTextByComponent(cmp.find(pagerId)).toLowerCase();
        var assertValue = pagerText.indexOf("disabled") >= 0;
        var message = pagerId+" was not disabled and it should be";
        
        if(!disabled){
            assertValue = pagerText.indexOf("disabled") == -1; 
            message = pagerId+" was disabled and it should not be"
        }
        
        $A.test.assertTrue(assertValue, message);
    }
})