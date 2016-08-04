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
package org.auraframework.components.ui;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.component.auradev.TestDataItem;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;

import java.util.ArrayList;
import java.util.List;

@ServiceComponent
public class UIScrollerDataProvider implements Controller {

    private static int PTR_COUNTER = 0;
    private static int PTL_COUNTER = 0;
    private static int INF_COUNTER = 0;
    @AuraEnabled
    public List<TestDataItem> getItemsPTR(@Key("size") int size) throws Exception {
        List<TestDataItem> l = null;
        if(size > 0){
            l = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                int id = ++PTR_COUNTER;
                l.add(new TestDataItem("After PTR, pretty row " + id + " from server", Integer.toString(id)));
            }
        }
        PTR_COUNTER = 0;
        return l;
    }

    @AuraEnabled
    public List<TestDataItem> getItemsPTL(@Key("size") int size) throws Exception {
        List<TestDataItem> l = null;
        if(size > 0){
            l = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                int id = ++PTL_COUNTER;
                l.add(new TestDataItem("After PTL, pretty row " + id + " from server", Integer.toString(id)));
            }
        }
        PTL_COUNTER = 0;
        return l;
    }

    @AuraEnabled
    public List<TestDataItem> getItemsInfinite(@Key("size") int size) throws Exception {
        List<TestDataItem> l = null;
        if(size > 0){
            l = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                int id = ++INF_COUNTER;
                l.add(new TestDataItem("After INF, pretty row " + id + " from server", Integer.toString(id)));
            }
        }
        INF_COUNTER = 0;
        return l;
    }
}