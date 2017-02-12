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

import java.io.IOException;
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
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Javascript handler for test suite defs
 * 
 * 
 * @since 0.0.194
 */
public class JavascriptTestSuiteDefHandler extends JavascriptHandler<TestSuiteDef, TestSuiteDef> {

    private final Builder builder = new Builder();

    public JavascriptTestSuiteDefHandler(DefDescriptor<TestSuiteDef> descriptor, TextSource<?> source) {
        super(descriptor, source);
        builder.code = source.getContents();
    }

    private void putMocks(Map<String, Object> mocksMap, List<Object> mocks) {
        if (mocks == null) {
            return;
        }
        for (Object obj : mocks) {
            @SuppressWarnings("unchecked")
            Map<String, Object> mock = (Map<String, Object>) obj;
            mocksMap.put((String) mock.get("type") + "@@@" + (String) mock.get("descriptor"), mock);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    protected JavascriptTestSuiteDef createDefinition(String code) throws QuickFixException, IOException {
        builder.setDescriptor(descriptor);
        builder.setLocation(getLocation());
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        builder.caseDefs = new ArrayList<>();

        DefDescriptor<? extends BaseComponentDef> compDesc = DefDescriptorImpl
                .getAssociateDescriptor(descriptor, ComponentDef.class,
                        DefDescriptor.MARKUP_PREFIX);

        Map<String, Object> map = codeToMap(code);
        Map<String, Object> suiteAttributes = (Map<String, Object>) map.get("attributes");
        List<String> suiteLabels = (List<String>) map.get("labels");
        String suiteScrumTeam = (String) map.get("scrumTeam");
        String suiteOwner = (String) map.get("owner");

        List<String> suiteBrowsers = (List<String>) (List<?>) map.get("browsers");
        // Verify that we can parse.
        List<Object> suiteMocks = (List<Object>) map.get("mocks");
        Map<String, Object> suiteMocksMap = null;
        DefinitionAccessImpl caseAccess = new DefinitionAccessImpl(AuraContext.Access.PRIVATE);

        for (Entry<String, Object> entry : map.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("test")) {
                Map<String, Object> value;
                try {
                    value = (Map<String, Object>) entry.getValue();
                } catch (ClassCastException cce) {
                    throw new InvalidDefinitionException(key + " must be an object", getLocation());
                }
                Object t = value.get("test");
                if (!(t instanceof JsFunction)) {
                    if (t instanceof List) {
                        List<Object> functions = (List<Object>) t;
                        for (Object i : functions) {
                            if (!(i instanceof JsFunction)) {
                                throw new InvalidDefinitionException(
                                        key + " 'test' must be a function or an array of functions",
                                        getLocation());
                            }
                        }
                    } else {
                        throw new InvalidDefinitionException(
                                key + " 'test' must be a function or an array of functions",
                                getLocation());
                    }
                }

                Map<String, Object> caseAttributes = (Map<String, Object>) value.get("attributes");
                Map<String, Object> attributes = null;
                if (suiteAttributes != null) {
                    attributes = Maps.newHashMap(suiteAttributes);
                }
                if (caseAttributes != null) {
                    if (attributes == null) {
                        attributes = Maps.newHashMap(caseAttributes);
                    } else {
                        attributes.putAll(caseAttributes);
                    }
                }

                List<String> caseLabels = (List<String>) (List<?>) value.get("labels");
                Set<String> labels = Sets.newHashSet();
                if (suiteLabels != null) {
                    labels.addAll(suiteLabels);
                }
                if (caseLabels != null) {
                    labels.addAll(caseLabels);
                }

                String caseScrumTeam = (String) value.get("scrumTeam");
                String caseOwner = (String) value.get("owner");
                String scrumTeam = "";
                String owner = "";

                // For scrumTeam
                if (!Strings.isNullOrEmpty(suiteScrumTeam)) {
                    scrumTeam = suiteScrumTeam;
                }
                if (!Strings.isNullOrEmpty(caseScrumTeam)) {
                    scrumTeam = caseScrumTeam;
                }
                // For Owner
                if (!Strings.isNullOrEmpty(suiteOwner)) {
                    owner = suiteOwner;
                }
                if (!Strings.isNullOrEmpty(caseOwner)) {
                    owner = caseOwner;
                }
                List<String> caseBrowsers = (List<String>) (List<?>) value.get("browsers");
                Set<String> browsers = caseBrowsers == null ? (suiteBrowsers == null ? Collections.EMPTY_SET
                        : Sets.newHashSet(suiteBrowsers))
                        : Sets.newHashSet(caseBrowsers);

                List<String> auraErrorsExpectedDuringInitList = (List<String>) (List<?>) value
                        .get("auraErrorsExpectedDuringInit");
                Set<String> auraErrorsExpectedDuringInit = auraErrorsExpectedDuringInitList == null ? Collections.EMPTY_SET
                        : Sets.newHashSet(auraErrorsExpectedDuringInitList);

                if (compDesc == null || !compDesc.exists()) {
                    compDesc = DefDescriptorImpl.getAssociateDescriptor(
                            descriptor, ApplicationDef.class,
                            DefDescriptor.MARKUP_PREFIX);
                }
                DefType defType = compDesc.getDefType();

                List<Object> caseMocks = (List<Object>) value.get("mocks");

                List<Object> mocks;
                if (suiteMocks == null || suiteMocks.isEmpty()) {
                    mocks = caseMocks;
                } else if (caseMocks == null || caseMocks.isEmpty()) {
                    mocks = suiteMocks;
                } else {
                    Map<String, Object> mocksMap;
                    if (suiteMocksMap == null) {
                        suiteMocksMap = Maps.newHashMap();
                        putMocks(suiteMocksMap, suiteMocks);
                    }
                    mocksMap = Maps.newHashMap(suiteMocksMap);
                    putMocks(mocksMap, caseMocks);
                    mocks = Lists.newArrayList(mocksMap.values());
                }

                builder.caseDefs.add(new JavascriptTestCaseDef(descriptor, key, null, attributes, defType, labels,
                        browsers, mocks, auraErrorsExpectedDuringInit, scrumTeam, owner, caseAccess));
            }
        }

        return builder.build();
    }

    @Override
    protected TestSuiteDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }
}
