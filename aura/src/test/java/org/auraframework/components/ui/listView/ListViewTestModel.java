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
package org.auraframework.components.ui.listView;

import java.util.*;

import org.auraframework.system.Annotations.*;

@Model
public class ListViewTestModel {

    @AuraEnabled
    public List<Object> getEmptyList(){
        return new ArrayList<Object>();
    }

    @AuraEnabled
    public List<Map<String, String>> getGeneratedListData(){
        return ListViewTestData.GENERATED_LIST_DATA;
    }

    @AuraEnabled
    public List<Map<String, String>> getSpecifiedListData(){
        return ListViewTestData.SPECIFIED_LIST_DATA;
    }

    @AuraEnabled
    public List<Map<String, String>> getNestedColumnsListData(){
        return ListViewTestData.NESTED_COLUMNS_LIST_DATA;
    }

    @AuraEnabled
    public List<Map<String, String>> getNestedColumnsFieldsMapsFromNonLeafNodeColumnsListData(){
        return ListViewTestData.NESTED_COLUMNS_BAD_LIST_DATA;
    }

}

