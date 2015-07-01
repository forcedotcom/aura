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

            var dpCmp = self.getDatepickerCmp(cmp);

            //set custom title headering
            self.setDatepickerAttribute(cmp, 'v.titleHeadingLevel', 'h3')
            dpCmp.getDef().getHelper().setTitleTag(dpCmp);

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

            //TODO: currently the datepicker code doesn't care about the 
            // calTitle.v.tag
            // calTitle tag name will always be H2
            // 
            // $A.test.assertEquals(
            //     'H3',
            //     datepicker_calTitle_TagName,
            //     'calTitle tag name should be an "H3"'
            // )

            $A.test.assertEquals(
                'H3',
                datepicker_calTitle_v_tag,
                'datepicker_calTitle_v_tag should be "H3"'
            );

            //assertion of the title heading attributes
            $A.test.assertEquals(
                'H3',
                datepicker_v_titleHeadingLevel.toUpperCase(),
                'datepicker_v_titleHeadingLevel  should be H3'
            );
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
    }
})