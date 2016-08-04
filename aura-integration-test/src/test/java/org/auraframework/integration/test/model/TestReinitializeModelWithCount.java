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
package org.auraframework.integration.test.model;

import com.google.common.collect.Maps;

import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.components.test.java.model.TestReinitializeModel;
import org.auraframework.ds.servicecomponent.ModelInstance;
import org.auraframework.service.ContextService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.ArrayList;
import java.util.Map;

@ServiceComponentModelInstance
public class TestReinitializeModelWithCount extends TestReinitializeModel implements ModelInstance {
    
    private static Map<TestContext, Integer> counters = Maps.newHashMap();

    public TestReinitializeModelWithCount(ContextService contextService, TestContextAdapter testContextAdapter) throws QuickFixException {
        super(contextService);
        //increase the corresponding counter by 1 if it exist, if not, create it
        TestContext testContext = testContextAdapter.getTestContext();
        Integer c = counters.get(testContext);
        if(c!=null && c>=0) {
            c = c+1;
            counters.put(testContext, c);
        } else {
            counters.put(testContext, 0);
        }
    }

    public static int getCount(TestContext testContext) {
        Integer c = counters.get(testContext);
        if(c!=null && c>=0) {
            return c;
        } else {
            return -1;
        }
    }

    public static void clearCount(TestContext testContext) {
        counters.put(testContext, 0);
    }
    
    
    @Override
    @AuraEnabled
    public String getValue() {
        return super.getValue();
    }
    
    @Override
    @AuraEnabled
    public String getValueParent() {
        return super.getValueParent();
    }
    
    @Override
    @AuraEnabled
    public ArrayList<String> getItemList() {
        return super.getItemList();
    }
    
}
