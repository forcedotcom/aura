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
	browsers : [ "GOOGLECHROME", "FIREFOX", "IE11", "SAFARI" ],
    
    getDataTransfer: function() {
    	return {
            data: {
            },
            types: [],
            setData: function(type, val){
                    this.data[type] = val;
                    this.types.push(type);
            },
            getData: function(type){
                    return this.data[type];
            },
            effectAllowed: null,
            dropEffect: null
        };
    },
    
    fireDragAndDropEvent: function(element, dataTransfer, eventType) {
    	var event = document.createEvent("HTMLEvents");
    	event.initEvent(eventType, true, true);
    	event.dataTransfer = dataTransfer;
    	element.dispatchEvent(event);
    },
    
    dragAndDrop: function(dragElement, dropElement, dataTransfer) { 
    	this.fireDragAndDropEvent(dragElement, dataTransfer, "dragstart");
     	this.fireDragAndDropEvent(dropElement, dataTransfer, "dragenter");
     	this.fireDragAndDropEvent(dropElement, dataTransfer, "dragover");
     	this.fireDragAndDropEvent(dropElement, dataTransfer, "drop");
     	this.fireDragAndDropEvent(dragElement, dataTransfer, "dragend"); 
    },
    
    waitForDragEnd: function(element, callback) {
		$A.test.addWaitForWithFailureMessage(true, function() {
				var itemsInDropzone = element.getElementsByClassName("uiDraggable");
				if (itemsInDropzone) {
					return itemsInDropzone.length > 1;
				} else {
					return false;
				}
			}, 
			"Drag and drop did not complete in timely fashion.", 
			callback); 
    },
    
    /**
     * Tests drag and drop happy path
     */
	testDragAndDrop : {
		test : function(cmp) {
            var draggableCmp = cmp.find("draggableMove");
            var dragText = $A.test.getText(draggableCmp.getElement());
            var dropzoneCmp = cmp.find("dropzoneMove"); 
         	var dataTransfer = this.getDataTransfer();
         	this.dragAndDrop(draggableCmp.getElement(), dropzoneCmp.getElement(), dataTransfer);      	
         	this.waitForDragEnd(dropzoneCmp.getElement(), function() {
         		var found = false;
             	var itemsInDropzone = dropzoneCmp.getElement().getElementsByClassName("uiDraggable");
             	for(var i = 0; i < itemsInDropzone.length; i++) {         		
             		var dragTextByIndex = $A.test.getText(itemsInDropzone[i]);
             		if(dragText === dragTextByIndex) {
             			found = true;
             		}
             	}
             	$A.test.assertTrue(found);
         	});
    	}
    },
    
    /**
     * Tests unsuccessful drag and drop due to draggable.cmp and dropzone.cmp type mismatch.
     */
	testDragAndDropTypeMisMatch : {
		test : function(cmp) {
            var draggableCmp = cmp.find("draggableMove");
            var dragText = $A.test.getText(draggableCmp.getElement());
            var dropzoneCmp = cmp.find("dropzoneCopy"); 
            var dataTransfer = this.getDataTransfer();
         	this.dragAndDrop(draggableCmp.getElement(), dropzoneCmp.getElement(), dataTransfer);  
         	setTimeout(function() { 
         		var itemsInDropzone = dropzoneCmp.getElement().getElementsByClassName("uiDraggable");
         		$A.test.assertTrue(itemsInDropzone.length === 1);
         		}, 2000);
    	}
    },
    
    /**
     * Tests unsuccessful drag and drop due to draggable.cmp and dropzone.cmp with no type.
     */
	testDragAndDropTypeNone : {
		test : function(cmp) {
            var draggableCmp = cmp.find("draggableNone");
            var dragText = $A.test.getText(draggableCmp.getElement());
            var dropzoneCmp = cmp.find("dropzoneNone"); 
            var dataTransfer = this.getDataTransfer();
         	this.dragAndDrop(draggableCmp.getElement(), dropzoneCmp.getElement(), dataTransfer);  
         	setTimeout(function() { 
         		var itemsInDropzone = dropzoneCmp.getElement().getElementsByClassName("uiDraggable");
         		$A.test.assertTrue(itemsInDropzone.length === 1);
         		}, 2000);
    	}
    },
    
    /**
     * Tests no-op drag and drop due dragging to dropzone origin.
     */
	testDragAndDropToOrigin : {
		test : function(cmp) {
            var draggableCmp = cmp.find("draggableNone");
            var dragText = $A.test.getText(draggableCmp.getElement());
            var dropzoneCmp = cmp.find("dropzoneCopy"); 
            var dataTransfer = this.getDataTransfer();
         	this.dragAndDrop(draggableCmp.getElement(), dropzoneCmp.getElement(), dataTransfer);   
         	setTimeout(function() { 
         		var itemsInDropzone = dropzoneCmp.getElement().getElementsByClassName("uiDraggable");
         		$A.test.assertTrue(itemsInDropzone.length === 1);
         		}, 2000);
    	}
    },
    
    /**
     * Tests dataTransfer.effectAllowed is modified after "dragstart" event.
     */
	testDataTransferEffectAllowed : {
		test : function(cmp) {
            var draggableCmp = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove"); 
            var dataTransfer = this.getDataTransfer();
            this.fireDragAndDropEvent(draggableCmp.getElement(), dataTransfer, "dragstart");
            $A.test.assertTrue(dataTransfer.effectAllowed === "move");
    	}
    },
    
    /**
     * Tests dataTransfer.dropEffect is modified after "dragover" event.
     */
	testDataTransferDropEffect : {
		test : function(cmp) {
            var draggableCmp = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove"); 
            var dataTransfer = this.getDataTransfer();
            this.fireDragAndDropEvent(draggableCmp.getElement(), dataTransfer, "dragstart");
         	this.fireDragAndDropEvent(dropzoneCmp.getElement(), dataTransfer, "dragenter");
         	this.fireDragAndDropEvent(dropzoneCmp.getElement(), dataTransfer, "dragover");
            $A.test.assertTrue(dataTransfer.dropEffect === "move");
    	}
    },
    
    /**
     * Tests that the draggableHelper.handleDragStart is called after DOM event "dragstart" is fired.
     */
	testDomEventFiresAuraDragStartEvent : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove");
        	var helper = draggableCmp1.helper;
        	var handleDragStartCalled = false;
         	$A.test.overrideFunction(helper, "handleDragStart",
         		function (component, event) {
         			handleDragStartCalled = true;
         	});  
            $A.test.fireDomEvent(draggableCmp1.getElement(), "dragstart");
         	$A.test.assertTrue(handleDragStartCalled);
    	}
    },
    
    /**
     * Tests that the draggableHelper.handleDragStart is called multiple times each time DOM event "dragstart" is fired.
     */
	testDomEventFiresAuraDragStartEventsWithMultipleDraggables : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var draggableCmp2 = cmp.find("draggableCopy");
            var dropzoneCmp = cmp.find("dropzoneMove");
        	var helper1 = draggableCmp1.helper;
        	var helper2 = draggableCmp2.helper;
        	var handleDragStartCalled;
         	$A.test.overrideFunction(helper1, "handleDragStart",
         		function (component, event) {
         			handleDragStartCalled = true;
         	});    
         	$A.test.overrideFunction(helper2, "handleDragStart",
         		function (component, event) {
         			handleDragStartCalled = true;
         	}); 
            $A.test.fireDomEvent(draggableCmp1.getElement(), "dragstart");
            $A.test.assertTrue(handleDragStartCalled);
            handleDragStartCalled = false;
            $A.test.fireDomEvent(draggableCmp2.getElement(), "dragstart");
         	$A.test.assertTrue(handleDragStartCalled);
    	}
    },
    
    /**
     * Tests that the draggableHelper.handleDragEnd is called after DOM event "dragend" is fired.
     */
	testDomEventFiresAuraDragEndEvent : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove");
        	var helper = draggableCmp1.helper;
        	var handleDragEndCalled;
         	$A.test.overrideFunction(helper, "handleDragEnd",
         		function (component, event) {
         			handleDragEndCalled = true;
         	});      	
            $A.test.fireDomEvent(draggableCmp1.getElement(), "dragend");
         	$A.test.assertTrue(handleDragEndCalled);
    	}
    },
       
    /**
     * Tests that the draggableHelper.handleDragEnd is called multiple times each time DOM event "dragend" is fired.
     */
    testDomEventFiresAuraDragEndEventsWithMultipleDraggables : {
		test : function(cmp) {
	           var draggableCmp1 = cmp.find("draggableMove");
	            var draggableCmp2 = cmp.find("draggableCopy");
	            var dropzoneCmp = cmp.find("dropzoneMove");
	        	var helper1 = draggableCmp1.helper;
	        	var helper2 = draggableCmp2.helper;
	        	var handleDragEndCalled;
	         	$A.test.overrideFunction(helper1, "handleDragEnd",
	         		function (component, event) {
	         			handleDragEndCalled = true;
	         	});    
	         	$A.test.overrideFunction(helper2, "handleDragEnd",
	         		function (component, event) {
	         			handleDragEndCalled = true;
	         	}); 
	            $A.test.fireDomEvent(draggableCmp1.getElement(), "dragend");
	            $A.test.assertTrue(handleDragEndCalled);
	            handleDragEndCalled = false;
	            $A.test.fireDomEvent(draggableCmp2.getElement(), "dragend");
	         	$A.test.assertTrue(handleDragEndCalled);
    	}
    },
    
    /**
     * Tests that the dropzoneHelper.handleDragEnter is called after DOM event "dragenter" is fired.
     */
	testDomEventFiresAuraDropEnterEvent : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove");
        	var helper = dropzoneCmp.helper;
        	var handleDragEnterCalled;
         	$A.test.overrideFunction(helper, "handleDragEnter",
         		function (component, event) {
         			handleDragEnterCalled = true;
         	});      	
            $A.test.fireDomEvent(dropzoneCmp.getElement(), "dragenter");
         	$A.test.assertTrue(handleDragEnterCalled);
    	}
    },
    
    /**
     * Tests that the dropzoneHelper.handleDragEnter is called multiple times each time DOM event "dragenter" is fired.
     */
	testDomEventFiresAuraDropEnterEventsWithMultipleDropzones : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp1 = cmp.find("dropzoneMove");
        	var helper1 = dropzoneCmp1.helper;
            var dropzoneCmp2 = cmp.find("dropzoneCopy");
        	var helper2 = dropzoneCmp2.helper;
        	var handleDragEnterCalled;
         	$A.test.overrideFunction(helper1, "handleDragEnter",
         		function (component, event) {
         			handleDragEnterCalled = true;
         	});    
         	$A.test.overrideFunction(helper2, "handleDragEnter",
         		function (component, event) {
         			handleDragEnterCalled = true;
         	});  
            $A.test.fireDomEvent(dropzoneCmp1.getElement(), "dragenter");
         	$A.test.assertTrue(handleDragEnterCalled);
         	handleDragEnterCalled = false;
            $A.test.fireDomEvent(dropzoneCmp2.getElement(), "dragenter");
         	$A.test.assertTrue(handleDragEnterCalled);
    	}
    },
    
    /**
     * Tests that the dropComponent is update each time DOM event "dragenter" is fired.
     */
	testDragEventDropComponentWhileEnteringMultipleDropzones : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp1 = cmp.find("dropzoneMove");
            var dropzoneCmp2 = cmp.find("dropzoneCopy");
            var helper1 = dropzoneCmp1.helper;
        	var helper2 = dropzoneCmp2.helper;
        	var dropComponent;
         	$A.test.overrideFunction(helper1, "handleDragEnter",
         		function (component, event) {
		     		dropComponent = component;
         	});  
         	$A.test.overrideFunction(helper2, "handleDragEnter",
         		function (component, event) {
		     		dropComponent = component;
         	});  
            $A.test.fireDomEvent(dropzoneCmp1.getElement(), "dragenter");
            $A.test.fireDomEvent(dropzoneCmp2.getElement(), "dragenter");
         	$A.test.assertEquals(dropzoneCmp2, dropComponent);
    	}
    },
    
    /**
     * Tests that the dropzoneHelper.handleDragLeave is called after DOM event "dragleave" is fired.
     */
	testDomEventFiresAuraDropLeaveEvent : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove");
        	var helper = dropzoneCmp.helper;
        	var handleDragLeaveCalled;
         	var actual;
         	$A.test.overrideFunction(helper, "handleDragLeave",
         		function (component, event) {
         			handleDragLeaveCalled = true;
         	});      	
            $A.test.fireDomEvent(dropzoneCmp.getElement(), "dragleave");
         	$A.test.assertTrue(handleDragLeaveCalled);
    	}
    },
    
    /**
     * Tests that the dropzoneHelper.handleDragLeave is called multiple times each time DOM event "dragleave" is fired.
     */
	testDomEventFiresAuraDropLeaveEventsWithMultipleDropzones : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp1 = cmp.find("dropzoneMove");
        	var helper1 = dropzoneCmp1.helper;
            var dropzoneCmp2 = cmp.find("dropzoneCopy");
        	var helper2 = dropzoneCmp2.helper;
        	var handleDragLeaveCalled;
         	$A.test.overrideFunction(helper1, "handleDragLeave",
         		function (component, event) {
         			handleDragLeaveCalled = true;
         	});    
         	$A.test.overrideFunction(helper2, "handleDragLeave",
         		function (component, event) {
         			handleDragLeaveCalled = true;
         	});  
            $A.test.fireDomEvent(dropzoneCmp1.getElement(), "dragleave");
         	$A.test.assertTrue(handleDragLeaveCalled);
         	handleDragLeaveCalled = false;
            $A.test.fireDomEvent(dropzoneCmp2.getElement(), "dragleave");
         	$A.test.assertTrue(handleDragLeaveCalled);
    	}
    },
    
    /**
     * Tests that the dropComponent is update each time DOM event "dragleave" is fired.
     */
    testDragEventDropComponentWhileLeavingMultipleDropzones : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp1 = cmp.find("dropzoneMove");
            var dropzoneCmp2 = cmp.find("dropzoneCopy");
            var helper1 = dropzoneCmp1.helper;
        	var helper2 = dropzoneCmp2.helper;
        	var dropComponent;
         	$A.test.overrideFunction(helper1, "handleDragLeave",
         		function (component, event) {
		     		dropComponent = component;
         	});  
         	$A.test.overrideFunction(helper2, "handleDragLeave",
         		function (component, event) {
		     		dropComponent = component;
         	});  
            $A.test.fireDomEvent(dropzoneCmp1.getElement(), "dragleave");
            $A.test.fireDomEvent(dropzoneCmp2.getElement(), "dragleave");
         	$A.test.assertEquals(dropzoneCmp2, dropComponent);
    	}
    },
    
    /**
     * Tests that the dropzoneHelper.handleDrop is called after DOM event "drop" is fired.
     */
	testDomEventFiresAuraDropEvent : {
		test : function(cmp) {
            var draggableCmp1 = cmp.find("draggableMove");
            var dropzoneCmp = cmp.find("dropzoneMove");
        	var helper = dropzoneCmp.helper;
        	var handleDropCalled;
         	$A.test.overrideFunction(helper, "handleDrop",
         		function (component, event) {
         			handleDropCalled = true;
         	});      	
            $A.test.fireDomEvent(dropzoneCmp.getElement(), "drop");
         	$A.test.assertTrue(handleDropCalled);
    	}
    },
    fireDragAndDropViaKeyboard: function(dragCmp, callback){
    	var event = {
				keyCode : 32, //space
				which: 32,
				preventDefault : function(){},
				target: dragCmp.getElement()
		};
		var helper = dragCmp.helper;
		helper.handleKeyPress(dragCmp, event);
		$A.test.addWaitForWithFailureMessage(true, 
			function(){
				var uiMenu = $A.test.getElementByClass("uiMenuList");
				return window.getComputedStyle(uiMenu[0]).display != "none"; 
			}, "dropzonMenu doesn't show up", callback);
    },
    /**
     * Test fireDragstart is fired when drag is initialed by keyboard
     */
     testInitialDragViaKeyboard : {
     	test : function(cmp){
     		var dragCmp = cmp.find("draggableMove");
     		var helper = dragCmp.helper;
     		var fireDragStartCalled = false;
          	$A.test.overrideFunction(helper, "fireDragStart",
          		function (component, event) {
          			fireDragStartCalled = true;
          	});  
          	//action
     		this.fireDragAndDropViaKeyboard(dragCmp);
          	//assert
          	$A.test.assertTrue(fireDragStartCalled);
     	}
     },
    /**
     * Test dropzoneMenu shows dropzones with the same types, and the draggable cmp apply the dragClass
     * The current dropzone and other type of dropzone should not show in the dropzoneMenu
     */
     testDropzoneMenuViaKeyboard : {
     	test : function(cmp){
     		var dragCmp = cmp.find("draggableMove2");
     		var expected = ["Dropzone Type: Move"];
     		//action
     		this.fireDragAndDropViaKeyboard(dragCmp, 
			 	function(){
     				//assert
     				var dropzoneMenu = cmp.find("accessibilityComponent").get("v.dropzoneMenu");
			 		$A.test.assertEquals(expected.length, dropzoneMenu.length);
		     		$A.test.assertTrue($A.test.contains($A.util.getElementAttributeValue(dragCmp.getElement(), "class"), "dragging"));
			 });
     	}
     },
    
     testDropViaKeyboard : {
         browsers : [ "FIREFOX" ],
    	 test : function(cmp) {
    		 var dragCmp = cmp.find("draggableCopy");
    		 var dragText = $A.test.getText(dragCmp.getElement());
    		 var helper = dragCmp.helper;
    		 var dropzoneCmp = cmp.find("dropzoneCopy");
			 //action
    		 this.fireDragAndDropViaKeyboard(dragCmp, function() {
			 	var space = {
			 		keyCode: 32, //Space key
			 		which: 32
			 	};
			 	var keyboardEvent = new KeyboardEvent('keydown', space);
			 	var dropzoneMenu = $A.test.getElementByClass("uiMenuItem");
			 	dropzoneMenu[0].dispatchEvent(keyboardEvent);
			 	//assert
			 	this.waitForDragEnd(dropzoneCmp.getElement(), function() {
			 		var found = false;
			 		var itemsInDropzone = dropzoneCmp.getElement().getElementsByClassName("uiDraggable");
			 		for(var i = 0; i < itemsInDropzone.length; i++) {
			 			var dragTextByIndex = $A.test.getText(itemsInDropzone[i]);
			 			if(dragText === dragTextByIndex) {
			 				found = true;
			 			}
			 		}
			 		$A.test.assertTrue(found);
			 	});
    		 });
    	 }
     }
})