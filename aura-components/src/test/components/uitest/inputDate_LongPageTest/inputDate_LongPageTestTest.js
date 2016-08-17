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
     * Make sure page doesn't scroll to somewhere else when date picker is open
     * Bug: W-2993774
     */
    testPageScrollOnDatePickerOpen: {
        browsers: ["DESKTOP"],
        test: [function(cmp) {
            this.inputDateCmp = cmp.find("inputDate");
            this.scrollToCmp(this.inputDateCmp);
        }, function() {
            this.currentPageYOffset = this.getPageYOffset();
            this.openDatePicker(this.inputDateCmp);
        }, function() {
            $A.test.assertEquals(this.currentPageYOffset, this.getPageYOffset(),
                "Page should not scroll to somewhere else");
        }]
    },

    getPageYOffset: function() {
        return window.pageYOffset;
    },

    getElementYOffset: function(elm) {
        return elm.getBoundingClientRect().top + this.getPageYOffset();
    },

    scrollToCmp: function(cmp) {
        var scrollPos = this.getElementYOffset(cmp.getElement());
        window.scrollTo(0, scrollPos);
        $A.test.addWaitFor(scrollPos, function() {
            return this.getPageYOffset();
        }.bind(this));
    },

    openDatePicker: function(inputDateCmp) {
        var opener = inputDateCmp.find("datePickerOpener").getElement();
        var datePicker = inputDateCmp.find("datePicker").getElement();

        $A.test.clickOrTouch(opener);
        $A.test.addWaitFor(true, function() {
            return $A.util.hasClass(datePicker, "visible");
        });
    }
})//eslint-disable-line semi
