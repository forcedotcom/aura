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
package org.auraframework.impl.adapter;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.impl.context.LocalizationAdapterImpl;

public class TestLocalizationAdapterImpl extends LocalizationAdapterImpl {
    private static final String DEFAULT_SECTION = "AuraTestLabelSection";

    private final Map<Object, String> labels = new HashMap<>();

    public TestLocalizationAdapterImpl() {
        setTestLabel(DEFAULT_SECTION, "dynamic_label_for_test", "we have {0} members");
        setTestLabel(DEFAULT_SECTION, "label_for_attribute_default_value_test", "testing label");
        setTestLabel("Section1", "controller", "Controller");
        setTestLabel("Section2", "controller", "Controller");
        setTestLabel("Section_A", "controller", "Controller");
        setTestLabel("Section1", "helper", "Helper");
        setTestLabel("Section2", "helper", "Helper");
        setTestLabel("ML_Comment", "helper", "Helper");
        setTestLabel("SL_Comment", "helper", "Helper");
        setTestLabel("Section_a", "helper", "Helper");
        setTestLabel("Section_B", "helper", "Helper");
        setTestLabel("Section5", "helper", "Helper");
        setTestLabel("Section1", "provider", "Provider");
        setTestLabel("Section2", "provider", "Provider");
        setTestLabel("Section3", "provider", "Provider");
        setTestLabel("Section1", "renderer", "Renderer");
        setTestLabel("Section2", "renderer", "Renderer");
        setTestLabel("Section3", "renderer", "Renderer");
        setTestLabel("Section1", "library", "Library1");
        setTestLabel("Section2", "library", "Library2");
        setTestLabel("Section1", "badlibrary", "BadLibrary1");
        setTestLabel("Section2", "badlibrary", "BadLibrary2");
        setTestLabel("SectionJsonTest_s", "s", "serialId");
        setTestLabel("SectionJsonTest_sid", "sid", "serialIdShort");
        setTestLabel("SectionJsonTest_r", "r", "serialRefId");
        setTestLabel("SectionJsonTest_rid", "rid", "serialRefIdShort");
    }

    private Object getLabelKey(String section, String name) {
        return section + "." + name;
    }

    private void setTestLabel(String section, String name, String value) {
        labels.put(getLabelKey(section, name), value);
    }

    public String getTestLabel(String section, String name, Object... params) {
        return labels.get(getLabelKey(section, name));
    }

    @Override
    public String getLabel(String section, String name, Object... params) {
        String testLabel = getTestLabel(section, name, params);
        if (testLabel != null) {
            return testLabel;
        }
        return super.getLabel(section, name, params);
    }
}
