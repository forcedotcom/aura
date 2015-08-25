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
import java.util.ArrayList;

import org.auraframework.test.util.AuraUITestingUtil;
import org.auraframework.test.util.AuraUITestingUtil.ActionDuringTransit;
import org.auraframework.test.util.AuraUITestingUtil.ActionTiming;
import org.auraframework.test.util.AuraUITestingUtil.StressAction;

public class AuraPageObjectHandler implements InvocationHandler {
	
	private SampleAuraPageObject sampleAuraPageObject;
	private StressAction stressAction;
	
	public void setStressAction(StressAction stressAction) {
		this.stressAction = stressAction;
	}

	public AuraPageObjectHandler(SampleAuraPageObject sampleAuraPageObject, StressAction stressAction) {
		this.sampleAuraPageObject = sampleAuraPageObject;
		this.stressAction = stressAction;
	}

	@Override
	public Object invoke(Object proxy, Method method, Object[] args)
		throws Throwable {
		switch (method.getName()) {
        case "clickOnButton":
        	//let's do something before click
        	AuraUITestingUtil auraUITestingUtil = sampleAuraPageObject.pageObjectTestCase.getAuraUITestingUtil();
        	auraUITestingUtil.performStressActionsDuringTransit(this.stressAction);
        	//then do the actual click
        	return method.invoke(sampleAuraPageObject, args);
		default:
        	return method.invoke(sampleAuraPageObject, args);
        }
	}
	
	public static AuraPageObjectInterface getAuraPageObjectInterface(SampleAuraPageObject sampleAuraPageObject, StressAction stressAction) {
		AuraPageObjectHandler auraPageObjectHandler = new AuraPageObjectHandler(sampleAuraPageObject, stressAction);
    	AuraPageObjectInterface apoi = (AuraPageObjectInterface) Proxy.newProxyInstance(AuraPageObjectInterface.class.getClassLoader(),
    			new Class<?>[] {AuraPageObjectInterface.class},
    			auraPageObjectHandler
    	);
    	return apoi;
	}
	
}
