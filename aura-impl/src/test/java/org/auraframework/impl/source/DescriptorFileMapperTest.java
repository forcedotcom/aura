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
package org.auraframework.impl.source;

import java.util.List;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.junit.Test;

import com.google.common.collect.Sets;

public class DescriptorFileMapperTest extends AuraImplTestCase {

    @Test
    public void testComponentDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.cmp");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.COMPONENT, desc.getDefType());
    }
    
    @Test
    public void testComponentDescriptorDifferentSeparator() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("@foo@bar@namespace@name@name.cmp", "@");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.COMPONENT, desc.getDefType());
    }

    @Test
    public void testApplicationDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.app");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.APPLICATION, desc.getDefType());
    }

    @Test
    public void testApplicationDescriptorDifferentSeparator() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("@foo@bar@namespace@name@name.app", "@");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.APPLICATION, desc.getDefType());
    }

    @Test
    public void testEventDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.evt");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.EVENT, desc.getDefType());
    }

    @Test
    public void testInterfaceDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.intf");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.INTERFACE, desc.getDefType());
    }

    @Test
    public void testLibraryDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.lib");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.LIBRARY, desc.getDefType());
    }

    @Test
    public void testTokensDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.tokens");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.TOKENS, desc.getDefType());
    }

    @Test
    public void testAuraDocDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.auradoc");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.DOCUMENTATION, desc.getDefType());
    }

    @Test
    public void testDesignDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.design");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.DESIGN, desc.getDefType());
    }

    @Test
    public void testSVGDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.svg");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.SVG, desc.getDefType());
    }

    @Test
    public void testFlavorsDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.flavors");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.FLAVORS, desc.getDefType());
    }

    @Test
    public void testJavascriptControllerDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameController.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.CONTROLLER, desc.getDefType());
    }

    @Test
    public void testJavascriptHelperDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameHelper.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.HELPER, desc.getDefType());
    }

    @Test
    public void testJavascriptRendererDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameRenderer.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.RENDERER, desc.getDefType());
    }

    @Test
    public void testJavascriptProviderDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameProvider.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.PROVIDER, desc.getDefType());
    }

    @Test
    public void testJavascriptTestDescriptor() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameTest.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.TESTSUITE, desc.getDefType());
    }

    @Test
    public void testJavascriptInclude() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/fiddledee.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("fiddledee", desc.getName());
        assertEquals(DefType.INCLUDE, desc.getDefType());
    }

    @Test
    public void testJavascriptIncludeSameName() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.js");
        assertNotNull(desc);
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.INCLUDE, desc.getDefType());
    }

    @Test
    public void testJavascriptIncludeSameNameExtended() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameFiddledee.js");
        assertNotNull(desc);
        assertEquals(DefDescriptor.JAVASCRIPT_PREFIX, desc.getPrefix());
        assertEquals("namespace", desc.getNamespace());
        assertEquals("nameFiddledee", desc.getName());
        assertEquals(DefType.INCLUDE, desc.getDefType());
    }

    @Test
    public void testStyle() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/name.css");
        assertNotNull(desc);
        assertEquals(DefDescriptor.CSS_PREFIX, desc.getPrefix());
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.STYLE, desc.getDefType());
    }

    @Test
    public void testFlavoredCss() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameFlavors.css");
        assertNotNull(desc);
        assertEquals(DefDescriptor.CSS_PREFIX, desc.getPrefix());
        assertEquals("namespace", desc.getNamespace());
        assertEquals("name", desc.getName());
        assertEquals(DefType.FLAVORED_STYLE, desc.getDefType());
    }

    @Test
    public void testFlavoredExtraCss() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/boggle.css");
        assertNotNull(desc);
        assertEquals(DefDescriptor.CUSTOM_FLAVOR_PREFIX, desc.getPrefix());
        assertEquals("namespace", desc.getNamespace());
        assertEquals("boggle", desc.getName());
        assertEquals(DefType.FLAVORED_STYLE, desc.getDefType());
    }

    @Test
    public void testFlavoredExtraCssSameName() {
        DefDescriptor<?> desc = DescriptorFileMapper.getDescriptor("/foo/bar/namespace/name/nameBoggle.css");
        assertNotNull(desc);
        assertEquals(DefDescriptor.CUSTOM_FLAVOR_PREFIX, desc.getPrefix());
        assertEquals("namespace", desc.getNamespace());
        assertEquals("nameBoggle", desc.getName());
        assertEquals(DefType.FLAVORED_STYLE, desc.getDefType());
    }

    @Test
    public void testAllCSS() {
        List<DefDescriptor<?>> descs = DescriptorFileMapper.getAllDescriptors("/foo/bar/namespace/name/name.css");
        Set<String> prefixes = Sets.newHashSet();
        assertNotNull(descs);
        assertEquals("must get two descriptors", 2, descs.size());
        for (DefDescriptor<?> desc : descs) {
            assertEquals("namespace", desc.getNamespace());
            assertEquals("name", desc.getName());
            assertEquals(DefType.STYLE, desc.getDefType());
            prefixes.add(desc.getPrefix());
        }
        assertTrue("Must have a css prefix", prefixes.contains(DefDescriptor.CSS_PREFIX));
        assertTrue("Must have a templateCss prefix", prefixes.contains("templateCss"));
    }
}
