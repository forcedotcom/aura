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
     * Override ui:autoComplete.
     */
    handleEnterKeyOnInput: function(component, input) {
        if (component.get("v.allowNew")) {
            var concrete = component.getConcreteComponent();
            this.handleCreatePill(concrete, input);
        }
    },

    /**
     * Override ui:autoComplete.
     */
    handleOtherKeyAction: function(component, input, event) {
        var concrete = component.getConcreteComponent();
        var keyCode = event.getParam("keyCode");
        var domEvent = event.getParam("domEvent");
        if (keyCode === 8) { // Backspace key
            var inputText = input.get("v.value");
            if ( $A.util.isEmpty(inputText) ) {
                var onBackspacePressedWhenEmpty = concrete.getEvent("onBackspacePressedWhenEmpty");
                if (onBackspacePressedWhenEmpty) {
                    domEvent.preventDefault();
                    onBackspacePressedWhenEmpty.fire();
                }
            }
        } else if (keyCode === 188) { // Comma key
            if (!event.getParam("shiftKey")) {	//only create pills for comma and not shift+comma key
                this.handleCreatePill(concrete, input);
                domEvent.preventDefault();
            }
        } else if (keyCode === 9) { // Tab key
            this.handleCreatePill(concrete, input);
        }
    },

    handleCreatePill: function(concrete, input) {
        var value = input.get("v.value");
        if ( !$A.util.isEmpty(value) ) {
            var onItemSelected = concrete.getEvent("onItemSelected");
            var onItemSelectedPrams = {
                label: value,
                id: null
            };
            input.set("v.value", "");
            onItemSelected.setParams({ value : onItemSelectedPrams }).fire();
        }
    },

    initFetchParameters: function() {
        this._fetchParameters = {};
    },

    handleParameterChange: function(component, parameters) {
        for (var i = 0; i < parameters.length; i++) {
            this._fetchParameters[parameters[i].name] = parameters[i].value;
        }
        var fetchDataEvt = component.get("e.fetchData");
        fetchDataEvt.setParams({
            parameters: this._fetchParameters
        });
        fetchDataEvt.fire();
    },


    addParentListElementAsInput: function(component) {
        var listElement = this._getPillContainerListElement(component);
        if (listElement) {
            this.addIgnoredElement(component.getSuper(), listElement);
        }
    },

    handleListExpand: function(component, event) {
        var pillListElement = this._getPillContainerListElement(component);
        if (pillListElement) {
            var autocompleteList = component.find("list");
            if (autocompleteList) {
                autocompleteList.getElement().style.top = pillListElement.offsetHeight+"px";
            }
        }
    },

    _getPillContainerListElement: function(component) {
        var pillContainer = this._getPillContainer(component);
        if (pillContainer) {
            //add pill container list element as an input element
            var listComponent = pillContainer.find("list");
            if (listComponent) {
                return listComponent.getElement();
            }
        }
        return null;
    },

    // pillContainer should really be the child of pillContainerAutoComplete rather than this nonsense
    _getPillContainer: function(component) {
        //get parent pill container
        var element = component.getElement().parentElement;
        var htmlComponent = $A.componentService.getRenderingComponentForElement(element);
        if (!$A.util.isUndefinedOrNull(htmlComponent)) {
            var concreteComponent = htmlComponent.getComponentValueProvider().getConcreteComponent();
            if (concreteComponent.isInstanceOf("ui:pillContainer")) {
               return concreteComponent;
            }
        }
    },

    getInputElement: function(component) {
        var inputComponent = component.getSuper().find('input');
        if (inputComponent) {
            var inputHelper = inputComponent.getDef().getHelper();
            return inputHelper.getInputElement(inputComponent);
        }
        return null;
    }
})
