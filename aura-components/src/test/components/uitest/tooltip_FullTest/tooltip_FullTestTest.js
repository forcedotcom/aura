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
	
	/**
	 * Test to default attributes
	 */
	testDefault: {
		test: function(component) {
			var trigger = component.find("defaultlabel").getElement();
			var tt = component.find("default").getElement();
			var wrapper = tt.querySelector('span.tooltip');
			$A.test.assertTrue($A.util.hasClass(tt,"tooltip-basic"));
			$A.test.assertEquals("0ms", wrapper.style.transitionDuration);
			$A.test.assertEquals("0ms", wrapper.style.transitionDelay);
			$A.test.assertEquals("false", $A.test.getText(wrapper));			
		}
	},
	
	/**
	 * Test to check Body Attribute
	 */
	testBody: {
		test: function(component) {
			
			var triggers = ['bodyalphanumlabel', 'bodyhtmlimgtag', 'table' ];
			var tooltips = ['bodyalphanum', 'bodyhtmlimg', 'bodyhtmltbl'];
			var trigger = "";
			var tt = "";
			for(var i = 0; i < triggers.length; i++) {
				if(triggers[i] != "table")	
					trigger = component.find(triggers[i]).getElement();
				else
					trigger = document.getElementById(triggers[2]);
				tt = component.find(tooltips[i]);
				var ttElem = $A.test.getElementByClass(tooltips[i])[0];
				$A.test.assertFalse($A.util.hasClass(ttElem,"visible"), "Tooltip should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.fireDomEvent(trigger, "mouseover");			
				$A.test.addWaitForWithFailureMessage(true, function(){return ($A.util.hasClass(ttElem,"visible"));}, "Problem with tooltip having aura:id = " + tooltips[i]);
					
			}
		}
	},
	
	/**
	 * Test to check Disabled Attribute
	 */
	testDisabled: {
		
		test: function(component) {
			var triggers = ['disabledfalselabel', 'disabledtruelabel', 'disabledemptylabel'];
			var tooltips = ['disabledfalse', 'disabledtrue', 'disabledempty'];
			var assertions = [false, true, false];
			var trigger = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i = 0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]);
				tooltipElem = tt.getElement();
				wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tt,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.fireDomEvent(trigger, "mouseover");
				
				if(assertions[i])
					$A.test.assertTrue($A.util.hasClass(wrapper,"disabled"), "Disabled class is not attached to tooltip with aura:id = "+ tooltips[i]);
				else
					$A.test.assertFalse($A.util.hasClass(wrapper,"disabled"), "Disabled class should not be attached to tooltip with aura:id = "+ tooltips[i]);
			}
			
		}
	},
	
	/**
	 * Test to check Advanced Attribute
	 */
	testAdvanced: {
		
		test: function(component) {
			var triggers = ['advTrueButton', 'advFalseButton', 'advEmptyButton'];
			var tooltips = ['advTrueTooltip', 'advFalseTooltip', 'advEmptyTooltip'];			
			var trigger = "";
			var tt = "";
			for(var i = 0; i < triggers.length; i++) {
				function checkAdvanced(tooltip, trigger) {
					var triggerElem = component.find(trigger).getElement();
					var tt = component.find(tooltip);
					var ttElem = $A.test.getElementByClass(tooltip)[0];
					$A.test.assertFalse($A.util.hasClass(ttElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
					$A.test.clickOrTouch(triggerElem, true, true);
					if(tt.get('v.advanced')) {
						var wrapper = $A.test.getElementByClass(tooltips[i])[0];
						var body = wrapper.querySelector('div.tooltip-body');
						$A.test.addWaitForWithFailureMessage(true, function(){ return ($A.util.hasClass(wrapper, "visible")); }, "Tooltip not visible");
						$A.test.assertTrue($A.util.hasClass(body,'tooltip-advanced'),"tooltip-advanced class not attached to tooltip with aura:id " + tooltips[i]);
					}
					else {
						var wrapper = $A.test.getElementByClass(tooltips[i])[0];
						$A.test.assertFalse($A.util.hasClass(wrapper, "visible"),"Tooltip should not be visible");
						var body = wrapper.querySelector('span.tooltip-body');
						$A.test.assertFalse($A.util.hasClass(body,'tooltip-advanced'),"tooltip-advanced class should not be attached to tooltip with aura:id " + tooltips[i]);
					}
				}
				checkAdvanced(tooltips[i], triggers[i]);				
			}	
		
		}			
	},
	
	/**
	 * Test to check Trigger Attribute with Advanced set to true
	 */
	testTrigger: {
		
		test: [
		        function(cmp) {
		        	this.checkTrigger(cmp, "triggerhover", "triggerhoverlabel", "mouseover", true);
		        },
		        function(cmp) {
		        	this.checkTrigger(cmp, "triggerclick", "triggerclicklabel", "click", true);
		        },
		        function (cmp) {
		        	this.checkTrigger(cmp, "triggerfocus", "inputadvtrue", "focus", true);
		        },
		        function (cmp) {
		        	this.checkTrigger(cmp, "triggernone", "triggernonelabel", "mouseover", false);
		        },
		        function(cmp) {
		        	this.checkTrigger(cmp, "triggerempty", "triggeremptylabel", "mouseover", false);
		        },
		        function(cmp) {
		        	this.checkTrigger(cmp, "triggerempty", "triggeremptylabel", "click", false);
		        }]
			
			
	},
	
	checkTrigger : function(component, ttLabel, triggerLabel, domEvent, assertion) {
		var trigger = component.find(triggerLabel).getElement();
		var tt = component.find(ttLabel);
		var ttElem = $A.test.getElementByClass(ttLabel)[0];
		$A.test.assertFalse($A.util.hasClass(ttElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ ttLabel);
		$A.test.fireDomEvent(trigger, domEvent);		
		$A.test.addWaitForWithFailureMessage(assertion, function(){return ($A.util.hasClass(ttElem,"visible"));}, "Problem with tooltip having aura:id = " + ttLabel);
	},
	
	/**
	 * Test to check Trigger Attribute with Advanced set to false
	 */
	testTriggerAdvancedFalse: {
	
		test: function(component) {
			var triggers = ['triggerhoveradvfalselabel', 'triggerclickadvfalselabel', 'triggerfocusadvfalseinput', 'triggernoneadvfalse', 'triggeremptyadvfalselabel'];
			var tooltips = ['triggerhoveradvfalse', 'triggerclickadvfalse', 'triggerfocusadvfalse', 'triggernoneadvfalse', 'triggeremptyadvfalse'];
			var trigger = "";
			var tt = "";
			for(var i = 0;i < triggers.length; i++) {
				var trigger = component.find(triggers[i]).getElement();
				var tt = component.find(tooltips[i]).getElement();	
				$A.test.assertFalse($A.util.hasClass(tt,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertTrue($A.util.hasClass(tt,"tooltip-basic"), "tooltip-basic styling not attached to tooltip having aura:id = " + tooltips[i]);
				
			}
		
		}
	},
	
	/**
	 * Test to check Trigger Attribute with Advanced set to false
	 */
	testTriggerClass: {
		
		test: function(component) {
			var triggers = ['trigClassAlphalabel', 'trigClassNumlabel', 'trigClassSpllabel'];
			var tooltips = ['trigClassAlpha', 'trigClassNum', 'trigClassSpl'];
			var triggerClasses = ['myTriggerClass', '1234', 'ab:12;$%∆∑π¬'];
			var trigger = "";
			var tt = "";
			for(var i = 0;i < triggers.length; i++) {
				var trigger = component.find(triggers[i]).getElement();
				var tt = component.find(tooltips[i]).getElement();
				$A.test.assertFalse($A.util.hasClass(tt,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertTrue($A.util.hasClass(tt, triggerClasses[i]));
				
			}
		}		
	},

	/**
	 * Test to check fadeInDuration Attribute
	 */
	testFadeInDuration: {
		test: function(component) {
			var triggers = ['fadeInDuration0label', 'fadeInDuration200label', 'fadeInDuration5000label', 'fadeInDuration-1000label', 'fadeInDurationemptylabel'];
			var tooltips = ['fadeInDuration0', 'fadeInDuration200', 'fadeInDuration5000', 'fadeInDuration-1000', 'fadeInDurationempty'];
			var durations = ['0ms', '200ms', '5000ms', '0ms', '0ms'];
			var assertions = [false, true, true, false, false];
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i = 0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]);
				tooltipElem = tt.getElement();
				wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(durations[i], wrapper.style.transitionDuration, "fadeInDuration does not match expected for tooltip with aura:id = " + tooltips[i]);
		
				if(assertions[i]) {
					$A.test.assertTrue($A.util.hasClass(wrapper,"fade-in"), "fade-in class not attached to tooltip having aura:id = " + tooltips[i]);
					$A.test.assertFalse($A.util.hasClass(wrapper,"fade-out"), "fade-out class should not be attached to tooltip having aura:id = " + tooltips[i]);
				}
				else
					$A.test.assertFalse($A.util.hasClass(wrapper,"fade-in"), "fade-in class should not be attached to tooltip having aura:id = " + tooltips[i]);
				
			}
		
		}		
	},

	/**
	 * Test to check fadeOutDuration Attribute
	 */
	testFadeOutDuration: {
		test: function(component) {
			var triggers = ['fadeOutDuration0label', 'fadeOutDuration200label', 'fadeOutDuration5000label', 'fadeOutDuration-1000label', 'fadeOutDurationemptylabel'];
			var tooltips = ['fadeOutDuration0', 'fadeOutDuration200', 'fadeOutDuration5000', 'fadeOutDuration-1000', 'fadeOutDurationempty'];
			var durations = ['0ms', '200ms', '5000ms', '0ms', '0ms'];
			var assertions = [false, true, true, false, false];
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i =0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]);
				tooltipElem = tt.getElement();
				wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(durations[i], wrapper.style.transitionDuration, "fadeOutDuration does not match expected for tooltip having aura:id = " + tooltips[i]);
				if(assertions[i]) {
					$A.test.assertTrue($A.util.hasClass(wrapper,"fade-out"), "fade-out class not attached to tooltip having aura:id = " + tooltips[i]);
					$A.test.assertFalse($A.util.hasClass(wrapper,"fade-in"), "fade-in class should not be attached to tooltip having aura:id = " + tooltips[i]);
				}
					
				else
					$A.test.assertFalse($A.util.hasClass(wrapper,"fade-out"), "fade-out class should not be attached to tooltip having aura:id = " + tooltips[i]);
			}
		
		}		
	},
	
	/**
	 * Test to check fadeOutDuration Attribute
	 */
	testFadeInAndFadeOut: {
		test: function(component) {
			var triggers = ['fadeIn1000fadeOut0label', 'fadeIn100fadeOut3000label', 'fadeIn3000fadeOut100label', 'fadeIn0fadeOut1000label', 'fadeIn-1000fadeOut3000label', 'fadeIn3000fadeOut-1000label', 'fadeInfadeOutEmptylabel'];
			var tooltips = ['fadeIn1000fadeOut0', 'fadeIn100fadeOut3000', 'fadeIn3000fadeOut100', 'fadeIn0fadeOut1000', 'fadeIn-1000fadeOut3000', 'fadeIn3000fadeOut-1000' ,'fadeInfadeOutEmpty'];
			var durations = ['1000ms', '3000ms', '3000ms', '1000ms', '3000ms', '3000ms', '0ms'];
			var classes = ["fade-in", "fade-in fade-out", "fade-in fade-out", "fade-out", "fade-out", "fade-in", ""];
			var trigger = "";
			var tt = "";
			var wrapper = "";
			for(var i =0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]).getElement();
				wrapper = tt.querySelector("span.tooltip");
				$A.test.assertFalse($A.util.hasClass(tt,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(durations[i], wrapper.style.transitionDuration, "fadeInDuration or fadeOutDuration does not match expected for tooltip having aura:id = " + tooltips[i]);
				if(classes[i] != "") {
					$A.test.assertTrue($A.util.hasClass(wrapper,classes[i]),"Appropriate class not attached to tooltip having aura:id = " + tooltips[i]);
				}
				else {
					$A.test.assertFalse($A.util.hasClass(wrapper,"fade-in"),"fade-in class should not be attached to tooltip having aura:id = " + tooltips[i]);
					$A.test.assertFalse($A.util.hasClass(wrapper,"fade-out"),"fade-out class should not be attached to tooltip having aura:id = " + tooltips[i]);
				}
					
				
			}
		}
	},
	
	/**
	 * Test to check Delay Attribute
	 */
	testDelay: {
		test: function(component) {
			var triggers = ['delay0label', 'delay300label', 'delay3000label', 'delay-150label', 'delay-1000label', 'delayemptylabel'];
			var tooltips = ['delay0','delay300', 'delay3000', 'delay-150', 'delay-1000', 'delayempty'];
			var delayDurations = ['0ms', '300ms', '3000ms', '-150ms', '-1000ms',''];
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i =0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]);
				tooltipElem = tt.getElement();
				wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tt,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(delayDurations[i], wrapper.style.transitionDelay, "Delay duration does not match expected for tooltip having aura:id = " + tooltips[i]);
			}
		
		}
	},

	/**
	 * Test to check fadeInDuration Attribute with a specified Delay
	 */
	testDelayFadeIn: {
		test: function(component) {
			var triggers = ['delay0FadeInlabel', 'delay300FadeInlabel', 'delay3000FadeInlabel', 'delay-200FadeInlabel', 'delay-1000FadeInlabel', 'delayEmptyFadeInlabel'];
			var tooltips = ['delay0FadeIn', 'delay300FadeIn', 'delay3000FadeIn', 'delay-200FadeIn', 'delay-1000FadeIn', 'delayEmptyFadeIn'];
			var delayDuration = ['0ms', '300ms', '3000ms', '-200ms', '-1000ms',''];
			var fadeInDuration = "500ms";
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i = 0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]);
				tooltipElem = tt.getElement();
				wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(delayDuration[i], wrapper.style.transitionDelay, "Delay duration did not match expected for tooltip having aura:id = " + tooltips[i]);
				$A.test.assertEquals(fadeInDuration, wrapper.style.transitionDuration, "fadeInDuration did not match expected for tooltip having aura:id = " + tooltips[i]);
				$A.test.assertTrue($A.util.hasClass(wrapper,"fade-in"), "fade-in class is not attached to tooltip having aura:id = " + tooltips[i]);
				$A.test.assertFalse($A.util.hasClass(wrapper,"fade-out"), "fade-out class should not be attached to tooltip having aura:id = " + tooltips[i]);
			}
		
		}		
	},
	
	/**
	 * Test to check fadeOutDuration Attribute with a specified Delay
	 */

	testDelayFadeOut: {
		test: function(component) {
			var triggers = ['delay0FadeOutlabel', 'delay300FadeOutlabel', 'delay3000FadeOutlabel', 'delay-200FadeOutlabel', 'delay-1000FadeOutlabel', 'delayEmptyFadeOutlabel'];
			var tooltips = ['delay0FadeOut', 'delay300FadeOut', 'delay3000FadeOut', 'delay-200FadeOut', 'delay-1000FadeOut', 'delayEmptyFadeOut'];
			var delayDuration = ['0ms', '300ms', '3000ms', '-200ms', '-1000ms',''];
			var fadeOutDuration = "500ms";
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i = 0; i < triggers.length; i++) {
				var trigger = component.find(triggers[i]).getElement();
				var tt = component.find(tooltips[i]);
				var tooltipElem = tt.getElement();
				var wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(delayDuration[i], wrapper.style.transitionDelay, "Delay duration did not match expected for tooltip having aura:id = " + tooltips[i]);
				$A.test.assertEquals(fadeOutDuration, wrapper.style.transitionDuration, "fadeOutDuration did not match expected for tooltip having aura:id = " + tooltips[i]);
				$A.test.assertTrue($A.util.hasClass(wrapper,"fade-out"), "fade-out class is not attached to tooltip having aura:id = " + tooltips[i]);
				$A.test.assertFalse($A.util.hasClass(wrapper,"fade-in"), "fade-in class should not be attached to tooltip having aura:id = " + tooltips[i]);
			}
		
		}		
	},
	
	/**
	 * Test to check if an extra class can be passed using the class Attribute
	 */
	testClass: {
		test: function(component) {
			var triggers = ['classAlphalabel', 'classNumLabel', 'classSplLabel', 'classDashLabel'];
			var tooltips = ['classAlpha', 'classNum', 'classSpl', 'classDash'];
			var classNames = ['myOwnClassHERE', '1234', 'a:12;å¬∑πßå', '--a'];
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			var wrapper = "";
			for(var i = 0; i < triggers.length; i++) {
				var trigger = component.find(triggers[i]).getElement();
				var tt = component.find(tooltips[i]);
				var tooltipElem = tt.getElement();
				var wrapper = tooltipElem.querySelector('span.tooltip');	
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertTrue($A.util.hasClass(wrapper,classNames[i]), "class name did not match expected for tooltip having aura:id = " + tooltips[i]);
			}
		
		}
	},
	
	/**
	 * Test to check contents of the tooltip body
	 */
	testTooltipBody: {
		test: function(component) {
			var triggers = ['bodyNormallabel', 'bodyManylabel', 'bodyHTMLlabel', 'bodyEmptylabel'];
			var tooltips = ['bodyNormal', 'bodyMany', 'bodyHTML', 'bodyEmpty'];
			var expectedBodies = ["This is a fairly normal amount of text that you would put in the tooltip. Maybe a bit more is fine too. Don't forget to include spl. chars (\"!@#$%*^ ÅıÇΩœ∑®†¥ˆøπ¬˚∆˙©ƒ∂ßåΩ≈ç√∫˜µ≤≥ & \")",
			                      "This is a fairly normal amount of text that you would put in the tooltip. Maybe a bit more is fine too. Don't forget to include spl. chars (\"!@#$%*^ ÅıÇΩœ∑®†¥ˆøπ¬˚∆˙©ƒ∂ßåΩ≈ç√∫˜µ≤≥ & \") This info here is just to add some more text to the tooltip. Just adding more and more! It's like theres no end to this right? Wrong! All you need is patience. Man! I have to move this test further down the screen just because this tooltip has so many characters! Its just growing and growing. I don't know if the text will overflow. It doesn't look like it will. This was pretty well written so its all been handled very well! Don't you worry, we've got your back!",
			                      "<h1>Hello</h1>",
			                      ""]
			var tooltipElem = "";
			var wrapper = "";
			var trigger = "";
			var tt = "";
			for(var i = 0; i < triggers.length; i++) {
				trigger = component.find(triggers[i]).getElement();
				tt = component.find(tooltips[i]);
				tooltipElem = tt.getElement();
				wrapper = tooltipElem.querySelector('span.tooltip');
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				$A.test.assertEquals(expectedBodies[i], $A.test.getText(wrapper).trim(), "Content of the tooltip did not match expected for tooltip with aura:id = " + tooltips[i]);
				
			}
		
		} 
	},

	/**
	 * Test to check if a dom-id can be passed using the domId Attribute
	 */
	testdomId: {
		test: function(component) {
			var triggers = ['domIdAlphaLabel', 'domIdNumLabel', 'domIdSplLabel', 'domIdEmptyLabel'];
			var tooltips = ['domIdAlpha', 'domIdNum', 'domIdSpl', 'domIdEmpty'];
			var expectedDomIds = ["testDomId", "1234", "a:1;%$∆ß∫åœ∑", ""];
			var trigger = "";
			var tt = "";
			var tooltipElem = "";
			for(var i = 0; i < triggers.length; i++) {
				var trigger = component.find(triggers[i]).getElement();
				var tt = component.find(tooltips[i]);
				var tooltipElem = tt.getElement();
				var domId = tooltipElem.getAttribute('aria-describedby');
				$A.test.assertFalse($A.util.hasClass(tooltipElem,"visible"), "Tooltip visible should not be visible at this point for tooltip with aura:id = "+ tooltips[i]);
				if(triggers[i] == "domIdEmptyLabel")
					$A.test.assertNotEquals(expectedDomIds[i], domId, "domId should be resolved to globalId for tooltip with aura:id = " + tooltips[i]);
				else
					$A.test.assertEquals(expectedDomIds[i], domId, "domId did not match expected for tooltip with aura:id = " + tooltips[i]);
			
			}
		}	
	},
	
	testStickiness : {
		test : [
		        	//checking tooltips whose advanced attribute is true
		        	//when advanced is false, we need to hover over the tooltip to display it
					function(component) {
						var triggers = ["bodyhtmlimgtag", "triggerhoverlabel"];
						var tooltips = ["bodyhtmlimg", "triggerhover"];
						
						for(var i = 0; i < tooltips.length; i++) {
							this.openOrCloseTT(component, triggers[i], tooltips[i], "open");
						}
					},
					function(component) {
						var triggers = ["bodyhtmlimgtag", "triggerhoverlabel"];
						var tooltips = ["bodyhtmlimg", "triggerhover"];
						
						for(var i = 0; i < tooltips.length; i++) {
							this.openOrCloseTT(component, triggers[i], tooltips[i], "close");
						}
					}
				]
	},
	
	/**
	 * Test to check if a Modal containing tooltips functions properly when opened and closed
	 */
	testModal : {
		test : [
		        function(cmp) {
		        	var modalBtn = cmp.find("modalBtn").getElement();
		        	this.openOrCloseModal(cmp, modalBtn, "open");
		        },
		        function(cmp) {
		        	var closeBtn = $A.test.select(".closeBtn")[0];
		        	this.openOrCloseModal(cmp, closeBtn, "close");
		        },
		        ]
	},
	
	openOrCloseTT : function(component, ttLabel, tooltip, action) {
		var trigger = component.find(ttLabel).getElement();
		var tt = component.find(tooltip);
		var ttElem = $A.test.getElementByClass(tooltip)[0];
		if(action == "open") {
			$A.test.fireDomEvent(trigger, "mouseover");
			$A.test.addWaitForWithFailureMessage(true, function(){return ($A.util.hasClass(ttElem,"visible"));}, "Tooltip not opening for tooltip with aura:id = " + tooltip);
		}
		else if(action == "close") {
			$A.test.fireDomEvent(trigger, "mouseout");
			$A.test.addWaitForWithFailureMessage(false, function(){return ($A.util.hasClass(ttElem,"visible"));}, "Tooltip not closing for tooltip with aura:id = " + tooltip);
		}
	},
	
	openOrCloseModal : function(cmp, btnElement, action) {

    	$A.test.fireDomEvent(btnElement, "click");
    	$A.test.addWaitForWithFailureMessage(true, function(){
    		var modals =$A.test.select(".uiModal");
 
    		if(action == "open") {
    			if(modals.length > 0){
        			return true;
        		}
        		else{
        			return false;
        		}
    		}
    		else {
    			if(modals.length == 0){
    				return true;
    			}
    			else {
    				return false;
    			}		
    		}
    			
    	}, "Could not complete action: " + action);
	}

})