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
package org.auraframework.component.aura;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.JavascriptExecutor;

/**
 * This class has tests to verify the component tree constructed on the client
 * based on information sent from AuraServlet.
 */
public class ComponentTreeTest extends WebDriverTestCase {

    public ComponentTreeTest(String name) {
        super(name);
    }

    /**
     * Verify client shape for application.
     * 
     * @throws Exception
     */
    public void testServerVSClientShape() throws Exception {
        checkServerVsClient("auratest:testApplication1", ApplicationDef.class);
    }

    /**
     * Verify client shape for a foreach loop.
     * 
     * @throws Exception
     */
    public void testForeachBasicTypes() throws Exception {
        checkServerVsClient("foreachDefTest:basicDataType", ComponentDef.class);
    }

    /**
     * Convenience method to compare globalIds of component instance in the
     * client with component instance in the server.
     * 
     * @param name the name of the component/app to check
     * @param type the type (app/component)
     * @throws Exception
     */
    private <T extends Definition> void checkServerVsClient(String name, Class<T> type) throws Exception {
        DefDescriptor<T> dd = Aura.getDefinitionService().getDefDescriptor(name, type);
        ContextService contextService = Aura.getContextService();
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        contextService.startContext(AuraContext.Mode.DEV, AuraContext.Format.HTML, AuraContext.Access.AUTHENTICATED);
        open(String.format("/%s/%s.%s", dd.getNamespace(), dd.getName(),
                DefDescriptor.DefType.APPLICATION.equals(dd.getDefType()) ? "app" : "cmp"), Mode.SELENIUM);
        // open(dd);
        String clientIndex = getEval("return window.aura.componentService.getIndex();");
        String[] clientlines = clientIndex.split("\n");

        AuraContext context = contextService.getCurrentContext();
        context.setNum("1");
        Aura.getInstanceService().getInstance(dd.getQualifiedName(), dd.getDefType().getPrimaryInterface());

        Map<String, BaseComponent<?, ?>> serverIndex = context.getComponents();

        StringBuilder serverIndexSB = new StringBuilder();

        for (int i = 1; i < serverIndex.size() + 1; i++) {
            String globalId = i + ":1";
            BaseComponent<?, ?> cmp = serverIndex.get(globalId);
            BaseComponent<?, ?> vp = cmp.getAttributes().getValueProvider();

            serverIndexSB.setLength(0);
            serverIndexSB.append(cmp.getGlobalId()).append(".1 : ").append(cmp.getDescriptor().toString());
            serverIndexSB.append(" [ ");

            if (vp != null) {
                serverIndexSB.append(vp.getGlobalId()).append(".1 : ").append(vp.getDescriptor().toString());
            }

            serverIndexSB.append(" ] ");
            // System.out.println(serverIndexSB.toString().toLowerCase()
            // +" @@@@ "+ clientlines[i-1].toLowerCase());
            assertEquals(serverIndexSB.toString().toLowerCase(), clientlines[i - 1].toLowerCase());
        }
        assertEquals("Number of components does not match", serverIndex.size(), clientlines.length);
    }

    public String getEval(String script) {
        Object result = ((JavascriptExecutor) getDriver()).executeScript(script);
        return (result == null ? null : result.toString());
    }
}
