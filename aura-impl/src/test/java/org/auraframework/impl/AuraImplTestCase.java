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
package org.auraframework.impl;

import java.io.StringWriter;
import java.io.Writer;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamWriter;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.java.model.JavaModelDef;
import org.auraframework.impl.test.util.AuraImplUnitTestingUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Model;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraTestCase;
import org.auraframework.util.json.JsonSerializationContext;

/**
 * Base class for Aura unit tests that establishes a AuraTestContext that looks up components in the
 * aura-test/components/ directory.
 */

public abstract class AuraImplTestCase extends AuraTestCase {
    private final XMLOutputFactory xmlOutputFactory = XMLOutputFactory.newInstance();

    protected final AuraImplUnitTestingUtil vendor = new AuraImplUnitTestingUtil();
    protected final DefinitionService definitionService = Aura.getDefinitionService();
    private boolean shouldSetupContext = true;

    protected final DefDescriptor<ApplicationDef> laxSecurityApp = definitionService.getDefDescriptor(
            "test:laxSecurity", ApplicationDef.class);

    public AuraImplTestCase(String name) {
        this(name, true);
    }

    public AuraImplTestCase(String name, boolean setupContext) {
        super(name);
        shouldSetupContext = setupContext;
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        if (shouldSetupContext) {
            Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        }
    }

    protected FakeRegistry createFakeRegistry() {
        return new FakeRegistry();
    }

    protected XMLStreamWriter createXMLStreamWriter(Writer w) throws Exception {
        return xmlOutputFactory.createXMLStreamWriter(w);
    }

    @Override
    protected JsonSerializationContext getJsonSerializationContext() {
        return Aura.getContextService().getCurrentContext().getJsonSerializationContext();
    }

    /**
     * Convenience method to create an instance of a JavaModel given the qualified name.
     * 
     * @param qualifiedName For example: java://org.auraframework.impl.java.model.TestModel
     * @return
     * @throws Exception
     */
    // TODO: W-1478576 Must consolidate such methods in a util.
    protected Model getJavaModelByQualifiedName(String qualifiedName) throws Exception {
        ModelDef javaModelDef = definitionService.getDefinition(qualifiedName, ModelDef.class);
        assertTrue(javaModelDef instanceof JavaModelDef);
        Model model = javaModelDef.newInstance();
        assertNotNull("Failed to retrieve model instance of " + qualifiedName, model);
        return model;
    }

    protected String getRenderedBaseComponent(BaseComponent<?, ?> cmp) throws Exception {
        StringWriter out = new StringWriter();
        Aura.getRenderingService().render(cmp, out);
        return out.toString();
    }
}
