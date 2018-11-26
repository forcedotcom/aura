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
package org.auraframework.impl.util;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.auraframework.builder.JavascriptCodeBuilder;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.expression.PropertyReference;
import org.auraframework.system.Location;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

public class JavascriptTokenizerTest {

    @Test
    public void testProcessDoesNothingWithSimpleCode() throws Exception {
        String code = "";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsLabelForSingleLabel() throws Exception {
        String code = "({a: function() { $A.get($Label.xxx.yyy); }})";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);

        ArgumentCaptor<PropertyReference> capture = ArgumentCaptor.forClass(PropertyReference.class);
        Mockito.verify(builder, Mockito.times(1)).addExpressionRef(capture.capture());
        PropertyReference propertyRef = capture.getValue();
        assertEquals("$Label", propertyRef.getRoot());
        assertEquals("xxx.yyy", propertyRef.getStem().toString());
        assertEquals(location, propertyRef.getLocation());
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsLabelForMultipleLabels() throws Exception {
        String code = "({a: function() { $A.get($Label.xxx.yyy); }, b: function() { $A.get($Label.yyy.zzz); }})";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);

        ArgumentCaptor<PropertyReference> capture = ArgumentCaptor.forClass(PropertyReference.class);
        Mockito.verify(builder, Mockito.times(2)).addExpressionRef(capture.capture());

        List<PropertyReference> propertyRefs = capture.getAllValues();
        assertEquals("$Label", propertyRefs.get(0).getRoot());
        assertEquals("xxx.yyy", propertyRefs.get(0).getStem().toString());
        assertEquals(location, propertyRefs.get(0).getLocation());

        assertEquals("$Label", propertyRefs.get(1).getRoot());
        assertEquals("yyy.zzz", propertyRefs.get(1).getStem().toString());
        assertEquals(location, propertyRefs.get(1).getLocation());
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessDoesNothingWithOnePartLabel() throws Exception {
        String code = "({a: function() { $A.get($Label.xxx); }})";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsDependencyForSingleDependency() throws Exception {
        String code = "({a: function() { $A.createComponent(\"markup://ui:outputText\"); }})";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);

        ArgumentCaptor<DescriptorFilter> capture = ArgumentCaptor.forClass(DescriptorFilter.class);
        Mockito.verify(builder, Mockito.times(1)).addDependency(capture.capture());
        DescriptorFilter dependency = capture.getValue();
        assertEquals("markup", dependency.getPrefixMatch().toString());
        assertEquals("ui", dependency.getNamespaceMatch().toString());
        assertEquals("outputText", dependency.getNameMatch().toString());
        assertEquals(5, dependency.getDefTypes().size());
        assertTrue(dependency.getDefTypes().contains(DefType.COMPONENT));
        assertTrue(dependency.getDefTypes().contains(DefType.LIBRARY));
        assertTrue(dependency.getDefTypes().contains(DefType.INTERFACE));
        assertTrue(dependency.getDefTypes().contains(DefType.EVENT));
        assertTrue(dependency.getDefTypes().contains(DefType.MODULE));
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsDependencyForMultipleDependencies() throws Exception {
        String code = "({a: function() { $A.createComponent(\"markup://ui:outputText\"); }, "
                      +" b: function() { $A.createComponent(\"markup://aura:inputText\"); }})";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);

        ArgumentCaptor<DescriptorFilter> capture = ArgumentCaptor.forClass(DescriptorFilter.class);
        Mockito.verify(builder, Mockito.times(2)).addDependency(capture.capture());

        capture.getValue();
        List<DescriptorFilter> dependencies = capture.getAllValues();
        assertEquals("markup", dependencies.get(0).getPrefixMatch().toString());
        assertEquals("ui", dependencies.get(0).getNamespaceMatch().toString());
        assertEquals("outputText", dependencies.get(0).getNameMatch().toString());
        assertEquals(5, dependencies.get(0).getDefTypes().size());
        assertTrue(dependencies.get(0).getDefTypes().contains(DefType.COMPONENT));
        assertTrue(dependencies.get(0).getDefTypes().contains(DefType.LIBRARY));
        assertTrue(dependencies.get(0).getDefTypes().contains(DefType.INTERFACE));
        assertTrue(dependencies.get(0).getDefTypes().contains(DefType.EVENT));
        assertTrue(dependencies.get(0).getDefTypes().contains(DefType.MODULE));

        assertEquals("markup", dependencies.get(1).getPrefixMatch().toString());
        assertEquals("aura", dependencies.get(1).getNamespaceMatch().toString());
        assertEquals("inputText", dependencies.get(1).getNameMatch().toString());
        assertEquals(5, dependencies.get(1).getDefTypes().size());
        assertTrue(dependencies.get(1).getDefTypes().contains(DefType.COMPONENT));
        assertTrue(dependencies.get(1).getDefTypes().contains(DefType.LIBRARY));
        assertTrue(dependencies.get(1).getDefTypes().contains(DefType.INTERFACE));
        assertTrue(dependencies.get(1).getDefTypes().contains(DefType.EVENT));
        assertTrue(dependencies.get(0).getDefTypes().contains(DefType.MODULE));

        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessDoesNotAddDependencyForBrokenDescriptor() throws Exception {
        String code = "({a: function() { $A.createComponent(\"markup://ui:\"); }})";
        JavascriptCodeBuilder builder = Mockito.mock(JavascriptCodeBuilder.class);
        Location location = Mockito.mock(Location.class);
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(code, location);

        tokenizer.process(builder);

        Mockito.verifyNoMoreInteractions(builder);
    }
}
