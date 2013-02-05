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
package org.auraframework.throwable.quickfix;

import java.io.File;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;

/**
 * Tests for creating new markup bundles when you attempt to load a component that doesn't exist in the browser.
 */
// Unadaptable since does not function properly when running from jars
@UnAdaptableTest
public abstract class BaseComponentQuickFixUITest extends WebDriverTestCase {
    protected String typeSuffix;
    protected String capType;
    protected DefType defType;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        Aura.getContextService().startContext(Mode.SELENIUM, Format.JSON, Access.AUTHENTICATED);
    }

    @Override
    public void tearDown() throws Exception {
        super.tearDown();
    }

    public BaseComponentQuickFixUITest(String name, DefType defType, String typeSuffix) {
        super(name);
        this.typeSuffix = typeSuffix;
        this.defType = defType;
        this.capType = typeSuffix.substring(1, 2).toUpperCase() + typeSuffix.substring(2);
    }

    /**
     * Verify .cmp/.app and .css files are created through QuickFix screen.
     */
    public void testCreationQuickFix() throws Exception {
        String namespace = "auratest";
        String cmpName = String.format("nonExistent%s%s", defType.name(), System.currentTimeMillis());
        DefDescriptor<?> defDescriptor = createComponentDefDescriptor(namespace, cmpName);
        DefDescriptor<?> defDescriptorCss = Aura.getDefinitionService().getDefDescriptor(namespace + "." + cmpName,
                ThemeDef.class);
        BaseComponentQuickFixWidget quickFixUIWidget;
        quickFixUIWidget = new BaseComponentQuickFixWidget(defType, this);
        try {
            open(String.format("/%s/%s%s", namespace, cmpName, typeSuffix), Mode.DEV);
            quickFixUIWidget.verifyToolbarAndClickCreate(defDescriptor.getQualifiedName());
            quickFixUIWidget.verifyCustomizationMenu();
            quickFixUIWidget.selectCssCheckbox(true);
            quickFixUIWidget.clickFix(true, String.format("TODO: %s:%s", namespace, cmpName));
            // Serverside verification
            assertTrue("Failed to locate the definition", defDescriptor.exists());
            assertTrue("Failed to locate the css definition", defDescriptorCss.exists());
        } finally {
            quickFixUIWidget.deleteFiles(defDescriptor);
        }
    }

    /**
     * Verify error message that is displayed when attempting to create a cmp bundle with a non-existing namespace.
     */
    public void testCreationQuickFixNonexistentNamespace() throws Exception {
        String namespace = String.format("nonExistentNamespace%s", System.currentTimeMillis());
        String cmpName = String.format("nonExistent%s%s", defType.name(), System.currentTimeMillis());
        DefDescriptor<?> defDescriptor = createComponentDefDescriptor(namespace, cmpName);
        BaseComponentQuickFixWidget quickFixUIWidget;
        quickFixUIWidget = new BaseComponentQuickFixWidget(defType, this);
        try {
            open(String.format("/%s/%s%s", namespace, cmpName, typeSuffix), Mode.DEV);
            quickFixUIWidget.verifyToolbarAndClickCreate(defDescriptor.getQualifiedName());
            quickFixUIWidget.verifyCustomizationMenu();
            quickFixUIWidget.clickFix(false, "Cannot find location to save definition");
            assertFalse("Should not have created component bundle", defDescriptor.exists());
        } finally {
            quickFixUIWidget.deleteFiles(defDescriptor);
        }
    }

    /**
     * Verify error message when incorrectly formatted DefDescriptor is entered.
     */
    public void testBadDescriptorFormat() throws Exception {
        String namespace = String.format("auratest", System.currentTimeMillis());
        String cmpName = String.format("nonExistent%s%s", defType.name(), System.currentTimeMillis());
        DefDescriptor<?> defDescriptor = createComponentDefDescriptor(namespace, cmpName);
        BaseComponentQuickFixWidget quickFixUIWidget;
        quickFixUIWidget = new BaseComponentQuickFixWidget(defType, this);
        try {
            open(String.format("/%s/%s%s", namespace, cmpName, typeSuffix), Mode.DEV);
            quickFixUIWidget.verifyToolbarAndClickCreate(defDescriptor.getQualifiedName());
            quickFixUIWidget.verifyCustomizationMenu();
            quickFixUIWidget.setDescriptorNames("auratest:aaa.java");
            quickFixUIWidget.clickFix(false, "Invalid Descriptor Format: auratest:aaa.java");
            assertFalse("Should not have created component bundle", defDescriptor.exists());
        } finally {
            quickFixUIWidget.deleteFiles(defDescriptor);
        }
    }

    /**
     * Verify that multiple component bundles can be created by entering the DefDescriptors in, comma separated.
     */
    // TODO(tbliss): W-1510001 Why is this failing on touch's autobuild? Passes locally and testCreationQuickFix, which
    // is very similar, seems to be passing fine.
    public void testMultipleDescriptors() throws Exception {
        String namespace = String.format("auratest", System.currentTimeMillis());
        String cmpName1 = String.format("nonExistent1%s%s", defType.name(), System.currentTimeMillis());
        String cmpName2 = String.format("nonExistent2%s%s", defType.name(), System.currentTimeMillis());
        DefDescriptor<?> defDescriptor1 = createComponentDefDescriptor(namespace, cmpName1);
        DefDescriptor<?> defDescriptor2 = createComponentDefDescriptor(namespace, cmpName2);
        BaseComponentQuickFixWidget quickFixUIWidget;
        quickFixUIWidget = new BaseComponentQuickFixWidget(defType, this);
        try {
            open(String.format("/%s/%s%s", namespace, cmpName1, typeSuffix), Mode.DEV);
            quickFixUIWidget.verifyToolbarAndClickCreate(defDescriptor1.getQualifiedName());
            quickFixUIWidget.verifyCustomizationMenu();
            quickFixUIWidget.setDescriptorNames(namespace + ":" + cmpName1 + ", " + namespace + ":" + cmpName2);
            quickFixUIWidget.clickFix(true, String.format("TODO: %s:%s", namespace, cmpName1));
            assertTrue("Should not have created component bundle", defDescriptor1.exists());
            assertTrue("Should not have created component bundle", defDescriptor2.exists());
        } finally {
            quickFixUIWidget.deleteFiles(defDescriptor1);
            quickFixUIWidget.deleteFiles(defDescriptor2);
        }
    }

    /**
     * Verify QuickFix works when we load a component that exists but contains an inner component that does not.
     */
    public void testCreateInnerCmp() throws Exception {
        String namespace = "auratest";
        String cmpName = "innerCmpThatDoesntExist";
        String parentFullName;
        String parentCmpName;
        BaseComponentQuickFixWidget quickFixUIWidget;
        DefDescriptor<?> defDescriptorChild;
        // We're actually creating a .cmp file here so use that helper class
        quickFixUIWidget = new BaseComponentQuickFixWidget(DefType.COMPONENT, this);
        parentFullName = String.format("/%s/createInnerCmpQuickFix%s%s", namespace, capType, typeSuffix);
        parentCmpName = String.format("createInnerCmpQuickFix%s", capType);
        defDescriptorChild = Aura.getDefinitionService().getDefDescriptor(namespace + ":" + cmpName,
                ComponentDef.class);
        try {
            open(parentFullName, Mode.DEV);
            quickFixUIWidget.verifyToolbarAndClickCreate(defDescriptorChild.getQualifiedName());
            quickFixUIWidget.verifyCustomizationMenu();
            quickFixUIWidget.clickFix(true,
                    String.format("TODO: %s:%s\nIn component " + parentCmpName, namespace, cmpName));
            assertTrue("Failed to locate the definition: " + defDescriptorChild, defDescriptorChild.exists());
        } finally {
            quickFixUIWidget.deleteFiles(defDescriptorChild);
        }
    }

    /**
     * Verify error message when creating inner component with a bad namespace.
     */
    public void testCreateInnerCmpBadNamespace() throws Exception {
        String namespace = "auratest";
        String cmpName = "innerCmpThatDoesntExist";
        String parentFullName;
        BaseComponentQuickFixWidget quickFixUIWidget;
        DefDescriptor<?> defDescriptorChild;
        // We're actually creating a .cmp file here so use that helper class
        quickFixUIWidget = new BaseComponentQuickFixWidget(DefType.COMPONENT, this);
        parentFullName = String.format("/%s/createInnerCmpQuickFix%s%s", namespace, capType, typeSuffix);
        defDescriptorChild = Aura.getDefinitionService().getDefDescriptor(namespace + ":" + cmpName,
                ComponentDef.class);
        try {
            open(parentFullName, Mode.DEV);
            quickFixUIWidget.verifyToolbarAndClickCreate(defDescriptorChild.getQualifiedName());
            quickFixUIWidget.verifyCustomizationMenu();
            quickFixUIWidget.setDescriptorNames("auratestasdf:innerCmpThatDoesntExist");
            quickFixUIWidget.clickFix(false, "Cannot find location to save definition.");
            assertFalse("Should not have created the component bundle with bad namespace", defDescriptorChild.exists());
        } finally {
            quickFixUIWidget.deleteFiles(defDescriptorChild);
        }
    }

    /**
     * Create component DefDescriptor for given namespace and component name. Also check if source for that file name
     * already exists. Delete the pre-existing files if they do exist.
     */
    private DefDescriptor<?> createComponentDefDescriptor(String namespace, String cmpName) {
        DefDescriptor<?> defDescriptor = null;
        if (defType == DefType.APPLICATION) {
            defDescriptor = Aura.getDefinitionService().getDefDescriptor(namespace + ":" + cmpName,
                    ApplicationDef.class);
        } else if (defType == DefType.COMPONENT) {
            defDescriptor = Aura.getDefinitionService().getDefDescriptor(namespace + ":" + cmpName, ComponentDef.class);
        }
        if (defDescriptor.exists()) {
            File f = new File(Aura.getContextService().getCurrentContext().getDefRegistry().getSource(defDescriptor)
                    .getSystemId());
            f.delete();
        }
        return defDescriptor;
    }
}
