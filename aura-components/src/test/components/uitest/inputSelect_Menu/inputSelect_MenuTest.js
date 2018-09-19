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
 *
 */
({
    /**
     * Verify the values of the initial state are correct for the other tests
     */
    testInitialState: {
        test: function(cmp) {
            var inputSelect = cmp.find("inputSelectMenu");
            this.verifySelectedOption(inputSelect, "Option2");
            this.verifyEventCount(cmp, "changeCounter", 0);
        }
    },

    /**
     * Verify that ui:change is fired when a new option is selected
     */
    testChangeEventFiredOnOptionChange: {
        test: [function(cmp) {
            this.inputSelect = cmp.find("inputSelectMenu");
            this.openInputSelect(this.inputSelect);
        }, function(cmp) {
            this.selectOption(this.inputSelect, "Option3");
        }, function(cmp) {
            this.verifyEventCount(cmp, "changeCounter", 1);
            this.selectOption(this.inputSelect, "Option1");
        }, function(cmp) {
            this.verifyEventCount(cmp, "changeCounter", 2);
        }]
    },

    /**
     * Verify that ui:change is not fired when the selected option is already selected
     */
    testChangeEventNotFiredWithSameOption: {
        test: [function(cmp) {
            this.inputSelect = cmp.find("inputSelectMenu");
            this.openInputSelect(this.inputSelect);
        }, function(cmp) {
            this.selectOption(this.inputSelect, "Option2");
        }, function(cmp) {
            this.verifyEventCount(cmp, "changeCounter", 0);
        }]
    },

    testPassClassNamesToOptionItems: {
        test: [function(cmp) {
            this.inputSelect = cmp.find("inputSelectMenu");
            this.openInputSelect(this.inputSelect);
        }, function(cmp) {
            var selectListElm = this.inputSelect.find("options").getElement();
            var options = selectListElm.getElementsByTagName("li");
            for (var i = 0; i < options.length; i++) {
                $A.test.assertTrue($A.util.hasClass(options[i], "option" + (i + 1) + "-class"));
            }
        }]
    },

    /****************************************************************
     * Helper Functions
     ****************************************************************/
    openInputSelect: function(inputSelect) {
        var triggerLinkElm = this.getTriggerLinkElm(inputSelect);
        $A.test.clickOrTouch(triggerLinkElm);
        this.waitForSelectList(inputSelect, true);
    },

    selectOption: function(inputSelect, optionText) {
        var options = this.getAnchors(inputSelect.find("options"));
        for (var i = 0; i < options.length; i++) {
            if (options[i].title === optionText) {
                $A.test.clickOrTouch(options[i]);
                break;
            }
        }
        // wait for selectList to disappear and verify the correct
        // option is selected
        var self = this;
        this.waitForSelectList(inputSelect, false, function() {
            self.verifySelectedOption(inputSelect, optionText);
        });
    },

    verifySelectedOption: function(inputSelect, optionText) {
        var triggerLinkElm = this.getTriggerLinkElm(inputSelect);
        $A.test.assertEquals(optionText, $A.test.getText(triggerLinkElm),
                "Selected option is not correct!");
    },

    verifyEventCount: function(cmp, counterId, count) {
        var expectedCount = count.toString();
        var actualCount = $A.test.getText(cmp.find(counterId).getElement());
        $A.test.assertEquals(expectedCount, actualCount,
                "Expected " + counterId + " to be " + expectedCount + ", but it's " + actualCount);
    },

    waitForSelectList: function(inputSelect, isOpen, cb) {
        var selectListElm = inputSelect.find("options").getElement();
        $A.test.addWaitForWithFailureMessage(isOpen, function() {
            return $A.util.hasClass(selectListElm, "visible");
        }, "Expect inputSelect to be " + (isOpen ? "open" : "closed"), cb);
    },

    getTriggerLinkElm: function(inputSelect) {
        return this.getAnchors(inputSelect.find("selectTrigger"))[0];
    },

    getAnchors: function(cmp) {
        return cmp.getElement().getElementsByTagName("a");
    }
})
