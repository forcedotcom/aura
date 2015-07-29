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

function (constraint, elementProxyFactory) {
    'use strict';
    var w = window;

    var Constraint = constraint.Constraint;

    var bakeOff = elementProxyFactory.bakeOff;

    var repositionScheduled = false;

    var eventsBound = false;
    var constraints = [];

    var timeoutHandler = null;

    var directionMap = {
        vert: {
            top: 'top',
            center: 'middle',
            bottom: 'bottom'
        },

        horiz: {
            left: 'left',
            right: 'right',
            center: 'center'
        }
    };

    function isDomNode(obj) {
        return obj.nodeType && (obj.nodeType === 1 || obj.nodeType === 11);
    }



    function reposition(callback) {

        var toSplice = [];
        timeoutHandler = false;
        // this semaphore is to make sure
        // if reposition is called twice within one frame
        // we only run this once
        if(!repositionScheduled) {
            window.requestAnimationFrame(function() {
                repositionScheduled = false;

                // this must be executed in order or constraints
                // will behave oddly
                for (var i = 0; i < constraints.length; i++) {
                     if(!constraints[i].destroyed) {
                        constraints[i].updateValues();
                        constraints[i].reposition();
                    } else {
                        // clean up unused constraints
                        toSplice.push(i);
                    }
                }

                while(toSplice.length > 0) {
                    constraints.splice(toSplice.pop(), 1);
                }

                elementProxyFactory.bakeOff();
                
                if(callback) {
                    callback();
                }
            });
            repositionScheduled = true;
        }
            
    }

    // throttled to once every 10ms
    // this is a fairly arbitrary number
    // that should still support 30fps updates
    // on most machines
    function handleRepositionEvents(e) {
        if(!timeoutHandler) {
            timeoutHandler = setTimeout(reposition, 10);
        }
        
    }

    function bindEvents() {
        w.addEventListener('resize', handleRepositionEvents);
        w.addEventListener('scroll', handleRepositionEvents);
        eventsBound = true;
    }

    function detachEvents() {
        w.removeEventListener('resize', handleRepositionEvents);
        w.removeEventListener('scroll', handleRepositionEvents);
        eventsBound = false;
    }



    return {


        /**
         * Create a positioning relationship
         * @param  {Object} config
         * @property {HTMLElement} config.element The element being positioned
         * @property {HTMLElement} config.target The target element
         * @property {Sring} config.type The type of constraint, options: 
         *                               default: position the element based on align and target align properties
         *                               bounding box: position the elment inside the target
         * @property {Number} config.pad A number (in pixels) to pad the constraint. (default is 0)
         * @property {Boolean} config.enable If enable is false the constraint will have no effect. (default is true)
         * @property {String} config.align How to align the element being positioned. This can have one or two words the first specifies
         *                          the vertical alignment, the second the horizontal alignments.
         *                          acceptable values: right, left, center
         * @property {String} config.targetAlign where on the target to align to.
         * 
         * @return {Object} constraintHandle
         * @property {Function} constraintHandle.disable Disable the constraint
         * @property {Function} constraintHandle.enable Enable the constraint
         * @property {Function} constraintHandle.destroy Destroy the constraint, cleaning up 
         *                                               element references. 
         */
    	createRelationship: function(config) {

            if(!eventsBound) {
                bindEvents();
            }

            var el = config.element;
    		var targ = config.target;
            var constraintList = [];
            $A.assert(config.element && isDomNode(config.element), 'Element is undefined or missing');
            $A.assert(config.target && (config.target === window || isDomNode(config.target)), 'Target is undefined or missing');
            
            config.element = elementProxyFactory.getElement(config.element);
            config.target = elementProxyFactory.getElement(config.target);
            
            if(config.type !== 'bounding box' && config.type !== 'below'  && config.type !== 'inverse bounding box') {
                var constraintDirections = config.align.split(/\s/);
                constraintList.push(new Constraint(directionMap.horiz[constraintDirections[0]], config));
                constraintList.push(new Constraint(directionMap.vert[constraintDirections[1]], config));
            } else {
                constraintList.push(new Constraint(config.type, config));
            }
           
            


            constraints = constraints.concat(constraintList);
            
            
    		return (function() {


                return {

                    disable: function() {
                        
                        constraintList.forEach(function(constraint) {
                            constraint.detach();
                        });
                    },

                    enable: function() {
                        constraintList.forEach(function(constraint) {
                            constraint.attach();
                        });
                    },

                    destroy: function() {
                        while(constraintList.length > 0) {
                            constraintList.pop().destroy();
                        }
                    }
                };

            })();

    	},

    	reposition: reposition
    };
    
}