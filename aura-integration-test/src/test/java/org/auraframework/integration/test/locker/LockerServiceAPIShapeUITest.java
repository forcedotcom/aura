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
    private static final String PROTOS = "protos";
    private static final String PROTO = "proto";
	private static final String PROPS = "props";
    private static final String OBJ = "object";
	private static final String OBJTYPE = "objectType";
    private static final String SECUREOBJTYPE = "secureObjectType";
    private static final String STATUS = "status";
    private static final String PASS = "pass";
    private static final String FAIL = "fail";
    private static final String WARNING = "warning";
    private static final String UNDEFINED = "Undefined";

	@Test
    public void testSecureDocument() throws Exception {
    	testSecureObject("secureDocumentTab");
    }

    @Test
    public void testSecureElement() throws Exception {
    	testSecureObject("secureElementTab");
    }

    @Test
    public void testSecureWindow() throws Exception {
    	testSecureObject("secureWindowTab");
    }

    private String value(Map<String, Object> source, String property) {
    	Object value = null;
    	if (source != null) {
    		value = source.get(property);
    	}

    	return value != null ? value.toString() : UNDEFINED;
    }

    @SuppressWarnings("unchecked")
	void testSecureObject(String className) throws Exception {
        openNoAura("/lockerApiTest/" + className + ".cmp");

        AuraUITestingUtil auraUITestingUtil = getAuraUITestingUtil();

		auraUITestingUtil.waitForDocumentReady();
        auraUITestingUtil.waitForAuraFrameworkReady(getAuraErrorsExpectedDuringInit());

        // Value set on /lockerApiTest/[className]Controller.js file. //
        waitForCondition("return window.__" + className + "TesterReport !== undefined;");
        Map<String, Object> raw = (Map<String, Object>) auraUITestingUtil.getEval("return window.__" + className + "TesterReport;");

        contextService.startContext(Mode.FTEST, Format.JSON, Authentication.UNAUTHENTICATED);
        JsonSerializationContext jsonSerializationContext = getJsonSerializationContext();

        // Convert Map --> JSON String --> Map to end up with a mutable map because the map returned from getEval() is immutable. //
        StringBuilder json = new StringBuilder();
		JsonEncoder.serialize(raw, json, jsonSerializationContext);

        Map<String, Object> report = (Map<String, Object>) new JsonReader().read(json.toString());
        List<Map<String, Object>> protos = (List<Map<String, Object>>) report.get(PROTOS);

        // Create one goldfile per secureObject. //
        List<String> errors = Lists.newArrayList();
        for (Map<String, Object> proto : protos) {
        	List<String> protoErrors = Lists.newArrayList();
        	List<Map<String, Object>> props = (List<Map<String, Object>>) proto.get(PROPS);
    		for (Map<String, Object> prop : props) {
    			String object = value(prop, OBJ);
                String objectType = value(prop, OBJTYPE);
                String secureObjectType = value(prop, SECUREOBJTYPE);
                String status = value(prop, STATUS);

                if (!object.equals(UNDEFINED) && !objectType.equals(UNDEFINED) && !status.equals(UNDEFINED)) {
                    continue;
                }

                if (status.equals(PASS) && objectType.equals(secureObjectType)) {
                    continue;
                }

                if (status.equals(FAIL) && secureObjectType.equals(UNDEFINED)) {
                    continue;
                }

                if (status.equals(WARNING) && !objectType.equals(secureObjectType)) {
                    continue;
                }

                if (status.equals(PASS) || status.equals(FAIL) || status.equals(WARNING)) {
                    continue;
                }

				if (protoErrors.isEmpty()) {
					protoErrors.add(String.format("\nErrors in prototype %s", value(proto, PROTO)));
				}

				protoErrors.add(String.format("\t%s: %s, %s, %s, %s", proto, object, objectType, secureObjectType, status));
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
