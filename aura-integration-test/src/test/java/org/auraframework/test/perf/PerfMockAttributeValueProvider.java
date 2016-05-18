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
package org.auraframework.test.perf;


import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Creates a mock value for a component attribute based on its type.
 * Inherit this class to provide a custom mock attribute date provider
 * eg. A custom component namespaces could provide different values for white/black list attributes
 */
public class PerfMockAttributeValueProvider {
    public static final PerfMockAttributeValueProvider DEFAULT_INSTANCE = new PerfMockAttributeValueProvider();
    private static final Map<String, List<String>> blacklistedAttributes;
    private static final Map<String, Map<String, Object>> whitelistedAttributes;

    static {
        Map<String, List<String>> blacklist = Maps.newHashMap();
        blacklist.put("ui:carousel", ImmutableList.of("priv_snap"));
        blacklist.put("ui:carouselDeprecated", ImmutableList.of("priv_snap"));
        blacklist.put("ui:scroller", ImmutableList.of("snap", "plugins"));
        blacklist.put("ui:scrollerDeprecated", ImmutableList.of("snap"));

        // We wouldn't need this output* whitelist attribute if
        // Components that inherit from ui:output abstract cmp could have overridden
        // value attribute to the correct concrete type.
        // Eg. ui:outputLabel, value attr type should be a String instead of Object.
        Map<String, Map<String, Object>> whitelist = Maps.newTreeMap();
        whitelist.put("ui:outputEmail", ImmutableMap.<String, Object>of("value", "outputEmail@mock.value"));
        whitelist.put("ui:outputLabel", ImmutableMap.<String, Object>of("value", "Mock value for 'outputLabel.value' attribute"));
        whitelist.put("ui:outputTextArea", ImmutableMap.<String, Object>of("value", "Mock value for 'outputTextArea.value' attribute"));
        whitelist.put("ui:outputRichText", ImmutableMap.<String, Object>of("value", "Mock value for 'outputRichText.value' attribute"));
        whitelist.put("ui:outputSelect", ImmutableMap.<String, Object>of("value", "Mock value for 'outputSelect.value' attribute"));
        whitelist.put("ui:dataGridSummaryCell", ImmutableMap.<String, Object>of("type", "MAX"));

        blacklistedAttributes = ImmutableMap.copyOf(blacklist);
        whitelistedAttributes = ImmutableMap.copyOf(whitelist);
    }


    protected Map<String, List<String>> getBlacklistedAttributes() {
        return blacklistedAttributes;
    }

    protected Map<String, Map<String, Object>> getWhitelistedAttributes() {
        return whitelistedAttributes;
    }

    public Object getAttributeValue(DefDescriptor<ComponentDef> componentDesc, AttributeDef attributeDef) throws QuickFixException {
        if (!needsAttributeMocking(componentDesc, attributeDef)) {
            return null;
        }

        Object attributeValue;
        String descriptorName = componentDesc.getDescriptorName();
        Map<String, Map<String, Object>> whitelistedAttributes = getWhitelistedAttributes();

        if (whitelistedAttributes.containsKey(descriptorName)
                && (attributeValue = whitelistedAttributes.get(descriptorName).get(attributeDef.getName())) != null) {
            return attributeValue;
        }

        // If attribute value is not predefined in whitelisted components list
        // use the attribute descriptor type to generate a random value.
        String className = attributeDef.getTypeDef().getDescriptor().getDescriptorName();
        Boolean isArrayType = className.endsWith("[]");

        if (isArrayType) {
            className = className.substring(0, className.length() - 2);
        }

        Object value = getMockAttributeValue(className, attributeDef);

        return isArrayType ? new Object[]{value} : value;
    }

    private Object getMockAttributeValue(String descriptorName, AttributeDef attributeDef) throws QuickFixException {
        if (descriptorName.equals("String")) {
            return String.format("Mock value for '%s' attribute", attributeDef.getName());
        } else if (descriptorName.equals("Boolean")) {
            return true;
        } else if (descriptorName.equals("Date") || descriptorName.equals("DateTime")) {
            return new Date();
        } else if (descriptorName.equals("Decimal") || descriptorName.equals("Double")) {
            return 3.14;
        } else if (descriptorName.equals("Integer")) {
            return 100;
        } else if (descriptorName.equals("Long")) {
            return 1000L;
        } else if (descriptorName.equals("Object") || descriptorName.equals("Map")) {
            return ImmutableMap.of("name", attributeDef.getName());
        } else if (descriptorName.equals("Aura.Component")) {
            // TODO: This returns a mock data provider component,
            // It covers most of list component such ui:list, ui:autocompleteList, ui:infiniteList, ui:autocomplete
            // We may need to provide different mock Component as we expand our test.
            return Aura.getInstanceService().getInstance("perfTest:registeredComponentsDataProvider", ComponentDef.class);
        } else if (descriptorName.equals("Aura.ComponentDefRef")) {
            // This mock ComponentDefRef is geared toward for list/autocomplete mock components.
            // see comment in Aura.Component mock value above
            return ImmutableMap.<String, Object>of("componentDef", "ui:menuItem",
                    "attributes", ImmutableMap.<String, ImmutableMap<?, ?>>of("values", ImmutableMap.of("label", "Mock ui:menuItem label")));
        }

        throw new InvalidDefinitionException(String.format("Value for '%s' is not defined", attributeDef.getName()), attributeDef.getTypeDef().getLocation());
    }


    private Boolean needsAttributeMocking(DefDescriptor<ComponentDef> componentDesc, AttributeDef attributeDef) throws QuickFixException {
        String descriptorName = componentDesc.getDescriptorName();
        Map<String, List<String>> blacklistedAttributes = getBlacklistedAttributes();

        if (blacklistedAttributes.containsKey(descriptorName) && blacklistedAttributes.get(descriptorName).contains(attributeDef.getName())) {
            return false;
        }
        if ("aura://String".equals(attributeDef.getTypeDef().getDescriptor().getQualifiedName())) {
            AttributeDefRef valueRef = attributeDef.getDefaultValue();
            if (valueRef == null ||
                    (valueRef.getValue() == null || valueRef.getValue().toString().isEmpty())) {
                return true;
            }
        }
        return attributeDef.isRequired();
    }
}
