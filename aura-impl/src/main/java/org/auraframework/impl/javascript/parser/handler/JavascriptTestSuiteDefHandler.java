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
package org.auraframework.impl.javascript.parser.handler;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.parser.handler.mock.JavascriptMockActionHandler;
import org.auraframework.impl.javascript.parser.handler.mock.JavascriptMockModelHandler;
import org.auraframework.impl.javascript.parser.handler.mock.JavascriptMockProviderHandler;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

import com.google.common.collect.Sets;

/**
 * Javascript handler for test suite defs
 * 
 * 
 * @since 0.0.194
 */
public class JavascriptTestSuiteDefHandler extends JavascriptHandler<TestSuiteDef, TestSuiteDef> {

    private final Builder builder = new Builder();

    public JavascriptTestSuiteDefHandler(DefDescriptor<TestSuiteDef> descriptor, Source<?> source) {
        super(descriptor, source);
        builder.code = source.getContents();
    }

    private Definition parseMock(DefDescriptor<? extends BaseComponentDef> compDesc,
            Map<String, Object> map) throws QuickFixException {
        DefType mockType = DefType.valueOf((String) map.get("type"));
        switch (mockType) {
        case MODEL:
            return new JavascriptMockModelHandler(descriptor, source, compDesc, map).getDefinition();
        case ACTION:
            return new JavascriptMockActionHandler(descriptor, source, compDesc, map).getDefinition();
        case PROVIDER:
            return new JavascriptMockProviderHandler(descriptor, source, compDesc, map).getDefinition();
        default:
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    protected JavascriptTestSuiteDef createDefinition(Map<String, Object> map) throws QuickFixException {
        builder.setDescriptor(descriptor);
        builder.setLocation(getLocation());
        builder.caseDefs = new ArrayList<TestCaseDef>();

        Map<String, Object> defaultAttributes = (Map<String, Object>) map.get("attributes");
        List<String> browserListForTestSet = (List<String>) (List<?>) map.get("browsers");
        for (Entry<String, Object> entry : map.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("test")) {
                Map<String, Object> value = (Map<String, Object>) entry.getValue();
                Object t = value.get("test");
                if (!(t instanceof JsFunction)) {
                    if (t instanceof List) {
                        List<Object> functions = (List<Object>) t;
                        for (Object i : functions) {
                            if (!(i instanceof JsFunction)) {
                                throw new AuraRuntimeException(
                                        key + " 'test' must be a function or an array of functions");
                            }
                        }
                    } else {
                        throw new AuraRuntimeException(
                                key + " 'test' must be a function or an array of functions");
                    }
                }

                Map<String, Object> attributes = (Map<String, Object>) value
                        .get("attributes");

                List<String> labelsList = (List<String>) (List<?>) value
                        .get("testLabels");
                Set<String> labels = labelsList == null ? Collections.EMPTY_SET
                        : Sets.newHashSet(labelsList);

                List<String> browserListForTestCase = (List<String>) (List<?>) value
                        .get("browsers");
                Set<String> browsers = browserListForTestCase == null ? (browserListForTestSet == null ? Collections.EMPTY_SET
                        : Sets.newHashSet(browserListForTestSet))
                        : Sets.newHashSet(browserListForTestCase);
                
                List<String> exceptionsAllowedDuringInitList = (List<String>) (List<?>) value
						.get("exceptionsAllowedDuringInit");
				Set<String> exceptionsAllowedDuringInit = exceptionsAllowedDuringInitList == null ? Collections.EMPTY_SET
						: Sets.newHashSet(exceptionsAllowedDuringInitList);
				
                DefDescriptor<? extends BaseComponentDef> compDesc = DefDescriptorImpl
                        .getAssociateDescriptor(descriptor, ComponentDef.class,
                                DefDescriptor.MARKUP_PREFIX);
                if (compDesc == null || !compDesc.exists()) {
                    compDesc = DefDescriptorImpl.getAssociateDescriptor(
                            descriptor, ApplicationDef.class,
                            DefDescriptor.MARKUP_PREFIX);
                }
                DefType defType = compDesc.getDefType();

                Set<Definition> mocks = Sets.newHashSet();
                List<Object> jsList = (List<Object>) value.get("mocks");
                if (jsList != null && !jsList.isEmpty()) {
                    for (Object jsItem : jsList) {
                        Definition mockDef = parseMock(compDesc,
                                (Map<String, Object>) jsItem);
                        if (mockDef != null) {
                            mocks.add(mockDef);
                        }
                    }
                }

                builder.caseDefs.add(new JavascriptTestCaseDef(descriptor, key,
                        null, attributes != null ? attributes
                                : defaultAttributes, defType, labels, browsers,
                        mocks, exceptionsAllowedDuringInit));
            }
        }

        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        // ignore these
    }
}
