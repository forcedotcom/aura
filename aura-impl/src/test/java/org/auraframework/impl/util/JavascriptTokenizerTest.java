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

import java.util.List;

import org.auraframework.builder.JavascriptCodeBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.system.Location;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;

public class JavascriptTokenizerTest extends UnitTestCase {
    @Mock
    JavascriptCodeBuilder builder;

    @Mock
    Location location;

    @Mock
    DefDescriptor<RootDefinition> parentDescriptor;

    @Test
    public void testProcessDoesNothingWithSimpleCode() throws Exception {
        String code = "";
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

        tokenizer.process(builder);
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsLabelForSingleLabel() throws Exception {
        String code = "({a: function() { $A.get($Label.xxx.yyy); }})";
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

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
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

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
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

        tokenizer.process(builder);
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsDependencyForSingleDependency() throws Exception {
        String code = "({a: function() { $A.createComponent(\"markup://ui:outputText\"); }})";
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

        tokenizer.process(builder);

        ArgumentCaptor<DependencyDef> capture = ArgumentCaptor.forClass(DependencyDef.class);
        Mockito.verify(builder, Mockito.times(1)).addDependency(capture.capture());
        DependencyDef dependency = capture.getValue();
        assertEquals(location, dependency.getLocation());
        assertEquals("markup", dependency.getDependency().getPrefixMatch().toString());
        assertEquals("ui", dependency.getDependency().getNamespaceMatch().toString());
        assertEquals("outputText", dependency.getDependency().getNameMatch().toString());
        assertEquals(4, dependency.getDependency().getDefTypes().size());
        assertTrue(dependency.getDependency().getDefTypes().contains(DefType.COMPONENT));
        assertTrue(dependency.getDependency().getDefTypes().contains(DefType.LIBRARY));
        assertTrue(dependency.getDependency().getDefTypes().contains(DefType.INTERFACE));
        assertTrue(dependency.getDependency().getDefTypes().contains(DefType.EVENT));
        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessAddsDependencyForMultipleDependencies() throws Exception {
        String code = "({a: function() { $A.createComponent(\"markup://ui:outputText\"); }, "
                      +" b: function() { $A.createComponent(\"markup://aura:inputText\"); }})";
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

        tokenizer.process(builder);

        ArgumentCaptor<DependencyDef> capture = ArgumentCaptor.forClass(DependencyDef.class);
        Mockito.verify(builder, Mockito.times(2)).addDependency(capture.capture());

        capture.getValue();
        List<DependencyDef> dependencies = capture.getAllValues();
        assertEquals(location, dependencies.get(0).getLocation());
        assertEquals("markup", dependencies.get(0).getDependency().getPrefixMatch().toString());
        assertEquals("ui", dependencies.get(0).getDependency().getNamespaceMatch().toString());
        assertEquals("outputText", dependencies.get(0).getDependency().getNameMatch().toString());
        assertEquals(4, dependencies.get(0).getDependency().getDefTypes().size());
        assertTrue(dependencies.get(0).getDependency().getDefTypes().contains(DefType.COMPONENT));
        assertTrue(dependencies.get(0).getDependency().getDefTypes().contains(DefType.LIBRARY));
        assertTrue(dependencies.get(0).getDependency().getDefTypes().contains(DefType.INTERFACE));
        assertTrue(dependencies.get(0).getDependency().getDefTypes().contains(DefType.EVENT));

        assertEquals(location, dependencies.get(1).getLocation());
        assertEquals("markup", dependencies.get(1).getDependency().getPrefixMatch().toString());
        assertEquals("aura", dependencies.get(1).getDependency().getNamespaceMatch().toString());
        assertEquals("inputText", dependencies.get(1).getDependency().getNameMatch().toString());
        assertEquals(4, dependencies.get(1).getDependency().getDefTypes().size());
        assertTrue(dependencies.get(1).getDependency().getDefTypes().contains(DefType.COMPONENT));
        assertTrue(dependencies.get(1).getDependency().getDefTypes().contains(DefType.LIBRARY));
        assertTrue(dependencies.get(1).getDependency().getDefTypes().contains(DefType.INTERFACE));
        assertTrue(dependencies.get(1).getDependency().getDefTypes().contains(DefType.EVENT));

        Mockito.verifyNoMoreInteractions(builder);
    }

    @Test
    public void testProcessDoesNotAddDependencyForBrokenDescriptor() throws Exception {
        String code = "({a: function() { $A.createComponent(\"markup://ui:\"); }})";
        JavascriptTokenizer tokenizer = new JavascriptTokenizer(parentDescriptor, code, location);

        tokenizer.process(builder);

        Mockito.verifyNoMoreInteractions(builder);
    }
}
