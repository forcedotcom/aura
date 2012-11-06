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

import org.junit.Ignore;
import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.TestLabels;

/**
 * @since 0.0.171
 */
@TestLabels("auraSanity")
public abstract class BaseComponentQuickFixUITest extends WebDriverTestCase {
    protected String typeSuffix;
    protected DefType defType;
    QuickFixUIWidget quickFixUIWidget;

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
        quickFixUIWidget = new QuickFixUIWidget(defType, this);
    }

    @Ignore
    public void testCreationQuickFix() throws Exception {
        // This test needs to be updated because of "preloads" fix
        String namespace = "auratest";
        String cmpName = String.format("nonExistant%s%s", defType.name(), System.currentTimeMillis());
        DefDescriptor<?> defDescriptor = null;
        if (defType == DefType.APPLICATION) {
            defDescriptor = Aura.getDefinitionService().getDefDescriptor(namespace+":"+cmpName, ApplicationDef.class);
        } else if (defType == DefType.COMPONENT) {
            defDescriptor = Aura.getDefinitionService().getDefDescriptor(namespace+":"+cmpName, ComponentDef.class);
        }
        File f = null;
        if(defDescriptor.exists()){
            f = new File(Aura.getContextService().getCurrentContext().getDefRegistry().getSource(defDescriptor).getSystemId());
            f.delete();
        }
        try {
            open(String.format("/%s/%s%s", namespace, cmpName, typeSuffix), Mode.DEV);
            quickFixUIWidget.verifyQuickFixButtons();
            quickFixUIWidget.clickCreate();
            String result = quickFixUIWidget.clickFix(true);
            assertEquals(String.format("TODO: %s:%s", namespace, cmpName), result);
            //Serverside verification.
            assertTrue("Failed to locate the definition.",defDescriptor.exists());
        } finally {
            f = new File(Aura.getContextService().getCurrentContext().getDefRegistry().getSource(defDescriptor).getSystemId());
            if(f.exists()){
                f.delete();
                f.getParentFile().delete();
            }
        }
    }

    /*If there is no such namespace, we now just show a runtime error instead of the quickfix
    }*/
}
