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
        browsers: ["ANDROID_PHONE", "ANDROID_TABLET", "IPHONE", "IPAD"],
        test: [function(cmp) {
            var self = this;

            //get the titleHeadingLevel
            var datepicker_v_titleHeadingLevel = self.getDatepickerAttribute(cmp, 'v.titleHeadingLevel');
            var datepicker_calTitle_v_tag = self.getDatepickerAttribute(cmp, 'v.tag', 'calTitle').toUpperCase();
            var datepicker_calTitle_TagName = self.getDatepickerCalTitleTagName();

            //set for view purposes
            self.setDatepickerTitleAttributes(
                cmp,
                datepicker_calTitle_TagName,
                datepicker_v_titleHeadingLevel,
                datepicker_calTitle_v_tag
            );

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

            //assertion of the title heading attributes
            $A.test.assertUndefined(
                datepicker_v_titleHeadingLevel,
                'datepicker_v_titleHeadingLevel  should be undefined by default'
            );
        }]
    },


    /**
     * test which makes sure that in SFX, we can set a custom cal title
     * tag level
     */
    testSFXAccessibiltyCustomHeaderTag: {
        attributes : {"renderItem" : "testSFXAccessibiltyCustomHeaderTag"},
        browsers: ["ANDROID_PHONE", "ANDROID_TABLET", "IPHONE", "IPAD"],
        test: [function(cmp) {
            var self = this;

            var dpCmp = cmp.find('standAloneDatepicker');
            var calTitleCmp = dpCmp.find('calTitle');

            var datepicker_calTitle_TagName = self.getTagName(calTitleCmp.getElement());
            cmp.set('v.activeElm_tagName', datepicker_calTitle_TagName)




            // var dpCmp = self.getDatepickerCmp(cmp);

            //set custom title headering
            // self.setDatepickerAttribute(cmp, 'v.titleHeadingLevel', 'h3')
            // dpCmp.getDef().getHelper().setTitleTag(dpCmp);


            // //initial attribute assertion
            // var datepicker_v_titleHeadingLevel = self.getDatepickerAttribute(cmp, 'v.titleHeadingLevel');
            // var datepicker_calTitle_v_tag = self.getDatepickerAttribute(cmp, 'v.tag', 'calTitle').toUpperCase();
            

            // //set for view purposes
            // self.setDatepickerTitleAttributes(
            //     cmp,
            //     datepicker_calTitle_TagName,
            //     datepicker_v_titleHeadingLevel,
            //     datepicker_calTitle_v_tag
            // );

            // $A.test.assertEquals(
            //     'H3',
            //     datepicker_calTitle_v_tag,
            //     'datepicker_calTitle_v_tag should be "H3"'
            // );

            // //assertion of the title heading attributes
            // $A.test.assertEquals(
            //     'H3',
            //     datepicker_v_titleHeadingLevel.toUpperCase(),
            //     'datepicker_v_titleHeadingLevel should be "H3"'
            // );
            
            // TODO: fix the re-rendered block
            // //rerender
            // $A.rerender(cmp);

            // //set tag
            // $A.test.addWaitForWithFailureMessage(
            //     'H3',
            //     function(){//testFunction
            //         return self.getDatepickerCalTitleTagName();
            //     },
            //     'Custom tag should be re-rendered as H3',
            //     function(){//callback
            //         //get the titleHeadingLevel
            //         var datepicker_calTitle_TagName = self.getDatepickerCalTitleTagName();

            //         //set for view purposes
            //         self.setDatepickerTitleAttributes(
            //             cmp,
            //             datepicker_calTitle_TagName,
            //             self.getDatepickerAttribute(cmp, 'v.titleHeadingLevel'),
            //             self.getDatepickerAttribute(cmp, 'v.tag', 'calTitle').toUpperCase()
            //         );

            //         $A.test.assertEquals(
            //             'H3',
            //             datepicker_calTitle_TagName,
            //             'calTitle tag name should be an "H3"'
            //         )
            //     }
            // );
        }]
    },

    //test the default value of setFocus in datepicker
    testSetFocusOnDatepickerGridDefaultVal: {
        attributes : {"renderItem" : "testSetFocusOnDatepickerGridDefaultVal"},
        test: [function(cmp) {
            var self = this;
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
        }]
    },

    //test how datepicker behaves when setFocus=true
    testSetFocusOnDatepickerGridTrue: {
        attributes : {"renderItem" : "testDatepickerSetFocus"},
        test: [function(cmp) {
            var self = this;

            //set date value
            self.setDateValue(
                cmp,
                2015,//year
                7,//month
                1//day
            );


            //set setFocus=true
            self.setDatepickerAttribute(cmp, 'v.setFocus', true);
        }, function(cmp){
            var self = this;

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
        }, function(cmp){
            //assert focus state (expected null)
            var self = this;

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
        }]
    },

    //test how datepicker behaves when setFocus=false
    testSetFocusOnDatepickerGridFalse: {
        attributes : {"renderItem" : "testDatepickerSetFocus"},
        test: [function(cmp) {
            var self = this;

            //set date value
            self.setDateValue(
                cmp,
                2015,//year
                7,//month
                1//day
            );

            //set setFocus=false
            self.setDatepickerAttribute(cmp, 'v.setFocus', false);
        }, function(cmp){
            var self = this;

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
        }, function(cmp){
            //assert focus state (expected null)
            var self = this;

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
        }]
    },


    //test to see if we have only one input when the useSingleInputFlagSet=true
    //this only applies on desktop
    testWithSingleInput: {
        attributes : {"renderItem" : "testWithSingleInput"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            $A.test.assertEquals(
                1,
                $A.test.select('input').length,
                'There should be only one input'
            );
        }]
    },


    //test to see if we have 2 inputs when the useSingleInputFlagSet=false
    //this only applies on desktop
    testWithCompoundInput: {
        attributes : {"renderItem" : "testWithCompoundInput"},
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
        test: [function(cmp) {
            $A.test.assertEquals(
                2,
                $A.test.select('input').length,
                'There should be 2 inputs'
            );
        }]
    },
    

    //test disabled flag and see if the input date is read only.
    testDisabledInputDate:{
        attributes : {"renderItem" : "testDisabledInputDate"},
        test: [function(cmp) {
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
        }]
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
    getDatePickerCalTitleElm: function(){
        return $A.test.select(this.SELECTOR.datePickerCalTitle)[0];
    },
    getDatepickerCalTitleTagName: function(){
        return this.getTagName(
            this.getDatePickerCalTitleElm()
        );
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
    setDatepickerTitleAttributes: function(cmp, newTitleTagName, newTitleHeadingLevel, newdatepicker_calTitle_v_tag){
        this.setDebugCmpAttribute(
            cmp,
            'v.dp_v_titleHeadingLevel',
            newTitleHeadingLevel || '"undefined"'
        )

        this.setDebugCmpAttribute(
            cmp,
            'v.datepicker_calTitle_v_tag',
            newdatepicker_calTitle_v_tag || '"undefined"'
        )

        this.setDebugCmpAttribute(
            cmp,
            'v.dp_CalTitle_TagName',
            newTitleTagName
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
    }
})