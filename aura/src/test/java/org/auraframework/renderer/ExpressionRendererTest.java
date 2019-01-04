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
package org.auraframework.renderer;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.util.List;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Instance;
import org.auraframework.instance.Wrapper;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.common.collect.ImmutableList;

/**
 * Unit test for the {@link ExpressionRenderer} class.
 */
@RunWith(MockitoJUnitRunner.class)
public class ExpressionRendererTest {

    private ExpressionRenderer expressionRendererBeingTested;
    
    @Mock
    RenderingService renderingService;
    
    @Mock
    InstanceService instanceService;
    
    @Mock
    DefinitionService definitionService;
    
    @Before
    public void beforeEachTest() {
        expressionRendererBeingTested = new ExpressionRenderer(renderingService, instanceService, definitionService);
    }
    
    /**
     * Test method for {@link ExpressionRenderer#render(BaseComponent, RenderContext)}.
     *
     * @throws IOException Can be thrown by the method under test when something unexpected occurs.
     * @throws QuickFixException Can be thrown by the method under test when something unexpected occurs.
     */
    @Test
    public final void testRenderValueAsWrapperString() throws QuickFixException, IOException {
        
        final BaseComponentDef def = mock(BaseComponentDef.class);
        doReturn(FALSE).when(def).isTemplate();
        
        final DefDescriptor<Definition> defDescriptor = mock(DefDescriptor.class);
        doReturn(def).when(definitionService).getDefinition((DefDescriptor<Definition>)Matchers.any(DefDescriptor.class));
        
        final BaseComponent<?, ?> valueProvider = mock(BaseComponent.class);
        doReturn(defDescriptor).when(valueProvider).getDescriptor();
        
        final Wrapper wrapper = mock(Wrapper.class);
        doReturn("<div>&</div>").when(wrapper).unwrap();
        
        final AttributeSet attributeSet = mock(AttributeSet.class);
        doReturn(wrapper).when(attributeSet).getValue(Matchers.eq("value"));
        doReturn(valueProvider).when(attributeSet).getValueProvider();
        
        final BaseComponent<?, ?> component = mock(BaseComponent.class);
        doReturn(attributeSet).when(component).getAttributes();
        
        final Appendable appendable = mock(Appendable.class);
        doReturn(appendable).when(appendable).append(Matchers.anyString());
        
        final RenderContext rc = mock(RenderContext.class);
        doReturn(appendable).when(rc).getCurrent();
        
        // Execute
        expressionRendererBeingTested.render(component, rc);
        
        // Verify/Assert
        Mockito.verify(appendable, Mockito.only()).append(Matchers.eq("&lt;div&gt;&amp;&lt;/div&gt;"));
        Mockito.verify(definitionService).getDefinition(Matchers.same(defDescriptor));
        Mockito.verifyNoMoreInteractions(instanceService, renderingService, definitionService);
    }
    
    /**
     * Test method for {@link ExpressionRenderer#render(BaseComponent, RenderContext)}.
     *
     * @throws IOException Can be thrown by the method under test when something unexpected occurs.
     * @throws QuickFixException Can be thrown by the method under test when something unexpected occurs.
     */
    @Test
    public final void testRenderValueAsWrapperStringTemplate() throws QuickFixException, IOException {
        
        final BaseComponentDef def = mock(BaseComponentDef.class);
        doReturn(TRUE).when(def).isTemplate();
        
        final DefDescriptor<Definition> defDescriptor = mock(DefDescriptor.class);
        doReturn(def).when(definitionService).getDefinition((DefDescriptor<Definition>)Matchers.any(DefDescriptor.class));
        
        final BaseComponent<?, ?> valueProvider = mock(BaseComponent.class);
        doReturn(defDescriptor).when(valueProvider).getDescriptor();
        
        final Wrapper wrapper = mock(Wrapper.class);
        doReturn("<div>&</div>").when(wrapper).unwrap();
        
        final AttributeSet attributeSet = mock(AttributeSet.class);
        doReturn(wrapper).when(attributeSet).getValue(Matchers.eq("value"));
        doReturn(valueProvider).when(attributeSet).getValueProvider();
        
        final BaseComponent<?, ?> component = mock(BaseComponent.class);
        doReturn(attributeSet).when(component).getAttributes();
        
        final Appendable appendable = mock(Appendable.class);
        doReturn(appendable).when(appendable).append(Matchers.anyString());
        
        final RenderContext rc = mock(RenderContext.class);
        doReturn(appendable).when(rc).getCurrent();
        
        // Execute
        expressionRendererBeingTested.render(component, rc);
        
        // Verify/Assert
        Mockito.verify(appendable, Mockito.only()).append(Matchers.eq("<div>&</div>"));
        Mockito.verifyNoMoreInteractions(instanceService, renderingService);
    }
    
    /**
     * Test method for {@link ExpressionRenderer#render(BaseComponent, RenderContext)}.
     *
     * @throws IOException Can be thrown by the method under test when something unexpected occurs.
     * @throws QuickFixException Can be thrown by the method under test when something unexpected occurs.
     */
    @Test
    public final void testRenderValueAsList() throws QuickFixException, IOException {
        
        final ComponentDefRef kid2Inner = mock(ComponentDefRef.class);
        doReturn(DefType.COMPONENT).when(kid2Inner).type();
        
        final DefinitionReference kid2 = mock(DefinitionReference.class);
        doReturn(kid2Inner).when(kid2).get();
        
        final DefinitionReference kid3Inner = mock(DefinitionReference.class);
        doReturn(DefType.INCLUDE_REF).when(kid3Inner).type();
        
        final DefinitionReference kid3 = mock(DefinitionReference.class);
        doReturn(kid3Inner).when(kid3).get();
        
        final BaseComponent<?, ?> kid1 = mock(BaseComponent.class);
        final List<Object> valueList = ImmutableList.of(kid1, kid2, kid3, /* Item does not match any if */ mock(DefRegistry.class));
        
        final AttributeSet attributeSet = mock(AttributeSet.class);
        doReturn(valueList).when(attributeSet).getValue(Matchers.eq("value"));
        
        final BaseComponent<?, ?> component = mock(BaseComponent.class);
        doReturn(attributeSet).when(component).getAttributes();
        
        final RenderContext rc = mock(RenderContext.class);
        
        final BaseComponent<?, ?> cmp = mock(BaseComponent.class);
        doReturn(cmp).when(instanceService).getInstance(Matchers.any(ComponentDefRef.class), Matchers.any(BaseComponent.class));
        doNothing().when(renderingService).render(Matchers.any(BaseComponent.class), Matchers.any(RenderContext.class));
        
        // Execute
        expressionRendererBeingTested.render(component, rc);
        
        // Verify/Assert
        Mockito.verify(renderingService).render(Matchers.same(kid1), Matchers.same(rc));
        Mockito.verify(renderingService).render(Matchers.same(cmp), Matchers.same(rc));
        Mockito.verify(instanceService, Mockito.only()).getInstance(Matchers.same(kid2Inner), Matchers.same(component));
        Mockito.verifyNoMoreInteractions(renderingService, definitionService);
    }
    
    /**
     * Test method for {@link ExpressionRenderer#render(BaseComponent, RenderContext)}.
     *
     * @throws IOException Can be thrown by the method under test when something unexpected occurs.
     * @throws QuickFixException Can be thrown by the method under test when something unexpected occurs.
     */
    @Test
    public final void testRenderValueAsNotNull() throws QuickFixException, IOException {
        
        final Instance<?> instance = mock(Instance.class);
        doReturn("Detlef Schrempf").when(instance).toString();
        
        final AttributeSet attributeSet = mock(AttributeSet.class);
        doReturn(instance).when(attributeSet).getValue(Matchers.eq("value"));
        
        final BaseComponent<?, ?> component = mock(BaseComponent.class);
        doReturn(attributeSet).when(component).getAttributes();
        
        final Appendable appendable = mock(Appendable.class);
        doReturn(appendable).when(appendable).append(Matchers.anyString());
        
        final RenderContext rc = mock(RenderContext.class);
        doReturn(appendable).when(rc).getCurrent();
        
        // Execute
        expressionRendererBeingTested.render(component, rc);
        
        // Verify/Assert
        Mockito.verify(appendable, Mockito.only()).append(Matchers.eq("Detlef Schrempf"));
        Mockito.verifyNoMoreInteractions(instanceService, renderingService, definitionService);
    }
    
    /**
     * Test method for {@link ExpressionRenderer#render(BaseComponent, RenderContext)}.
     *
     * @throws IOException Can be thrown by the method under test when something unexpected occurs.
     * @throws QuickFixException Can be thrown by the method under test when something unexpected occurs.
     */
    @Test
    public final void testRenderValueAsNull() throws QuickFixException, IOException {
        
        final AttributeSet attributeSet = mock(AttributeSet.class);
        doReturn(null).when(attributeSet).getValue(Matchers.eq("value"));
        
        final BaseComponent<?, ?> component = mock(BaseComponent.class);
        doReturn(attributeSet).when(component).getAttributes();
        
        final RenderContext rc = mock(RenderContext.class);
        
        // Execute
        expressionRendererBeingTested.render(component, rc);
        
        // Verify/Assert
        Mockito.verifyNoMoreInteractions(rc, instanceService, renderingService, definitionService);
    }
}
