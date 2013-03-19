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
package org.auraframework.test.testsetrunner;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import junit.framework.Test;

import org.auraframework.Aura;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * This model exposes a view on the {@link TestSetRunnerState} for
 * {@link AuraEnabled} access. Because all the model state is shared, this class
 * itself does not hold any state.
 */
@Model
@ThreadSafe
public class TestSetRunnerModel {
	private String scope;
	
	public TestSetRunnerModel() throws QuickFixException {
		Object scope_param = Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes().getValue("scope");
		if(scope_param!=null) {
			scope = scope_param.toString();
		}
	}
	
    /**
     * @return a sorted list of tests by their inventory key
     */
    @AuraEnabled
    public Object getTests() {
        List<String> testNames = new LinkedList<String>();
        Map<String, Test> inventory = getTestSetRunnerState().getInventory();
        for (Test t : inventory.values()) {
            testNames.add(t.toString());
        }

        Collections.sort(testNames);
        return testNames;
    }
    
	private TestSetRunnerState getTestSetRunnerState() {
		// Use container tests only when specified, otherwise return classic inventory
		if(scope!=null&&scope.equalsIgnoreCase("hybrid_container")) {
			return TestSetRunnerState.getHybridContainerInstance();
		} else {
			return TestSetRunnerState.getInstance();
		}
		
	}

    /**
     * @return the collection of test properties in the same order as
     *         {@link #getTestsWithPropsMap()}.
     */
    @AuraEnabled
    public Collection<Map<String, Object>> getTestsWithProps() {
        return getTestsWithPropsMap().values();
    }

    /**
     * @return the test properties map.
     */
    @AuraEnabled
    public Map<String, Map<String, Object>> getTestsWithPropsMap() {
        return getTestSetRunnerState().getTestsWithPropertiesMap();
    }
}
