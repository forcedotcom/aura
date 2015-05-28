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
    init : function(cmp, evt, helper) {
        
        
 

    },

    destroy: function(cmp, evt, helper) {
        cmp.southConstraint.destroy();
        cmp.eastConstraint.destroy();
        cmp.westConstraint.destroy();
        cmp.northConstraint.destroy();
        cmp.bbConstraint.destroy();
        cmp.pointerConstraint.destroy(); 
        cmp.pointerConstraint2.destroy();
        cmp.pointerConstraint3.destroy();
    },

    goNorth: function(cmp, evt, helper) {
    	cmp.southConstraint.disable();
        cmp.eastConstraint.disable();
        cmp.westConstraint.disable();
    	cmp.northConstraint.enable();
    	helper.lib.panelPositioning.reposition();
    },

    goSouth: function(cmp, evt, helper) {
    	cmp.northConstraint.disable();
        cmp.eastConstraint.disable();
        cmp.westConstraint.disable();
    	cmp.southConstraint.enable();

    	helper.lib.panelPositioning.reposition();
    },

    goEast: function(cmp, evt, helper) {
        cmp.northConstraint.disable();
        cmp.southConstraint.disable();
        cmp.westConstraint.disable();
        cmp.eastConstraint.enable();
        helper.lib.panelPositioning.reposition();
        
    },

    goWest: function(cmp, evt, helper) {
    	cmp.northConstraint.disable();
        cmp.southConstraint.disable();
        cmp.eastConstraint.disable();
        cmp.westConstraint.enable();
        helper.lib.panelPositioning.reposition();
    },

    toggleBox: function(cmp, evt, helper) {
    	var toggle = cmp.find('stayinwindow');
    	if(toggle.get('v.value')) {
    		cmp.bbConstraint.enable();
    	} else {
    		cmp.bbConstraint.disable();
    	}
    	helper.lib.panelPositioning.reposition();
    },

    mousedownHandler: function(cmp, evt, helper) {

    	var lib = helper.lib.panelPositioning;
    
    	var el = cmp.find('draggable').getElement();
    	var panel = cmp.find('panel').getElement();
        var pointer = cmp.find('pointer').getElement();
		var bb = cmp.find('bb').getElement();    	

    	if(!cmp.northConstraint) {
    		cmp.northConstraint = lib.createRelationship({
				element:panel,
				target:el,
				align:'center bottom',
				targetAlign: 'center top',
				weight: 'medium',
				enable: true,
				pad: 15
			});


			

			cmp.southConstraint = lib.createRelationship({
				element:panel,
				target:el,
				align:'center top',
				targetAlign: 'center bottom',
				weight: 'medium',
				enable: false,
				pad: 15
			});

            cmp.eastConstraint = lib.createRelationship({
                element:panel,
                target:el,
                align:'left center',
                targetAlign:'right center',
                weight: 'medium',
                enable: false,
                pad: 15
            });

            cmp.westConstraint = lib.createRelationship({
                element:panel,
                target:el,
                align:'right center',
                targetAlign:'left center',
                weight: 'medium',
                enable: false,
                pad: 15
            });




            cmp.bbConstraint = lib.createRelationship({
                element:panel,
                target:bb,
                type: 'bounding box',
                weight: 'medium',
                enable: true,
                pad: 15,
                boxDirections: {
                	left: true,
                	right: true,
                	top: true,
                	bottom: true
                }
            });


			cmp.pointerConstraint = lib.createRelationship({
				element:pointer,
				target:el,
				align: 'center bottom',
				targetAlign: 'center top',
				pad: 2

			});


            cmp.pointerConstraint2 = lib.createRelationship({
				element:pointer,
				target:panel,
				pad: 10,
				type:'bounding box'

			});

			cmp.pointerConstraint3 = lib.createRelationship({
				element:pointer,
				target:panel,
				type:'below',
				pad: -10
			});

    	}

    	panel.style.visibility = 'visible';

    	function handleUp() {
    		document.removeEventListener('mouseup', handleUp);
    		document.removeEventListener('mousemove', handleMove)
    	}

    	function handleMove(e) {
    		el.style.top = e.pageY + 'px';
    		el.style.left = e.pageX + 'px';
    		lib.reposition();
    	}

    	document.addEventListener('mouseup', handleUp);
    	document.addEventListener('mousemove', handleMove);
    }
})