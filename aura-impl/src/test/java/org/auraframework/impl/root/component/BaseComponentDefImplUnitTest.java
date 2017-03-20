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
package org.auraframework.impl.root.component;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition.SupportLevel;
import org.auraframework.def.StyleDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.RootDefinitionImplUnitTest;
import org.auraframework.impl.root.component.BaseComponentDefImpl.Builder;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public abstract class BaseComponentDefImplUnitTest<I extends BaseComponentDefImpl<D>, D extends BaseComponentDef, B extends Builder<D>>
        extends RootDefinitionImplUnitTest<I, D, B> {
    @Inject
    protected DefinitionService definitionService;

    @Inject
    private ContextService contextService;

    protected boolean isAbstract;
    protected boolean isExtensible;
    protected boolean isTemplate;
    @Mock
    protected DefDescriptor<ModelDef> modelDefDescriptor;
    @Mock
    protected DefDescriptor<D> extendsDescriptor;
    @Mock
    protected DefDescriptor<ComponentDef> templateDefDescriptor;
    @Mock
    protected ComponentDef templateDef;
    @Mock
    protected DefDescriptor<StyleDef> styleDescriptor;
    protected List<DefDescriptor<RendererDef>> rendererDescriptors;
    protected List<DefDescriptor<HelperDef>> helperDescriptors;
    protected Set<DefDescriptor<InterfaceDef>> interfaces;
    protected List<DefDescriptor<ControllerDef>> controllerDescriptors;
    protected Map<String, RegisterEventDef> events;
    protected List<EventHandlerDef> eventHandlers;
    protected List<LibraryDefRef> imports;
    protected List<AttributeDefRef> facets;
    protected Set<PropertyReference> expressionRefs;
    protected String render;
    protected List<DependencyDef> dependencies;
    @Mock
    protected DefDescriptor<ControllerDef> mockControllerDesc;
    protected ControllerDef mockControllerDef;

    protected DefinitionAccess GLOBAL_ACCESS;
    protected DefinitionAccess PRIVATE_ACCESS;

    @Inject
    private void setupDefinitionAccess(DefinitionParserAdapter definitionParserAdapter) {
        try {
            GLOBAL_ACCESS = definitionParserAdapter.parseAccess(null, "GLOBAL");
        } catch (InvalidAccessValueException x) {
            throw new AuraRuntimeException(x);
        }
        try {
            PRIVATE_ACCESS = definitionParserAdapter.parseAccess(null, "PRIVATE");
        } catch (InvalidAccessValueException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @Test
    public void testAppendDependenciesDefaultValue() throws Exception {
        Set<DefDescriptor<?>> dependencies = Mockito.spy(Sets.<DefDescriptor<?>> newHashSet());
        buildDefinition().appendDependencies(dependencies);
    }

    @Override
    @Test
    public void testValidateReferences() throws Exception {
        setupValidateReferences();
        this.extendsDescriptor = null;
        this.modelDefDescriptor = null;
        setupTemplate(true);
        buildDefinition().validateReferences();
    }
    
    //test for W-2798390
    @SuppressWarnings("unchecked")
    @Override
    @Test
    public void testValidateDefinition() throws Exception {
        //set up controllerDescriptors here to make sure we don't check it when validating definition
        this.controllerDescriptors = new ArrayList<>();
        this.mockControllerDef = Mockito.mock(ControllerDef.class);
        Mockito.doReturn("{}").when(this.mockControllerDef).getCode();
        this.mockControllerDesc = Mockito.mock(DefDescriptor.class);
        Mockito.doReturn(this.mockControllerDef).when(this.mockControllerDesc).getDef();
        this.controllerDescriptors.add(mockControllerDesc);
        this.modelDefDescriptor = Mockito.mock(DefDescriptor.class);
        testAuraContext = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        
        setupTemplate(true);
        D def = buildDefinition();
        
        // verify that controllerDef was not called while building the definition
        Mockito.verify(this.mockControllerDesc, Mockito.times(0)).getDef();

        def.validateDefinition();

        //verify we didn't touch controllerDef during validateDefinition
        Mockito.verify(this.mockControllerDesc, Mockito.times(0)).getDef();
        //verify we didn't touch modelDef during build and validateDefinition, that's validateReference's job       
        Mockito.verify(this.modelDefDescriptor, Mockito.times(0)).getDef();
    }
    
    @Test
    public void testValidateReferencesExpressionToOwnPrivateAttribute() throws Exception {
        setupValidateReferences();

        DefDescriptor<AttributeDef> attrDesc = definitionService.getDefDescriptor("privateAttribute", AttributeDef.class);
        AttributeDef attrDef = Mockito.mock(AttributeDef.class);
        Mockito.doReturn(attrDesc).when(attrDef).getDescriptor();
        Mockito.doReturn(PRIVATE_ACCESS).when(attrDef).getAccess();

        @SuppressWarnings("unchecked")
        D parentDef = (D) Mockito.mock(getBuilder().getClass().getDeclaringClass());
        Mockito.doReturn(this.extendsDescriptor).when(parentDef).getDescriptor();
        Mockito.doReturn(ImmutableMap.of()).when(parentDef).getAttributeDefs();
        Mockito.doReturn(true).when(parentDef).isExtensible();
        Mockito.doReturn(SupportLevel.GA).when(parentDef).getSupport();
        Mockito.doReturn(GLOBAL_ACCESS).when(parentDef).getAccess();
        Mockito.doReturn(parentDef).when(this.extendsDescriptor).getDef();
        Mockito.doReturn(DefType.COMPONENT).when(this.extendsDescriptor).getDefType();

        this.expressionRefs = Sets.newHashSet();
        this.expressionRefs.add(new PropertyReferenceImpl("v.privateAttribute", null));
        this.attributeDefs = ImmutableMap.of(attrDesc, attrDef);
        setupTemplate(true);

        //FIXME:
        //buildDefinition().validateReferences();
    }


    @Test
    public void testTemplateMustBeTemplate() throws Exception {
        setupValidateReferences();
        this.extendsDescriptor = null;
        this.modelDefDescriptor = null;
        setupTemplate(false);
        Throwable expected = null;
        try {
            buildDefinition().validateReferences();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull("should have gotten an exception when using a non-template as template", expected);
        assertExceptionMessageStartsWith(expected, InvalidDefinitionException.class,
                String.format("Template %s must be marked as a template", templateDefDescriptor));
        
    }

    @Override
    protected void setupValidateReferences() throws Exception {
        this.interfaces = Sets.newHashSet();
        this.interfaces.add(BaseComponentDefImpl.ROOT_MARKER);
        testAuraContext = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    }

    @Override
    protected D buildDefinition(B builder) throws Exception {
        builder.setAbstract(this.isAbstract);
        builder.setExtensible(this.isExtensible);
        builder.isTemplate = this.isTemplate;
        builder.modelDefDescriptor = this.modelDefDescriptor;
        builder.extendsDescriptor = this.extendsDescriptor;
        builder.templateDefDescriptor = this.templateDefDescriptor;
        //builder.styleDescriptor = this.styleDescriptor;
        builder.rendererDescriptors = this.rendererDescriptors;
        builder.helperDescriptors = this.helperDescriptors;
        builder.interfaces = this.interfaces;
        builder.controllerDescriptors = this.controllerDescriptors;
        builder.events = this.events;
        builder.eventHandlers = this.eventHandlers;
        if (this.imports != null) {
            for (LibraryDefRef importLibrary : this.imports) {
                builder.addLibraryImport(importLibrary);
            }
        }
        builder.facets = this.facets;
        builder.expressionRefs = this.expressionRefs;
        builder.render = this.render;
        builder.dependencies = this.dependencies;
        return super.buildDefinition(builder);
    }

    protected void setupTemplate(boolean isTemplate) throws QuickFixException {
        Mockito.doReturn(this.templateDef).when(this.templateDefDescriptor).getDef();
        Mockito.doReturn(this.templateDefDescriptor).when(this.templateDef).getDescriptor();
        Mockito.doReturn(isTemplate).when(this.templateDef).isTemplate();
        Mockito.doReturn(GLOBAL_ACCESS).when(this.templateDef).getAccess();
        contextService.getCurrentContext().addDynamicDef(templateDef);
    }
}
