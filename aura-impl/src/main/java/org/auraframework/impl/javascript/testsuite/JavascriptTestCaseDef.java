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
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.Location;
import org.auraframework.util.json.Json;

public class JavascriptTestCaseDef extends DefinitionImpl<TestCaseDef> implements TestCaseDef {
    public JavascriptTestCaseDef(DefDescriptor<TestSuiteDef> suiteDescriptor, String name, Location location,
            Map<String, Object> attributes, DefType defType, Set<String> testLabels, Set<String> browsers,
            Set<Definition> mocks, Set<String> auraErrorsExpectedDuringInit, String scrumTeam, String owner) {
        super(DefDescriptorImpl.getInstance(suiteDescriptor.getQualifiedName() + "/" + DefType.TESTCASE + "$" + name,
                TestCaseDef.class), location, null);
        this.attributes = AuraUtil.immutableMap(attributes);
        this.defType = defType;
        this.testLabels = AuraUtil.immutableSet(testLabels);
        this.browsers = AuraUtil.immutableSet(browsers);
        this.mocks = AuraUtil.immutableSet(mocks);
        this.name = name;
        this.auraErrorsExpectedDuringInit = auraErrorsExpectedDuringInit;
        this.scrumTeam = scrumTeam;
        this.owner = owner;
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
    public Set<Definition> getLocalDefs() {
        return mocks;
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

    private String currentBrowser = "";
    private static final long serialVersionUID = -5460410624026635318L;
    private final Map<String, Object> attributes;
    private final DefType defType;
    private final Set<String> testLabels;
    private final Set<String> browsers;
    private final Set<Definition> mocks;
    private final Set<String> auraErrorsExpectedDuringInit;
    private final String name;
    private final String scrumTeam;
    private final String owner;
}
