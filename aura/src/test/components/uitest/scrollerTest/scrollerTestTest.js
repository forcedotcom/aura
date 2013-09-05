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
    testBasic: {
	browsers: ["-IE7","-IE8"],
        test: function(component) {
            // Add content to rubberbandingBecauseMissingRefresh to trigger
            // rubber banding
            var rubberbandingBecauseMissingRefresh = component
                    .find("rubberbandingBecauseMissingRefresh");
            var child = document.createElement('div');
            child.innerHTML = 'Some silly value';
            rubberbandingBecauseMissingRefresh.find('scrollContent').getElement().appendChild(child);

            var errors = $A.componentService.getDef('markup://ui:scroller').getHelper().validateScrollers();
            $A.test.assertEquals(2, errors.length, this.getErrorMsgs(errors));

            $A.test.assertTrue(errors[0].indexOf('Scroller instance was not created') > -1);
            $A.test.assertTrue(errors[1].indexOf('Rubberbanding detected: actual content height does not match cached height') > -1);
        }
    },

    testDynamicImages : {
	browsers: ["-IE7","-IE8"],
        test: [function(component) {
            // Update an image tag in the scrolled content to insure that this
            // does not cause a problem
            var imageToChange = component.find("dynamicImage").getElement();

            var imageLoaded;
            $A.util.on(imageToChange, "load", function() {
                // Give the scroller image update detection code time to run since there is a 400ms callback timeout
                setTimeout(function() {
                    imageLoaded = true;
                }, 1000);
            });

            $A.test.addWaitFor(true, function(){
                return imageLoaded;
            });

            imageToChange.src = "/auraFW/resources/img/msg_icons/warning32.png";
        },

        function(component) {
            var errors = $A.componentService.getDef('markup://ui:scroller').getHelper().validateScrollers();
            $A.test.assertEquals(1, errors.length, this.getErrorMsgs(errors));
            $A.test.assertTrue(errors[0].indexOf('Scroller instance was not created') > -1);
        }]
    },

    testPullToRefreshDiv: {
	browsers: ["-IE7","-IE8"],
        test: function(component) {
            // Make sure the "pull to refresh" div exists at the top of the scroll contents
            var pullDownDiv = $A.test.getElementByClass("pullToRefresh");
            $A.test.assertNotNull(pullDownDiv, "There should be a 'pullToRefresh' div");
            var scroller = component.find("pullToRefresh");
            $A.test.assertTrue(scroller._scroller.options.topOffset > 0, "Scroller should have a top offset");
        }
    },
    testScrollToBot : {
	browsers: ["-IE7","-IE8"],
	  test: function(component) {
	      var scrlr = component.find("scrollToYTest")._scroller;
	      
	      $A.test.assertEquals(this.getScrollerPos(component.find("scrollToYTest"), "top"),  scrlr.y, "The starting location of the scroller is incorrect");
	      component.find("toBotButton").get("e.press").fire();

	      $A.test.assertEquals( this.getScrollerPos(component.find("scrollToYTest"), "bot"), scrlr.y,  "The scroller did not end in the correct location");
	    
	  }
  },
  
  testScrollToTop : {
      browsers: ["-IE7","-IE8"],
	  test: function(component) {
	      var scrlr = component.find("scrollToYTest")._scroller;
	      
	      component.find("toBotButton").get("e.press").fire();;
	      
	      $A.test.assertEquals( this.getScrollerPos(component.find("scrollToYTest"), "bot"), scrlr.y, "The starting location of the scroller is incorrect");
	      component.find("toTopButton").get("e.press").fire();
	
	      $A.test.assertEquals( this.getScrollerPos(component.find("scrollToYTest"), "top"), scrlr.y, "The scroller did not end in the correct location");
	    
	  }
  },
  testScrollToRelativeDown : {
      browsers: ["-IE7","-IE8"],
	  test: function(component) {
	      var scrlr = component.find("scrollToYTest")._scroller;	      
	            
	      component.find("toStepButton").get("e.press").fire();
	      $A.test.assertEquals(-75, scrlr.y, "The starting location of the scroller is incorrect");
	      
	      component.find("toStepButton").get("e.press").fire();	
	      $A.test.assertEquals(-90, scrlr.y,  "The scroller did not end in the correct location");
	    
	  }
  },

  testScrollToRelativeUp : {
      browsers: ["-IE7","-IE8"],
	  test: function(component) {
	      var scrlr = component.find("scrollToYTest")._scroller;	      
	      component.find("toBotButton").get("e.press").fire();
	      var pos = this.getScrollerPos(component.find("scrollToYTest"), "bot");
	      component.find("toStepUpButton").get("e.press").fire();
	      
	      pos = pos + 15;
	      $A.test.assertEquals(pos, scrlr.y, "The starting location of the scroller is incorrect");
	      
	      component.find("toStepUpButton").get("e.press").fire();	
	      pos = pos + 15;
	      $A.test.assertEquals(pos, scrlr.y,  "The scroller did not end in the correct location");
	    
	  }
  },
  getScrollerPos : function(component, pos) {
	
	var scrollWrapper = component.find("scrollWrapper").getElement(),
	    scrollContent = component.find("scrollContent").getElement(),
	    offset;
	
	    if(pos === "top"){
		offset = component.find("pullDown").getElement();
		return (0 - offset.clientHeight);
	    }
	    
	    offset = component.find("pullUp").getElement();
	    return (0 - (scrollContent.clientHeight - scrollWrapper.clientHeight - offset.clientHeight));
  },
    getErrorMsgs : function(errorsArray) {
    	var errMsgs = "";
        if (errorsArray) {
        	for (var i=0; i<errorsArray.length; i++) {
        		errMsgs+="ERROR["+i+"]"+errorsArray[i]+"\n";
        	}
        }
        return errMsgs;
    }
})
