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
    // Event key code for Up key
    KEY_CODE_UP: 38,
    
    // Event key code for Down key
    KEY_CODE_DOWN: 40,
    
    CONTAINER_CLASS: 'virtualMenuContainer',
    
    setupMenu: function(cmp, target) {
        var menuDef = cmp.get("v.menu")[0];
        var menuCmp = $A.createComponentFromConfig(menuDef);
        
        // Find this components node before deleting
        var container = target;
        while (container && !container.classList.contains(this.CONTAINER_CLASS)) {
            container = container.parentElement;
        }

        // Delete current DOM before replacing it.
        $A.util.clearNode(container);

        // Render the component
        $A.render(menuCmp, container);
        $A.afterRender(menuCmp);

        // Trigger show
        menuCmp.get("e.popupTriggerPress").fire();
        
        // make sure the trigger element is focused
        window.requestAnimationFrame($A.getCallback(function () {
            var trigger = container.getElementsByTagName("a")[0];
            if (trigger) {
                trigger.focus();
            }
        }));
    },
    
    handleKeydown: function (cmp, event) {
        var keyCode = event.keyCode;
        if (keyCode === this.KEY_CODE_UP || keyCode === this.KEY_CODE_DOWN) {
            $A.util.squash(event, true);

            this.setupMenu(cmp, event.target);
        }
    }
})// eslint-disable-line semi