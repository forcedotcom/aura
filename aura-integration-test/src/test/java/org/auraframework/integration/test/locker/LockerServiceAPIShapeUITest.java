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
package org.auraframework.integration.test.locker;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.AuraUITestingUtil;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonSerializationContext;
import org.junit.Test;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;

// DCHASMAN TODO Get this running with FF, SAFARI, IE11 and IOS
@TargetBrowsers({ BrowserType.GOOGLECHROME })
public class LockerServiceAPIShapeUITest extends WebDriverTestCase {
    private static final String WORK_IN_PROGRESS = "@wip";
	private static final String SUPPORT = "support";
	private static final String PLAN = "plan";
	private static final String PROPS = "props";
	private static final String LOCKER = "locker";
	private static final String NAME = "name";
	private static final String TYPE = "type";
	private static final String PROTOS = "protos";
	private static final String SYSTEM = "system";
	private static final String STATUS = "status";
	private static final String VALUE = "value";
	private static final String FAIL = "fail";
	private static final String NOVALUE = "@novalue";
	private static final String WARN = "warn";
	private static final String PASS = "pass";
	private static final String NOT_TO_BE_SUPPORTED = "Not To Be Supported";

	@Test
    public void testSecureDocument() throws Exception {
    	testSecureObject("secureDocument");
    }

    @Test
    public void testSecureElement() throws Exception {
    	testSecureObject("secureElement");
    }
    
    @Test
    public void testSecureWindow() throws Exception {
    	testSecureObject("secureWindow");
    }
    
    private String value(Map<String, Object> source, String property) {
    	Object value = null;
    	if (source != null) {
    		value = source.get(property);
    	}
    	
    	return value != null ? value.toString() : NOVALUE;
    }
    
    @SuppressWarnings("unchecked")
	void testSecureObject(String className) throws Exception {
    	// Get the report object from /lockerApiTest/secureDocument.app
        openNoAura("/lockerApiTest/" + className + ".app");

        AuraUITestingUtil auraUITestingUtil = getAuraUITestingUtil();
        
		auraUITestingUtil.waitForDocumentReady();
        auraUITestingUtil.waitForAuraFrameworkReady(getAuraErrorsExpectedDuringInit());
        
        waitForCondition("return window.__lsTesterReport !== undefined;");
        
        Map<String, Object> raw = (Map<String, Object>) auraUITestingUtil.getEval("return window.__lsTesterReport;");

        contextService.startContext(Mode.FTEST, Format.JSON, Authentication.UNAUTHENTICATED);
        JsonSerializationContext jsonSerializationContext = getJsonSerializationContext();
        
        // Convert from map to json string and then back again to end up with a mutable map (the map returned from getEval() is immutable)
        StringBuilder json = new StringBuilder();
		JsonEncoder.serialize(raw, json, jsonSerializationContext);

        Map<String, Object> report = (Map<String, Object>) new JsonReader().read(json.toString());
        List<Map<String, Object>> protos = (List<Map<String, Object>>) report.get(PROTOS);
    	
    	// Key the file with the browser name to account for browser differences
        
        // Create one goldfile per interface to keep things manageable
        List<String> errors = Lists.newArrayList();
        for (Map<String, Object> proto : protos) {
        	List<String> protoErrors = Lists.newArrayList();   	
        	List<Map<String, Object>> props = (List<Map<String, Object>>) proto.get(PROPS);
    		for (Map<String, Object> prop : props) {
    			// Only goldfile props in the test plan (another test will deal with unplanned props)
    			Map<String, Object> plan = (Map<String, Object>) prop.get(PLAN);
    			if (plan != null) {
        			Map<String, Object> system = (Map<String, Object>) prop.get(SYSTEM);
        			Map<String, Object> systemType = system != null ? (Map<String, Object>) system.get(TYPE) : Collections.emptyMap();
        			Map<String, Object> locker = (Map<String, Object>) prop.get(LOCKER);
        			Map<String, Object> lockerType = locker != null ? (Map<String, Object>) locker.get(TYPE) : Collections.emptyMap();
        			
        			String name = value(prop, NAME);
        			String expectedType = value(plan, TYPE);
        			String support = value(plan, SUPPORT);
        			
        			String systemTypeValue = value(systemType, VALUE);
        			String systemStatus = value(systemType, STATUS);
        			
        			String lockerTypeValue = value(lockerType, VALUE);
        			String lockerStatus = value(lockerType, STATUS);
        			
        			// We allow warnings currently since these represent known inconsistencies that are being worked on
        			if (systemStatus.equals(PASS) && (lockerStatus.equals(PASS) || lockerStatus.equals(WARN))) {
        				continue;
        			}
        			
        			// Not supported
    				if (systemTypeValue.equals(NOT_TO_BE_SUPPORTED) && (lockerTypeValue.equals(NOT_TO_BE_SUPPORTED) || lockerTypeValue.equals(NOVALUE))) {
    					continue;
    				}
    				
    				// support == @wip
    				if (support.equals(WORK_IN_PROGRESS)) {
    					continue;
    				}
    				
    				// Expected inconsistency that we're working on
    				if (systemStatus.equals(FAIL) && lockerStatus.equals(WARN)) {
    					continue;
    				}
    				
    				// Browser does not support the feature
    				if (systemStatus.equals(NOVALUE) && lockerStatus.equals(NOVALUE)) {
    					continue;
    				}
    				
    				if (protoErrors.isEmpty()) {
    					protoErrors.add(String.format("\nErrors in prototype %s", value(proto, NAME)));
    				}
    				
    				protoErrors.add(String.format("\t%s: %s, %s, %s, %s, %s", name, expectedType, systemTypeValue, 
        					systemStatus, lockerTypeValue, lockerStatus));
    			}
    		}
    		
			if (!protoErrors.isEmpty()) {
				errors.add(Joiner.on("\n").join(protoErrors));
			}
        }
        
        if (!errors.isEmpty()) {
        	fail(String.format("\n%s\n\n", Joiner.on("\n").join(errors)));
        }
    }
}
