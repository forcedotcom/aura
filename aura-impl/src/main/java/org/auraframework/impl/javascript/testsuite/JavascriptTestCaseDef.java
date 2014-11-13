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
package org.auraframework.impl.javascript.testsuite;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

public class JavascriptTestCaseDef extends DefinitionImpl<TestCaseDef> implements TestCaseDef {
    public JavascriptTestCaseDef(DefDescriptor<TestSuiteDef> suiteDescriptor, String name, Location location,
            Map<String, Object> attributes, DefType defType, Set<String> testLabels, Set<String> browsers,
            List<Object> mocks, Set<String> auraErrorsExpectedDuringInit, String scrumTeam, String owner) {
        super(DefDescriptorImpl.getInstance(suiteDescriptor.getQualifiedName() + "/" + DefType.TESTCASE + "$" + name,
                TestCaseDef.class), location, null);
        this.suiteDescriptor = suiteDescriptor;
        this.attributes = AuraUtil.immutableMap(attributes);
        this.defType = defType;
        this.testLabels = AuraUtil.immutableSet(testLabels);
        this.browsers = AuraUtil.immutableSet(browsers);
        this.mocks = AuraUtil.immutableList(mocks);

        List<Definition> tMockDefs = null;
        QuickFixException qfe = null;
        try {
            tMockDefs = parseMocks();
        } catch (QuickFixException t) {
            qfe = t;
        }
        this.mockDefs = tMockDefs;
        this.mockException = qfe;
        this.name = name;
        this.auraErrorsExpectedDuringInit = auraErrorsExpectedDuringInit;
        this.scrumTeam = scrumTeam;
        this.owner = owner;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (this.mockException != null) {
            throw this.mockException;
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("name", getName());
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("attributes", attributes);
        json.writeMapEntry("defType", defType);
        json.writeMapEntry("testLabels", testLabels);
        json.writeMapEntry("browsers", browsers);
        json.writeMapEntry("auraErrorsExpectedDuringInit", auraErrorsExpectedDuringInit);
        json.writeMapEntry("scrumTeam", scrumTeam);
        json.writeMapEntry("owner", owner);
        json.writeMapEnd();
    }
    
    @Override
    public String getScrumTeam() {
        return scrumTeam;
    }

    @Override
    public  String getOwner() {
        return owner;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Map<String, Object> getAttributeValues() {
        return attributes;
    }

    @Override
    public DefType getDefType() {
        return defType;
    }

    @Override
    public Set<String> getTestLabels() {
        return testLabels;
    }

    @Override
    public Set<String> getBrowsers() {
        return browsers;
    }

    @Override
    public List<Definition> getLocalDefs() {
        return mockDefs;
    }

    @Override
    public Set<String> getAuraErrorsExpectedDuringInit() {
        return auraErrorsExpectedDuringInit;
    }

    @Override
    public String getQualifiedName() {
        if (this.getDescriptor() != null) {
            String cb = getCurrentBrowser();
            if ((cb != null) && (cb.length() > 0)) {
                return this.getDescriptor().getQualifiedName() + ":BROWSERTYPE" + cb;
            } else {
                return this.getDescriptor().getQualifiedName();
            }
        } else {
            return "";
        }
    }

    @Override
    public void setCurrentBrowser(String b) {
        this.currentBrowser = b;
    }

    private String getCurrentBrowser() {
        return this.currentBrowser;
    }

    private static Definition parseMock(DefDescriptor<? extends BaseComponentDef> compDesc,
            Map<String, Object> map) throws QuickFixException {
        DefType mockType = DefType.valueOf((String) map.get("type"));
        switch (mockType) {
        case MODEL:
            return new JavascriptMockModelHandler(compDesc, map).getDefinition();
        case ACTION:
            return new JavascriptMockActionHandler(compDesc, map).getDefinition();
        case PROVIDER:
            return new JavascriptMockProviderHandler(compDesc, map).getDefinition();
        default:
            return null;
        }
    }

    private List<Definition> parseMocks() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> compDesc = DefDescriptorImpl
                .getAssociateDescriptor(suiteDescriptor, ComponentDef.class,
                        DefDescriptor.MARKUP_PREFIX);
        List<Definition> building = Lists.newArrayList();
        if (mocks != null && !mocks.isEmpty()) {
            for (Object mock : mocks) {
                @SuppressWarnings("unchecked")
                Definition mockDef = parseMock(compDesc, (Map<String, Object>) mock);
                if (mockDef != null) {
                    building.add(mockDef);
                }
            }
        }
        return building;
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();

        List<Definition> tMockDefs = null;
        QuickFixException qfe = null;
        try {
            tMockDefs = parseMocks();
        } catch (QuickFixException t) {
            qfe = t;
        }
        this.mockDefs = tMockDefs;
        this.mockException = qfe;
    }

    private String currentBrowser = "";
    private static final long serialVersionUID = -5460410624026635318L;
    private final Map<String, Object> attributes;
    private final DefType defType;
    private final Set<String> testLabels;
    private final Set<String> browsers;
    private final List<Object> mocks;
    private final Set<String> auraErrorsExpectedDuringInit;
    private final String name;
    private final String scrumTeam;
    private final String owner;
    private final DefDescriptor<TestSuiteDef> suiteDescriptor;
    
    transient private List<Definition> mockDefs;
    transient private QuickFixException mockException;
}
