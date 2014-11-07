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
    handleInputChangeAutoComplete: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoComplete");
    },
    
    handleKeyDown: function(cmp, event, helper) {
    	cmp.find("outputLabel").set("v.value", "KeyDown Event Fired");
    },
    
    handleInputChangeNoData: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoCompleteNoData");
    },
    
    handleInputChangeLargeList: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoCompleteLargeList");
    },
    
    handleInputChangeCustomTemplate: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoCompleteCustomTemplate");
    },
    
    handleInputChangeCustomOption: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoCompleteCustomOption");
    },
    
    handleInputChangeEmptyListContent: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoCompleteEmptyListContent");
    },
    
    handleInputChangeMatchFunc: function(cmp, event, helper) {
        helper.handleInputChange(cmp, event, "autoCompleteMatchFunc");
    },
    
    handleSelectOptionAutoComplete: function(cmp, event, helper) {
    	helper.handleSelectOption(cmp, event, "autoComplete");
    },
    
    handleSelectOptionNoData: function(cmp, event, helper) {
    	helper.handleSelectOption(cmp, event, "autoCompleteNoData");
    },
    
    handleSelectOptionLargeList: function(cmp, event, helper) {
    	helper.handleSelectOption(cmp, event, "autoCompleteLargeList");
    },
    
    handleSelectOptionCustomTemplate: function(cmp, event, helper) {
    	helper.handleSelectOption(cmp, event, "autoCompleteCustomTemplate");
    },
    
    handleSelectOptionCustomOption: function(cmp, event, helper) {
    	helper.handleSelectOption(cmp, event, "autoCompleteCustomOption");
    },
    
    handleSelectOptionEmptyListContent: function(cmp, event, helper) {
        helper.handleSelectOption(cmp, event, "autoCompleteEmptyListContent");
    },

    handleSelectOptionMatchFunc: function(cmp, event, helper) {
        helper.handleSelectOption(cmp, event, "autoCompleteMatchFunc");
    },
    
    handleInputChangeAutoCompleteMatchDone: function(cmp, event, helper) {
    	helper.handleMatchDone(cmp, event, "autoComplete");
    },
    
    handleInputChangeNoDataMatchDone: function(cmp, event, helper) {
    	helper.handleMatchDone(cmp, event, "autoCompleteNoData");
    },
    
    handleInputChangeLargeListMatchDone: function(cmp, event, helper) {
    	helper.handleMatchDone(cmp, event, "autoCompleteLargeList");
    },
    
    handleInputChangeCustomTemplateMatchDone: function(cmp, event, helper) {
    	helper.handleMatchDone(cmp, event, "autoCompleteCustomTemplate");
    },
    
    handleInputChangeCustomOptionMatchDone: function(cmp, event, helper) {
    	helper.handleMatchDone(cmp, event, "autoCompleteCustomOption");
    },
    
    handleInputChangeEmptyListContentMatchDone: function(cmp, event, helper) {
        helper.handleMatchDone(cmp, event, "autoCompleteEmptyListContent");
    },
    
    handleInputChangeMatchFuncMatchDone: function(cmp, event, helper) {
        helper.handleMatchDone(cmp, event, "autoCompleteMatchFunc");
    },
    
    handleOnBlur: function(cmp, event, helper) {
    	cmp.find("outputLabelOnFocusAndBlur").set("v.value", "Blur Event Fired!!");
    },
    
    handleOnFocus: function(cmp, event, helper) {
    	cmp.find("outputLabelOnFocusAndBlur").set("v.value", "Focus Event Fired!!");
    },
    
    matchFuncShowAll: function(cmp, event, helper) {
        var autocomplete = cmp.find("autoCompleteMatchFunc");
        var input = autocomplete.find("input");
        var list = autocomplete.find("list");
        var keyword = list.get("v.keyword");
        var items = list.get("v.items");
        for (var i = 0; i < items.length; i++) {
            items[i].keyword = keyword;
            items[i].visible = true;
        }
        list.set("v.items", items);
    }
})