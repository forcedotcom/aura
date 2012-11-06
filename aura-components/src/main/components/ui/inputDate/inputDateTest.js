/*
 * Copyright (C) 2012 salesforce.com, inc.
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
       /* uncomment after
       *   W-1244949: server-side localized input values
       * testSetDate: {
       *         attributes : {value : "2001-1-2" },
       *         test : function(component) {
       *                 $A.test.assertEquals("2001-01-02",  component.get("v.value"), "The value is incorrect.")
       *         }
       * },
       */

       /* uncomment after
       *   W-1244949: server-side localized input values
       * testSetMin: {
       *        attributes : {min : "2001-1-2" },
       *        test : function(component) {
       *                $A.test.assertEquals("2001-01-02",  component.get("v.min"), "Min is incorrect.");
       *        }
       *},
       */


       /* uncomment after
       *   W-1244949: server-side localized input values
       * testSetMax: {
       *        attributes : {max : "2001-1-2" },
       *        test : function(component) {
       *                $A.test.assertEquals("2001-01-02",  component.get("v.max"), "Max is incorrect.");
       *        }
       *},
       */

       testSetStep: {
               attributes : {step : 2 },
               test : function(component) {
                       $A.test.assertEquals(2,  component.get("v.step"), "Step is incorrect.");
               }
       },

       testSetFormat: {
               attributes : {format : "mm-dd-yy" },
               test : function(component) {
                       var expected = component.getDef().getHelper().isHTML5Input("date") ? "yyyy-MM-dd" : "mm-dd-yy"
                       $A.test.assertEquals(expected,  component.get("v.format"), "Format is incorrect.");
               }
       },

       /* uncomment after
       *   W-1244949: server-side localized input values
       * testUpdateDate: {
       *        attributes : {value : "1899-12-01"},
       *        test: function(component){
       *     var input = component.getElement();
       *     $A.test.click(input);
       *     $A.test.type(input, "[backspace][backspace][backspace][backspace][backspace][backspace][backspace][
       *     $A.test.type(input, "2011-09-10");
       *     $A.test.click(input.parentNode);
       *     $A.test.addWaitFor(function(){return input.value == "2011-09-10"});
       * }
       *},
       */


       /* uncomment after
       *   W-1244949: server-side localized input values
       * testUpdateDateInDifferentFormat: {
       *        attributes : {format : "dd-yyyy-MM"},
       *        test: function(component){
       *     var input = component.getElement();
       *     $A.test.click(input);
       *     $A.test.type(input, "01-30-1999");
       *     $A.test.click(input.parentNode);
       *     $A.test.addWaitFor(function(){return input.value == "30-1999-01"});
       * }
       *},
       */


       /* uncomment after
       *   W-1244949: server-side localized input values
       * testUpdateDateWithoutLeadingZeros: {
       *        test: function(component){
       *     var input = component.getElement();
       *     $A.test.click(input);
       *     $A.test.type(input, "2-1-1999");
       *     $A.test.click(input.parentNode);
       *     $A.test.addWaitFor(function(){return input.value == "1999-02-01"});
       * }
       *},
       */

       testDateDisabled: {
               attributes : {disabled : true},
               test: function(component){
               $A.test.assertEquals(true,  component.get("v.disabled"), "Disabled value is incorrect.");
               }
       }
})
