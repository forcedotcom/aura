/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.component.ui;

import java.util.List;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
/**
 * Unit test automation for ui namespaced components.
 *
 *
 * @since 138
 */
public class UIComponentsTest extends AuraImplTestCase {
    public UIComponentsTest(String name){
        super(name);
    }
    /**
     * Verify that all ui:* components are extensible.
     */
    public void testExtensible() throws Exception {
        List<String> failures = Lists.newLinkedList();
        for (ComponentDef def : getUiComponents()) {
            if (!def.isExtensible()) {
                failures.add(def.getName());
            }
        }

        if (!failures.isEmpty()) fail("The following ui:* components should be extensible: " + failures);
    }

    private Set<ComponentDef> getUiComponents() throws Exception {
        DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor("markup://ui:*",
                ComponentDef.class);
        Set<ComponentDef> ret = Sets.newHashSet();
        for (DefDescriptor<ComponentDef> def : definitionService.find(matcher)) {
            if (!NON_EXTENSIBLE_COMPONENTS.contains(def.getName())) {
                ret.add(def.getDef());
            }
        }

        return ret;
    }

    private static final Set<String> NON_EXTENSIBLE_COMPONENTS = Sets.newHashSet("vbox", "resizeObserver", "scroller");
}
