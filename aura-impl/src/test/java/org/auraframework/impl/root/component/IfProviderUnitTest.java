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

import org.auraframework.Aura;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.util.ArrayList;
import java.util.Arrays;

import static org.powermock.api.mockito.PowerMockito.mock;

@RunWith(PowerMockRunner.class)
@PrepareForTest(Aura.class)
public class IfProviderUnitTest {

    private AttributeSet attributeSet;
    private IfProvider ifProvider;

    @SuppressWarnings("unchecked")
	@Before
    public void setup() {
        ifProvider = new IfProvider();
        ContextService mockContextService = mock(ContextService.class);

        AuraContext mockContext = mock(AuraContext.class);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockContext.getInstanceStack()).thenReturn(mock(InstanceStack.class));

        attributeSet = mock(AttributeSet.class);
        @SuppressWarnings("rawtypes")
		BaseComponent component = mock(BaseComponent.class);
        Mockito.when(component.getAttributes()).thenReturn(attributeSet);
        Mockito.when(mockContext.getCurrentComponent()).thenReturn(component);

        ifProvider.contextService = mockContextService;
    }

    @Test
    public void testIfProviderTruthyBoolean() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(true);

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyBooleanIsFalse() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(false);

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyNumberZero() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(0);

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyNumberPositive() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(42);

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyNumberNegative() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(-100.5);

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyString() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn("something");

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyStringEmpty() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn("");

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyList() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(Arrays.asList("one", "two"));

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyListEmpty() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(new ArrayList<>());

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyNull() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(null);

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(1)).getValue(Matchers.eq("else"));
    }

    @Test
    public void testIfProviderTruthyObject() throws Exception {
        Mockito.when(attributeSet.getValue(Matchers.eq("isTrue"))).thenReturn(new IfProvider());

        ifProvider.provide();
        Mockito.verify(attributeSet, Mockito.times(2)).getValue(Matchers.eq("body"));
        Mockito.verify(attributeSet, Mockito.times(0)).getValue(Matchers.eq("else"));
    }
}
