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

package org.auraframework.test.page;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.test.util.AuraUITestingUtil;
import org.auraframework.test.util.AuraUITestingUtil.StressAction;

public class AuraPageObjectHandler implements InvocationHandler {
	
	private SampleAuraPageObject sampleAuraPageObject;
	private Map<String, StressAction> methodNameToStressActionMap = new HashMap<>();
	
	public AuraPageObjectHandler(SampleAuraPageObject sampleAuraPageObject) {
		this.sampleAuraPageObject = sampleAuraPageObject;
	}
	
	public AuraPageObjectHandler(SampleAuraPageObject sampleAuraPageObject, Map<String, StressAction> methodNameToStressActionMap) {
		this.sampleAuraPageObject = sampleAuraPageObject;
		this.methodNameToStressActionMap = methodNameToStressActionMap;
	}
	
	public void addStressAction(String methodName, StressAction stressAction) {
		methodNameToStressActionMap.put(methodName, stressAction);
	}

	@Override
	public Object invoke(Object proxy, Method method, Object[] args)
		throws Throwable {
		String methodName = method.getName();
		StressAction stressAction = methodNameToStressActionMap.get(methodName);
		if(stressAction != null) {
			//let's do something before calling real method
        	AuraUITestingUtil auraUITestingUtil = sampleAuraPageObject.pageObjectTestCase.getAuraUITestingUtil();
        	auraUITestingUtil.performStressActionsDuringTransit(stressAction);
        	
		} 
		//then do the actual method
		return method.invoke(sampleAuraPageObject, args);
	}
	
	public static AuraPageObjectInterface getAuraPageObjectInterface(SampleAuraPageObject sampleAuraPageObject, Map<String, StressAction> methodNameToStressActionMap) {
		AuraPageObjectHandler auraPageObjectHandler = new AuraPageObjectHandler(sampleAuraPageObject, methodNameToStressActionMap);
    	AuraPageObjectInterface apoi = (AuraPageObjectInterface) Proxy.newProxyInstance(AuraPageObjectInterface.class.getClassLoader(),
    			new Class<?>[] {AuraPageObjectInterface.class},
    			auraPageObjectHandler
    	);
    	return apoi;
	}

}
