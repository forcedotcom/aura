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

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamWriter;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.java.model.JavaModelDefImpl;
import org.auraframework.impl.test.util.AuraImplUnitTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Model;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.util.json.JsonSerializationContext;

/**
 * Base class for Aura unit tests that establishes a AuraTestContext that looks up components in the
 * aura-test/components/ directory.
 */
public abstract class AuraImplTestCase extends AuraTestCase {
    private final XMLOutputFactory xmlOutputFactory = XMLOutputFactory.newInstance();

    @Inject
    protected DefinitionService definitionService;
    
    @Inject
    protected RenderingService renderingService;

    @Inject
    protected InstanceService instanceService;
    
    @Inject
    protected StringSourceLoader stringSourceLoader;
    
    private AuraTestingUtil auraTestingUtil;

    protected AuraImplUnitTestingUtil vendor;

    private boolean shouldSetupContext = true;

    protected DefDescriptor<ApplicationDef> laxSecurityApp;

    protected void setShouldSetupContext(boolean setupContext) {
        this.shouldSetupContext = setupContext;
    }
    
    @Override
    public void setUp() throws Exception {
        super.setUp();
        if (shouldSetupContext) {
            startDefaultContext();
        }
        laxSecurityApp = definitionService.getDefDescriptor("test:laxSecurity", ApplicationDef.class);
    }

	/**
	 * This method is invoked from <code>setUp()</code> and by default a context
	 * in UTEST mode is started and allows for derived test classes to override
	 * and start a context with different Mode.
	 */
	protected void startDefaultContext() {
		contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
	}

    @PostConstruct
    public void initVendor() {
        this.vendor = new AuraImplUnitTestingUtil(definitionService, instanceService);
    }

    @Override
    public void tearDown() throws Exception {
        if (auraTestingUtil != null) {
            auraTestingUtil.tearDown();
        }
        super.tearDown();
    }
    
    public AuraTestingUtil getAuraTestingUtil() {
        if (auraTestingUtil == null) {
            auraTestingUtil = new AuraTestingUtil(fileMonitor, stringSourceLoader, definitionService, configAdapter, contextService);
        }
        return auraTestingUtil;
    }
    
    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents,
            String namePrefix) {
        return getAuraTestingUtil().addSourceAutoCleanup(defClass, contents, namePrefix);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents) {
        return getAuraTestingUtil().addSourceAutoCleanup(defClass, contents);
    }

    protected void updateStringSource(DefDescriptor<?> desc, String content) {
        getAuraTestingUtil().updateSource(desc, content);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents) {
        return getAuraTestingUtil().addSourceAutoCleanup(descriptor, contents);
    }

    protected <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return getAuraTestingUtil().getSource(descriptor);
    }

    protected XMLStreamWriter createXMLStreamWriter(Writer w) throws Exception {
        return xmlOutputFactory.createXMLStreamWriter(w);
    }

    @Override
    protected JsonSerializationContext getJsonSerializationContext() {
        return contextService.getCurrentContext().getJsonSerializationContext();
    }

    /**
     * Convenience method to create an instance of a JavaModel given the qualified name.
     * 
     * @param qualifiedName For example: java://org.auraframework.components.test.java.model.TestModel
     * @return
     * @throws Exception
     */
    // TODO: W-1478576 Must consolidate such methods in a util.
    protected Model getJavaModelByQualifiedName(String qualifiedName) throws Exception {
        ModelDef javaModelDef = definitionService.getDefinition(qualifiedName, ModelDef.class);
        assertTrue(javaModelDef instanceof JavaModelDefImpl);
        Model model = instanceService.getInstance(javaModelDef);
        assertNotNull("Failed to retrieve model instance of " + qualifiedName, model);
        return model;
    }

    protected String getRenderedBaseComponent(BaseComponent<?, ?> cmp) throws Exception {
        StringWriter out = new StringWriter();
        renderingService.render(cmp, out);
        return out.toString();
    }
}
