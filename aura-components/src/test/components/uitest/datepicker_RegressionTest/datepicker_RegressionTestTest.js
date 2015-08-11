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
	owner:"sle",

    SELECTOR: {
        datePickerManager: 'datepickerManager',
        datePicker: 'datePicker',
        datePickerCalTitle: '.monthYear'
    },

    /**
     * test which makes sure that in SFX, the default tag name is H2
     */
	testSFXAccessibiltyHeaderTagDefValue: {
		attributes : {"renderItem" : "testSFXAccessibiltyHeaderTagDefValue"},
        test: [function(cmp) {
            var self = this;
            var dpCmp = cmp.find('standAloneDatepicker');
            var calTitleCmp = dpCmp.find('calTitle');


            // //get the titleHeadingLevel
            var datepicker_calTitle_v_tag = calTitleCmp.get('v.tag').toUpperCase();
            var datepicker_calTitle_TagName = self.getTagName(calTitleCmp.getElement());

            //assertion of title tag name
            $A.test.assertEquals(
                'H2',
                datepicker_calTitle_TagName,
                'calTitle tag name should be an "H2"'
            )

            $A.test.assertEquals(
                'H2',
                datepicker_calTitle_v_tag,
                'datepicker_calTitle_v_tag should be H2'
            );
        }]
    },


    /**
     * test which makes sure that in SFX, we can set a custom cal title
     * tag level
     */
    testSFXAccessibiltyCustomHeaderTag: {
        attributes : {"renderItem" : "testSFXAccessibiltyCustomHeaderTag"},
        test: [function(cmp) {
            var self = this;
            var dpCmp = cmp.find('standAloneDatepicker');
            var calTitleCmp = dpCmp.find('calTitle');


            // //get the titleHeadingLevel
            var datepicker_calTitle_v_tag = calTitleCmp.get('v.tag').toUpperCase();
            var datepicker_calTitle_TagName = self.getTagName(calTitleCmp.getElement());

            //assertion of title tag name
            $A.test.assertEquals(
                'H3',
                datepicker_calTitle_TagName,
                'calTitle tag name should be an "H3"'
            )

            $A.test.assertEquals(
                'H3',
                datepicker_calTitle_v_tag,
                'datepicker_calTitle_v_tag should be H3'
            );
        }]
    },

    //test the default value of setFocus in datepicker
    testSetFocusOnDatepickerGridDefaultVal: {
        attributes : {"renderItem" : "testSetFocusOnDatepickerGridDefaultVal"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;
            if(self.isViewDesktop()){
                var setFocusBool = $A.util.getBooleanValue(
                    self.getDatepickerAttribute(cmp, 'v.setFocus')
                );

                var setFocusBool_dpGrid = $A.util.getBooleanValue(
                    self.getDatepickerGridCmp(cmp).get('v._setFocus')
                );

                //set this for view in the ui
                self.setDebugCmpAttribute(cmp, 'v.dp_v_setFocus', setFocusBool);
                self.setDebugCmpAttribute(cmp, 'v.dpGrid_v_setFocus', setFocusBool_dpGrid);

                //assertion 
                $A.test.assertTrue(
                    setFocusBool,
                    'datePicker.setFocus should be true'
                )

                $A.test.assertTrue(
                    setFocusBool_dpGrid,
                    'datePickergrid._setFocus should be true'
                )
            }
        }]
    },

    //test how datepicker behaves when setFocus=true
    testSetFocusOnDatepickerGridTrue: {
        attributes : {"renderItem" : "testDatepickerSetFocus"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;
            if(self.isViewDesktop()){
                //set date value
                self.setDateValue(
                    cmp,
                    2015,//year
                    7,//month
                    1//day
                );


                //set setFocus=true
                self.setDatepickerAttribute(cmp, 'v.setFocus', true);
            }
        }, function(cmp){
            var self = this;
            if(self.isViewDesktop()){
                //get value and assertion
                //get values
                var setFocusBool = $A.util.getBooleanValue(
                    self.getDatepickerAttribute(cmp, 'v.setFocus')
                );

                //set this for view in the ui
                self.setDebugCmpAttribute(cmp, 'v.dp_v_setFocus', setFocusBool);

                //assertion 
                $A.test.assertTrue(
                    setFocusBool,
                    'dp_v_setFocus should be true'
                )
            }
        }, function(cmp){
            //assert focus state (expected null)
            var self = this;
            if(self.isViewDesktop()){
                //show datepicker
                self.showDatepicker();

                //wait for datepicker to pop
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){// testFunction
                        return $A.test.select('.visible.uiDatePicker').length;
                    },
                    'datepicker grid is not shown',
                    function(){// callback
                        //attribute showing active element class list
                        var activeElm = $A.test.getActiveElement();
                        var tagName = self.getTagName(activeElm);

                        cmp.set('v.activeElm_classList', $A.util.getElementAttributeValue(activeElm, 'class'));
                        cmp.set('v.activeElm_tagName', tagName);

                        //assert focus state
                        $A.test.assertTrue(
                            $A.util.hasClass(activeElm, 'uiDayInMonthCell'),
                            'with SetFocus=true, focused elm should have a class named "uiDayInMonthCell"'
                        );

                        $A.test.assertEquals(
                            'A',
                            tagName,
                            'with SetFocus=true, focused elm should be an "A" tag'
                        );
                    }
                );
            }
        }]
    },

    //test how datepicker behaves when setFocus=false
    testSetFocusOnDatepickerGridFalse: {
        attributes : {"renderItem" : "testDatepickerSetFocus"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;
            if(self.isViewDesktop()){
                //set date value
                self.setDateValue(
                    cmp,
                    2015,//year
                    7,//month
                    1//day
                );

                //set setFocus=false
                self.setDatepickerAttribute(cmp, 'v.setFocus', false);
            }
        }, function(cmp){
            var self = this;
            if(self.isViewDesktop()){
                //get value and assertion
                //get values
                var setFocusBool = $A.util.getBooleanValue(
                    self.getDatepickerAttribute(cmp, 'v.setFocus')
                );

                //set this for view in the ui
                self.setDebugCmpAttribute(cmp, 'v.dp_v_setFocus', setFocusBool);

                //show datepicker
                self.showDatepicker();

                //assertion 
                $A.test.assertFalse(
                    setFocusBool,
                    'dp_v_setFocus should be false'
                )
            }
        }, function(cmp){
            //assert focus state (expected null)
            var self = this;
            if(self.isViewDesktop()){
                //show datepicker
                self.showDatepicker();

                //wait for datepicker to pop
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){// testFunction
                        return $A.test.select('.visible.uiDatePicker').length;
                    },
                    'datepicker grid is not shown',
                    function(){// callback
                        //attribute showing active element class list
                        var activeElm = $A.test.getActiveElement();
                        var tagName = self.getTagName(activeElm);

                        cmp.set('v.activeElm_classList', $A.util.getElementAttributeValue(activeElm, 'class'));
                        cmp.set('v.activeElm_tagName', tagName);

                        //assert focus state
                        $A.test.assertFalse(
                            $A.util.hasClass(activeElm, 'uiDayInMonthCell'),
                            'with SetFocus=true, focused elm should NOT have a class named "uiDayInMonthCell"'
                        );

                        $A.test.assertEquals(
                            'BODY',
                            tagName,
                            'with SetFocus=true, focused elm should be an "BODY" tag'
                        );
                    }
                );
            }
        }]
    },


    //test to see if we have useSingleInputFlagSet=true or false
    testUseSingleInputFlag: {
        attributes : {"renderItem" : "testSingleInputFlag"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;

            if(self.isViewDesktop()){
                $A.test.assertEquals(
                    1,
                    $A.test.select('#singleInputField input').length,
                    'There should be only one input (#singleInputField input)'
                );



                $A.test.assertEquals(
                    2,
                    $A.test.select('#compoundInputField input').length,
                    'There should be 2 inputs (#compoundInputField input)'
                );
            }
        }]
    },

    //test disabled flag and see if the input date is read only.
    testDisabledInputDate:{
        attributes : {"renderItem" : "testDisabledInputDate"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;

            if(self.isViewDesktop()){
                var isDisabled = $A.test.getElementAttributeValue(
                    cmp.getElement().querySelector('input'),
                    'disabled'
                )

                //disabled attribute is present in the dom,
                //but the value is empty
                //so the safest bet here is to compare it against null
                $A.test.assertNotEquals(
                    null,
                    isDisabled,
                    'disabled should not be equals to NULL'
                )


                $A.test.assertNotEquals(
                    'false',
                    isDisabled + '',
                    'disabled should not be equals to FALSE'
                )
            }
        }]
    },


    testCloseOnClickOut:{
        attributes : {"renderItem" : "testCloseOnClickOut"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;

            if(self.isViewDesktop()){
                //assert that the datepicker is visible
                self.verifyDatepickerVisibility(
                    '.uiDatePicker',//css selector
                    true//visible
                );


                //click
                $A.test.fireDomEvent(cmp.find("btnPressMe").getElement(), 'mouseup')


                //assert that the datepicker is closed
                self.verifyDatepickerVisibility(
                    '.uiDatePicker',//css selector
                    false//visible
                );
            }
        }]
    },

    testOpenOnClickOut:{
        attributes : {"renderItem" : "testOpenOnClickOut"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            var self = this;

            if(self.isViewDesktop()){
                //assert that the datepicker is visible
                self.verifyDatepickerVisibility(
                    '.uiDatePicker',//css selector
                    true//visible
                );

                //click out
                $A.test.clickOrTouch( cmp.find("btnPressMe").getElement() );

                //assert that the datepicker is closed
                self.verifyDatepickerVisibility(
                    '.uiDatePicker',//css selector
                    true//visible
                );
            }
        }]
    },

    
    

    verifyDatepickerVisibility: function(elSelector, visible){
        var els = $A.test.select(elSelector, '.uiDatePicker');
        var el = els[0];
        var classListString = $A.test.getElementAttributeValue(el, 'class');

        if(visible === true){
            $A.test.assertTrue(
                $A.util.hasClass(el, 'visible'),
                'Datepicker should be VISIBLE : class="' + classListString + '"'// failureMessage
            )
        }
        else{
            $A.test.assertFalse(
                $A.util.hasClass(el, 'visible'),
                'Datepicker should be CLOSED : class="' + classListString + '"'// failureMessage
            )
        }
    },


    /**
     * HELPER
     */
    getDatepickerManagerCmp: function(cmp){
       return cmp.find(this.SELECTOR.datePickerManager); 
    },
    getDatepickerCmp: function(cmp){
        return this.getDatepickerManagerCmp(cmp).find(this.SELECTOR.datePicker)
    },
    getDatepickerGridCmp: function(cmp){
        return this.getDatepickerManagerCmp(cmp).find(this.SELECTOR.datePicker).find('grid');
    },
    getDatepickerAttribute: function(cmp, attrName, childId){
        var cmpDp  = this.getDatepickerCmp(cmp);
        if(childId === undefined){
            return cmpDp.get(attrName);    
        }
        else{
            return cmpDp.find(childId).get(attrName);
        }
    },
    setDatepickerAttribute: function(cmp, attrName, newAttrVal, childId){
        var cmpDp  = this.getDatepickerCmp(cmp);
        if(childId === undefined){
            cmpDp.set(attrName, newAttrVal);
        }
        else{
            cmpDp.find(childId).set(attrName, newAttrVal);
        }
    },
    getTagName: function(elm){
        return elm.tagName.toUpperCase();
    },
    setDebugCmpAttribute: function(cmp, attrName, attrVal){
        cmp.set(
            attrName,
            attrVal
        )  
    },
    showDatepicker: function(){
        // clicking on the datepicker open icon
        $A.test.clickOrTouch( $A.test.select('.datePicker-openIcon')[0]);
    },
    setDateValue: function(cmp, date, month, year){
        var self = this;
        var dpGrid = self.getDatepickerGridCmp(cmp);
        dpGrid.set("v.date", date);
        dpGrid.set("v.month", month);
        dpGrid.set("v.year", year);
    },
    /**
     * Method allowing us to extract whether or not we are looking at a mobile device. Extracted from two functions because 
     * depending on which mode we are in (Desktop or other), we either have a header with the Month Year combo or an outputText 
     * and a select value
     * 
     */ 
    isViewDesktop : function(){
        return $A.get('$Browser.formFactor').toLowerCase() === "desktop";
    },
})