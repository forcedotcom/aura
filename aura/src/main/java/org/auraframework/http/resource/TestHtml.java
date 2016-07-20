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

package org.auraframework.http.resource;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.service.ContextService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class TestHtml extends TestResource {
	@Inject
	private ContextService contextService;
    
	@Inject
    private SerializationService serializationService;

    public TestHtml() {
        super("test.html", Format.HTML);
    }
    
    @Override
    void write(HttpServletResponse response, TestSuiteDef testSuite, String testName) throws IOException, QuickFixException {
        TestCaseDef testCase = getTestCase(testSuite, testName);
        
        String targetDescName = testSuite.getDescriptor().getDescriptorName().replace('.', ':');
        BaseComponentDef targetDef = (BaseComponentDef)definitionService.getDefinition(targetDescName,
                DefType.COMPONENT, DefType.APPLICATION);
        Map<String, Object> targetAttributes = testCase.getAttributeValues();
        
        AuraContext context = contextService.getCurrentContext();
        String contextPath = context.getContextPath();
        String fwUid = context.getFrameworkUID();

        Writer writer = response.getWriter();
        renderBaseComponentDef(targetDef, targetAttributes, writer);
        writer.append(String.format("<script src='%s/auraFW/resources/%s/test/runner.js' defer></script>", contextPath, fwUid));
        writer.append(String.format("<script src='test.js?desc=%s&test=%s&ts=%s' defer></script>", targetDescName, testName,
                System.currentTimeMillis()));
    }
    
    @SuppressWarnings("unchecked")
    private <D extends BaseComponentDef> void renderBaseComponentDef(D def, Map<String, Object> attributes,
            Appendable appendable) throws QuickFixException, IOException {

        DefDescriptor<? extends BaseComponentDef> descriptor = def.getDescriptor();
        Class<D> defClass = (Class<D>)descriptor.getDefType().getPrimaryInterface();

        AuraContext originalContext = contextService.getCurrentContext();
        AuraContext context = contextService.pushSystemContext();
        try {
            context.setApplicationDescriptor(descriptor);
            context.setFrameworkUID(originalContext.getFrameworkUID());

            serializationService.write(def, attributes, defClass, appendable, Format.HTML.toString());
        } finally {
            contextService.popSystemContext();
        }
    }

}