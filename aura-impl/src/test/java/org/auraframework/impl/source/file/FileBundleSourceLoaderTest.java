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
package org.auraframework.impl.source.file;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.IOUtil;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.mockito.Matchers;
import org.mockito.Mockito;

import com.google.common.collect.Sets;

public class FileBundleSourceLoaderTest {
    @Rule
    public ExpectedException thrown = ExpectedException.none();
    
    private File workingDirectory;
    
    @Test
    public void testConstructor_WithNonExistentFile_Throws() {
        File testFile = new File("this_probably_doesnt_exist");
        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage("Base directory " + testFile.getAbsolutePath() + " does not exist");
        
        new FileBundleSourceLoader(testFile, null, null);
    }

    @Test
    public void testConstructor_WithNullFile_Throws() {
        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage("Base directory null does not exist");

        new FileBundleSourceLoader((File)null, null, null);
    }

    @Test
    public void testConstructor_WithFileMonitor_SubscribesToChangeNotifications() {
        File tmpDir = new File(IOUtil.newTempDir("fileSourceLoaderTest"));
        FileMonitor fileMonitor = Mockito.mock(FileMonitor.class);
        new FileBundleSourceLoader(tmpDir, fileMonitor, null);
        Mockito.verify(fileMonitor, Mockito.times(1)).subscribeToChangeNotification(Matchers.any());
    }
    
    @Test
    public void testGetBundle_WithNullDescriptor_ReturnsNull() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        Assert.assertNull(loader.getBundle(null));
    }
    
    @Test
    public void testGetBundle_WithNamespaceNotFound_ReturnsNull() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "notfound", "component", ComponentDef.class);
        Assert.assertNull(loader.getBundle(descriptor));
    }
    
    @Test
    public void testGetBundle_WithNameNotFound_ReturnsNull() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "notfound", ComponentDef.class);
        Assert.assertNull(loader.getBundle(descriptor));
    }
    
    @Test
    public void testGetBundle_WithMatchingDescriptor() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        makeFile("test", "otherComponent", ".cmp", "<aura:component/>");
        makeFile("otherNamespace", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "component", ComponentDef.class);
        BundleSource<?> bundleSource = loader.getBundle(descriptor);
        Assert.assertEquals("markup://test:component", bundleSource.getDescriptor().getQualifiedName());
        Map<DefDescriptor<?>, Source<?>> bundleParts = bundleSource.getBundledParts();
        Assert.assertEquals(1, bundleParts.size());
        Assert.assertEquals("<aura:component/>", ((TextSource<?>)bundleParts.values().iterator().next()).getContents());
    }
    
    @Test
    public void testGetSource_WithNullDescriptor_ReturnsNull() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        Assert.assertNull(loader.getBundle(null));
    }
    
    @Test
    public void testGetSource_WithNamespaceNotFound_ReturnsNull() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "notfound", "component", ComponentDef.class);
        Assert.assertNull(loader.getSource(descriptor));
    }
    
    @Test
    public void testGetSource_WithNameNotFound_ReturnsNull() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "notfound", ComponentDef.class);
        Assert.assertNull(loader.getSource(descriptor));
    }

    @Test
    public void testGetSource_WithMatchingDescriptor() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "component", ComponentDef.class);
        BundleSource<?> bundleSource = (BundleSource<?>) loader.getSource(descriptor);
        Assert.assertEquals("markup://test:component", bundleSource.getDescriptor().getQualifiedName());
        Map<DefDescriptor<?>, Source<?>> bundleParts = bundleSource.getBundledParts();
        Assert.assertEquals(1, bundleParts.size());
        Assert.assertEquals("<aura:component/>", ((TextSource<?>)bundleParts.values().iterator().next()).getContents());
    }
    
    @Test
    public void testGetNamespaces_Empty() throws Exception {
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        Set<String> namespaces = loader.getNamespaces();
        Assert.assertEquals(0, namespaces.size());
    }

    @Test
    public void testGetNamespaces_WithMultipleBuilders() throws Exception {
        makeFile("cmp1", "component", ".cmp", "<aura:component/>");
        makeFile("cmp2", "component", ".cmp", "<aura:component/>");
        makeFile("intf1", "interface", ".intf", "<aura:interface/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(), new InterfaceDefFileBundleBuilder(), new FlavorBundleFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        Set<String> namespaces = loader.getNamespaces();
        Assert.assertEquals(3, namespaces.size());
        Assert.assertTrue(namespaces.contains("cmp1"));
        Assert.assertTrue(namespaces.contains("cmp2"));
        Assert.assertTrue(namespaces.contains("intf1"));
    }

    @Test
    public void testFind_WithNamespaceNotFound_ReturnsEmpty() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://notFound:component");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        Assert.assertEquals(0, descriptors.size());
    }
    
    @Test
    public void testFind_WithNameNotFound_ReturnsEmpty() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://test:notFound");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        Assert.assertEquals(0, descriptors.size());
    }
    
    @Test
    public void testFind_WithConstant_MatchesSingle() throws Exception {
        makeFile("test", "component", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://test:component");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        Assert.assertEquals(1, descriptors.size());
    }
    
    @Test
    public void testFind_WithNameGlob_MatchesMultiple() throws Exception {
        makeFile("test", "matchingComponent", ".cmp", "<aura:component/>");
        makeFile("test", "matchingEvent", ".evt", "<aura:event/>");
        makeFile("test", "matchingInterface", ".intf", "<aura:interface/>");
        makeFile("test", "otherComponent", ".cmp", "<aura:component/>");
        makeFile("test", "otherEvent", ".evt", "<aura:event/>");
        makeFile("test", "otherInterface", ".intf", "<aura:interface/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(), new InterfaceDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://test:matching*");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        Assert.assertEquals(3, descriptors.size());
        Assert.assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingComponent", ComponentDef.class)));
        Assert.assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingEvent", EventDef.class)));
        Assert.assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingInterface", InterfaceDef.class)));
    }
    
    @Test
    public void testFind_WithNamespaceGlob_MatchesMultiple() throws Exception {
        makeFile("matchingNamespace1", "component", ".cmp", "<aura:component/>");
        makeFile("matchingNamespace2", "event", ".evt", "<aura:event/>");
        makeFile("matchingNamespace3", "interface", ".intf", "<aura:interface/>");
        makeFile("otherNamespace1", "component", ".cmp", "<aura:component/>");
        makeFile("otherNamespace2", "event", ".evt", "<aura:event/>");
        makeFile("otherNamespace3", "interface", ".intf", "<aura:interface/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(), new InterfaceDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://matching*:*");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        Assert.assertEquals(3, descriptors.size());
        Assert.assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "matchingNamespace1", "component", ComponentDef.class)));
        Assert.assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "matchingNamespace2", "event", EventDef.class)));
        Assert.assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "matchingNamespace3", "interface", InterfaceDef.class)));
    }
    
    /**
     * All namespaces loaded by FileBundleSourceLoader are internal, verify that FileBundleSourceLoader says so.
     */
    @Test
    public void testIsInternalNamespace_WithNull_ReturnsTrue() throws Exception {
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, null);
        Assert.assertTrue("All namespaces loaded by FileBundleSourceLoader are to be intenal",
                loader.isInternalNamespace(null));
    }
    
    @Test
    public void testIsInternalNamespace_WithString_ReturnsTrue() throws Exception {
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, null);
        Assert.assertTrue("All namespaces loaded by FileBundleSourceLoader are to be internal," +
                "Regardless of the namespace.", loader.isInternalNamespace("fooBared"));
    }

    @Test
    public void testReset_WithFileAdditions() throws Exception {
        makeFile("test", "component1", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        Set<DefDescriptor<?>> descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        Assert.assertEquals(1,  descriptors.size());

        makeFile("test", "component2", ".cmp", "<aura:component/>");
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        Assert.assertEquals(1,  descriptors.size());
        
        loader.reset();
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        Assert.assertEquals(2,  descriptors.size());
    }
    
    @Test
    public void testReset_WithFileDeletions() throws Exception {
        makeFile("test", "component1", ".cmp", "<aura:component/>");
        File fileToDelete = makeFile("test", "component2", ".cmp", "<aura:component/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(new ComponentDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(getWorkingDirectory(), null, builders);
        Set<DefDescriptor<?>> descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        Assert.assertEquals(2,  descriptors.size());

        fileToDelete.delete();
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        Assert.assertEquals(2,  descriptors.size());
        
        loader.reset();
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        Assert.assertEquals(1,  descriptors.size());
    }
    
    private File getWorkingDirectory() {
        if (workingDirectory == null){
            workingDirectory = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        }
        return workingDirectory;
    }
    
    private File makeFile(String namespace, String name, String extension, String contents) throws Exception {
        File namespaceDirectory = new File(getWorkingDirectory(), namespace);
        File bundleDirectory = new File(namespaceDirectory, name);
        bundleDirectory.mkdirs();
        File file = new File(bundleDirectory, name + extension);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(contents.getBytes("UTF-8"));
        }
        return file;
    }
}
