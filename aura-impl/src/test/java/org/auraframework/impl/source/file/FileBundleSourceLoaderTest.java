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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.FileSourceLocation;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;

public class FileBundleSourceLoaderTest {
    @Rule
    public ExpectedException thrown = ExpectedException.none();

    private FileSourceLocation componentLocation;
    private FileSourceLocation altComponentLocation;
    private FileSourceLocation moduleLocation;

    public FileSourceLocation getComponentLocation() {
        if (componentLocation == null) {
            File dir = new File(IOUtil.newTempDir(FileBundleSourceLoaderTest.class.getSimpleName()));
            componentLocation = FileSourceLocationImpl.components(dir);
        }
        return componentLocation;
    }

    public FileSourceLocation getAltComponentLocation() {
        if (altComponentLocation == null) {
            File dir = new File(IOUtil.newTempDir(FileBundleSourceLoaderTest.class.getSimpleName()));
            altComponentLocation = FileSourceLocationImpl.components(dir);
        }
        return altComponentLocation;
    }

    public FileSourceLocation getModuleLocation() {
        if (moduleLocation == null) {
            File dir = new File(IOUtil.newTempDir(FileBundleSourceLoaderTest.class.getSimpleName()));
            moduleLocation = FileSourceLocationImpl.modules(dir);
        }
        return moduleLocation;
    }

    /** creates a file within a bundle */
    private File makeFile(File parent, String namespace, String name, String extension, String contents)
            throws Exception {
        File namespaceDirectory = new File(parent, namespace);
        File bundleDirectory = new File(namespaceDirectory, name);
        bundleDirectory.mkdirs();
        File file = new File(bundleDirectory, name + extension);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(contents.getBytes("UTF-8"));
        }
        return file;
    }

    /** fake builder which handles one file in bundle with specified extension */
    private static final class FakeFileBundleBuilder<T extends Definition> implements FileBundleSourceBuilder {
        private final String extension;
        private final Class<T> clazz;
        private final Format format;

        public FakeFileBundleBuilder(String extension, Class<T> clazz, Format format) {
            this.extension = extension;
            this.clazz = clazz;
            this.format = format;
        }

        @Override
        public String getExtension() {
            return extension;
        }

        @Override
        public boolean isAllowedSourceLocation(FileSourceLocation sourceLocation) {
            return true;
        }

        @Override
        public BundleSource<?> buildBundle(File base) {
            String name = base.getName();
            String namespace = base.getParentFile().getName();
            DefDescriptor<T> desc = new DefDescriptorImpl<>("markup", namespace, name, clazz);

            try (Stream<Path> stream = Files.find(base.toPath(), 1, (p, attrs) -> p.endsWith(name + extension))) {
                Optional<Path> path = stream.findFirst();
                if (path.isPresent()) {
                    FileSource<?> fileSource = new FileSource<>(desc, path.get().toFile(), format);
                    return new BundleSourceImpl<>(desc, ImmutableMap.of(desc, fileSource));
                } else {
                    throw new RuntimeException("did not find test file");
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private final FileBundleSourceBuilder fakeModuleBuilder = new FakeFileBundleBuilder<>(".js", ModuleDef.class, Format.JS);

    @Test
    public void testConstructor_WithNullValues() {
        thrown.expect(NullPointerException.class);
        thrown.expectMessage("sourceLocations cannot be null");

        new FileBundleSourceLoader(null, null);
    }

    @Test
    public void testConstructor_WithSingleNullSource() {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(null);

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage("Source locations cannot be null");

        new FileBundleSourceLoader(sources, null);
    }

    @Test
    public void testConstructor_WithSomeNullSources() {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(null);

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage("Source locations cannot be null");

        new FileBundleSourceLoader(sources, null);
    }

    @Test
    public void testConstructor_WithNonExistentSourceDirectory() {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File testFile = new File("this_probably_doesnt_exist");
        sources.add(new FileSourceLocation() {
            @Override
            public boolean isComponentSource() {
                return true;
            }

            @Override
            public boolean isModuleSource() {
                return false;
            }

            @Override
            public File getSourceDirectory() {
                return testFile;
            }
        });

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage(
                "Source directory '" + testFile.getAbsolutePath() + "' does not exist or is not a directory");

        new FileBundleSourceLoader(sources, null);
    }

    @Test
    public void testConstructor_WithSomeFilesNotDirectory() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File dir = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        File testFile = makeFile(dir, "test", "component", ".cmp", "<aura:component/>");
        sources.add(new FileSourceLocation() {
            @Override
            public boolean isComponentSource() {
                return true;
            }

            @Override
            public boolean isModuleSource() {
                return false;
            }

            @Override
            public File getSourceDirectory() {
                return testFile;
            }
        });

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage(
                "Source directory '" + testFile.getAbsolutePath() + "' does not exist or is not a directory");

        new FileBundleSourceLoader(sources, null);
    }

    @Test
    public void testConstructor_WithValidSourceDirectories() {
        List<FileSourceLocation> sources = new ArrayList<>();

        FileSourceLocation components = getComponentLocation();
        FileSourceLocation modules = getModuleLocation();
        sources.add(components);
        sources.add(modules);

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, null);

        int expected = sources.size();
        int actual = loader.getSourceLocations().size();
        assertEquals("did not find expected number of source dirs", expected, actual);

        List<FileSourceLocation> actualSourceLocations = loader.getSourceLocations();
        assertEquals("did not get expected source location for components", components, actualSourceLocations.get(0));
        assertEquals("did not get expected source location for modules", modules, actualSourceLocations.get(1));
    }

    @Test
    public void testConstructor_ErrorsWithDuplicateDescriptors() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getAltComponentLocation());

        File sources1 = sources.get(0).getSourceDirectory();
        makeFile(sources1, "test", "component", ".cmp", "<aura:component/>");
        makeFile(sources1, "test", "otherComponent", ".cmp", "<aura:component/>");

        File sources2 = sources.get(1).getSourceDirectory();
        makeFile(sources2, "otherTest", "component", ".cmp", "<aura:component/>");
        makeFile(sources2, "test", "otherComponent", ".cmp", "<aura:component/>");

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage("Found duplicate bundle named 'otherComponent'");

        new FileBundleSourceLoader(sources, null);
    }

    @Test
    public void testConstructor_ErrorsWithDuplicateDescriptors_CaseSensitive() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getModuleLocation());

        File sources1 = sources.get(0).getSourceDirectory();
        makeFile(sources1, "test", "component", ".cmp", "<aura:component/>");
        makeFile(sources1, "test", "otherComponent", ".cmp", "<aura:component/>");

        File sources2 = sources.get(1).getSourceDirectory();
        makeFile(sources2, "otherTest", "component", ".js", "export default class Component{}");
        makeFile(sources2, "test", "othercomponent", ".js", "export default class OtherComponent{}");

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage("Found duplicate bundle named 'othercomponent'");

        new FileBundleSourceLoader(sources, null);
    }

    @Test
    public void testGetBundle_WithNullDescriptor_ReturnsNull() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        makeFile(sources.get(0).getSourceDirectory(), "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources,Sets.newHashSet(new ComponentDefFileBundleBuilder()));

        assertNull(loader.getBundle(null));
    }

    @Test
    public void testGetBundle_WithNamespaceNotFound_ReturnsNull() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        makeFile(sources.get(0).getSourceDirectory(), "test", "component", ".cmp", "<aura:component/>");

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "notfound", "component", ComponentDef.class);

        assertNull(loader.getBundle(descriptor));
    }

    @Test
    public void testGetBundle_WithNameNotFound_ReturnsNull() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        makeFile(sources.get(0).getSourceDirectory(), "test", "component", ".cmp", "<aura:component/>");

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "notfound", ComponentDef.class);

        assertNull(loader.getBundle(descriptor));
    }

    @Test
    public void testGetBundle_WithMatchingDescriptor() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component>a</aura:component>");
        makeFile(components, "test", "otherComponent", ".cmp", "<aura:component>b</aura:component>");
        makeFile(components, "otherNamespace", "component", ".cmp", "<aura:component>c</aura:component>");

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "component", ComponentDef.class);
        BundleSource<?> bundleSource = loader.getBundle(descriptor);
        assertEquals("markup://test:component", bundleSource.getDescriptor().getQualifiedName());

        Map<DefDescriptor<?>, Source<?>> bundleParts = bundleSource.getBundledParts();
        assertEquals(1, bundleParts.size());
        assertEquals("<aura:component>a</aura:component>",
                ((TextSource<?>) bundleParts.values().iterator().next()).getContents());
    }

    @Test
    public void testGetBundle_WithMatchingDescriptor_MultipleSourceDirs() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getModuleLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component>a</aura:component>");
        makeFile(components, "test", "otherComponent", ".cmp", "<aura:component>b</aura:component>");
        makeFile(components, "otherNamespace", "component", ".cmp", "<aura:component>c</aura:component>");

        File modules = sources.get(1).getSourceDirectory();
        makeFile(modules, "test", "foo", ".js", "export default class Foo {}");
        makeFile(modules, "foo", "module", ".js", "export default class Module {}");
        makeFile(modules, "foo", "otherComponent", ".js", "export default class OtherComponet {}");
        makeFile(modules, "othernamespace", "module", ".js", "export default class Module {}");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                fakeModuleBuilder);

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);

        // test get cmp
        BundleSource<?> source1 = loader
                .getBundle(new DefDescriptorImpl<>("markup", "otherNamespace", "component", ComponentDef.class));
        String expectedName1 = "markup://otherNamespace:component";
        String actualName1 = source1.getDescriptor().getQualifiedName();
        assertEquals("did not get expected name for otherNamespace:component", expectedName1, actualName1);

        Map<DefDescriptor<?>, Source<?>> parts1 = source1.getBundledParts();
        String expectedContent1 = "<aura:component>c</aura:component>";
        String actualContent1 = ((TextSource<?>) Iterables.get(parts1.values(), 0)).getContents();
        assertEquals("did not get expected content for otherNamespace:component", expectedContent1, actualContent1);

        // test get another cmp
        BundleSource<?> source2 = loader
                .getBundle(new DefDescriptorImpl<>("markup", "test", "otherComponent", ComponentDef.class));
        String expectedName2 = "markup://test:otherComponent";
        String actualName2 = source2.getDescriptor().getQualifiedName();
        assertEquals("did not get expected name for test:otherComponent", expectedName2, actualName2);

        Map<DefDescriptor<?>, Source<?>> parts2 = source2.getBundledParts();
        String expectedContent2 = "<aura:component>b</aura:component>";
        String actualContent2 = ((TextSource<?>) Iterables.get(parts2.values(), 0)).getContents();
        assertEquals("did not get expected content for test:otherComponent", expectedContent2, actualContent2);

        // test get module
        BundleSource<?> source3 = loader
                .getBundle(new DefDescriptorImpl<>("markup", "foo", "otherComponent", ModuleDef.class));
        String expectedName3 = "markup://foo:otherComponent";
        String actualName3 = source3.getDescriptor().getQualifiedName();
        assertEquals("did not get expected name for foo:otherComponent", expectedName3, actualName3);

        Map<DefDescriptor<?>, Source<?>> parts3 = source3.getBundledParts();
        String expectedContent3 = "export default class OtherComponet {}";
        String actualContent3 = ((TextSource<?>) Iterables.get(parts3.values(), 0)).getContents();
        assertEquals("did not get expected content for foo:otherComponent", expectedContent3, actualContent3);
    }

    @Test
    public void testGetBundle_WithMatchingDescriptor_CaseSensitivity() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getModuleLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component>a</aura:component>");
        makeFile(components, "otherNamespace", "component", ".cmp", "<aura:component>c</aura:component>");

        File modules = sources.get(1).getSourceDirectory();
        makeFile(modules, "othernamespace", "module", ".js", "export default class Module {}");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                fakeModuleBuilder);

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        BundleSource<?> source = loader
                .getBundle(new DefDescriptorImpl<>("markup", "otherNamespace", "module", ModuleDef.class));

        assertNotNull("did not find otherNamespace:module", source);
    }

    @Test
    public void testGetSource_WithNullDescriptor_ReturnsNull() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));

        assertNull(loader.getBundle(null));
    }

    @Test
    public void testGetSource_WithNamespaceNotFound_ReturnsNull() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "notfound", "component", ComponentDef.class);

        assertNull(loader.getSource(descriptor));
    }

    @Test
    public void testGetSource_WithNameNotFound_ReturnsNull() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "notfound", ComponentDef.class);

        assertNull(loader.getSource(descriptor));
    }

    @Test
    public void testGetSource_WithMatchingDescriptor() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "component", ComponentDef.class);
        BundleSource<?> bundleSource = (BundleSource<?>) loader.getSource(descriptor);
        assertEquals("markup://test:component", bundleSource.getDescriptor().getQualifiedName());

        Map<DefDescriptor<?>, Source<?>> bundleParts = bundleSource.getBundledParts();
        assertEquals(1, bundleParts.size());
        assertEquals("<aura:component/>", ((TextSource<?>) bundleParts.values().iterator().next()).getContents());
    }

    @Test
    public void testGetSource_WithMatchingDescriptor_MultipleSourceDirs() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getModuleLocation());

        makeFile(sources.get(0).getSourceDirectory(), "test", "component", ".cmp", "<aura:component/>");
        makeFile(sources.get(1).getSourceDirectory(), "test", "foo", ".js", "export default class Foo{}");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                fakeModuleBuilder);

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup", "test", "foo", ModuleDef.class);
        BundleSource<?> bundleSource = (BundleSource<?>) loader.getSource(descriptor);
        assertEquals("markup://test:foo", bundleSource.getDescriptor().getQualifiedName());

        Map<DefDescriptor<?>, Source<?>> bundleParts = bundleSource.getBundledParts();
        assertEquals(1, bundleParts.size());
        assertEquals("export default class Foo{}",
                ((TextSource<?>) Iterables.get(bundleParts.values(), 0)).getContents());
    }

    @Test
    public void testGetNamespaces_Empty() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        Set<String> namespaces = loader.getNamespaces();

        assertEquals(0, namespaces.size());
    }

    @Test
    public void testGetNamespaces_WithMultipleBuilders() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "cmp1", "component", ".cmp", "<aura:component/>");
        makeFile(components, "cmp2", "component", ".cmp", "<aura:component/>");
        makeFile(components, "intf1", "interface", ".intf", "<aura:interface/>");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(),
                new InterfaceDefFileBundleBuilder(),
                new FlavorBundleFileBundleBuilder());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        Set<String> namespaces = loader.getNamespaces();

        assertEquals(3, namespaces.size());
        assertTrue(namespaces.contains("cmp1"));
        assertTrue(namespaces.contains("cmp2"));
        assertTrue(namespaces.contains("intf1"));
    }

    @Test
    public void testGetNamespaces_WithMultipleSourceDirs() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getAltComponentLocation());

        File sourceDir1 = sources.get(0).getSourceDirectory();
        makeFile(sourceDir1, "namespace1", "component", ".cmp", "<aura:component/>");
        makeFile(sourceDir1, "namespace2", "component", ".cmp", "<aura:component/>");
        makeFile(sourceDir1, "foo", "interface", ".intf", "<aura:interface/>");

        File sourceDir2 = sources.get(1).getSourceDirectory();
        makeFile(sourceDir2, "namespace1", "foo", ".cmp", "<aura:component/>");
        makeFile(sourceDir2, "namespace3", "component", ".cmp", "<aura:component/>");
        makeFile(sourceDir2, "bar", "event", ".evt", "<aura:event/>");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        Set<String> namespaces = loader.getNamespaces();

        assertEquals(5, namespaces.size());
        assertTrue(namespaces.contains("namespace1"));
        assertTrue(namespaces.contains("namespace2"));
        assertTrue(namespaces.contains("namespace3"));
        assertTrue(namespaces.contains("foo"));
        assertTrue(namespaces.contains("bar"));
    }

    @Test
    public void testGetNamespaces_CaseSensitivity() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getModuleLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "nameSpace", "component", ".cmp", "<aura:component/>");
        makeFile(components, "nameSpace2", "component", ".cmp", "<aura:component/>");

        File modules = sources.get(1).getSourceDirectory();
        makeFile(modules, "namespace", "foo", ".js", "export default class Foo{}");
        makeFile(modules, "namespace2", "bar", ".js", "export default class Bar{}");
        makeFile(modules, "namespace3", "baz", ".js", "export default class Baz{}");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                fakeModuleBuilder);

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        Set<String> namespaces = loader.getNamespaces();

        assertEquals(3, namespaces.size());
        assertTrue(namespaces.contains("nameSpace"));
        assertTrue(namespaces.contains("nameSpace2"));
        assertTrue(namespaces.contains("namespace3"));
    }

    @Test
    public void testFind_WithNamespaceNotFound_ReturnsEmpty() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DescriptorFilter filter = new DescriptorFilter("markup://notFound:component");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        assertEquals(0, descriptors.size());
    }

    @Test
    public void testFind_WithNameNotFound_ReturnsEmpty() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DescriptorFilter filter = new DescriptorFilter("markup://test:notFound");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        assertEquals(0, descriptors.size());
    }

    @Test
    public void testFind_WithConstant_MatchesSingle() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        DescriptorFilter filter = new DescriptorFilter("markup://test:component");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        assertEquals(1, descriptors.size());
    }

    @Test
    public void testFind_WithNameGlob_MatchesMultiple() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "matchingComponent", ".cmp", "<aura:component/>");
        makeFile(components, "test", "matchingEvent", ".evt", "<aura:event/>");
        makeFile(components, "test", "matchingInterface", ".intf", "<aura:interface/>");
        makeFile(components, "test", "otherComponent", ".cmp", "<aura:component/>");
        makeFile(components, "test", "otherEvent", ".evt", "<aura:event/>");
        makeFile(components, "test", "otherInterface", ".intf", "<aura:interface/>");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(),
                new InterfaceDefFileBundleBuilder());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://test:matching*");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        assertEquals(3, descriptors.size());
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingComponent", ComponentDef.class)));
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingEvent", EventDef.class)));
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingInterface", InterfaceDef.class)));
    }

    @Test
    public void testFind_WithNameGlob_MultipleSources() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getAltComponentLocation());

        File sources1 = sources.get(0).getSourceDirectory();
        File sources2 = sources.get(1).getSourceDirectory();

        makeFile(sources1, "test", "matchingComponent", ".cmp", "<aura:component/>");
        makeFile(sources1, "test", "matchingEvent", ".evt", "<aura:event/>");
        makeFile(sources1, "test", "matchingInterface", ".intf", "<aura:interface/>");
        makeFile(sources2, "test", "otherComponent", ".cmp", "<aura:component/>");
        makeFile(sources2, "test", "otherEvent", ".evt", "<aura:event/>");
        makeFile(sources2, "test", "otherInterface", ".intf", "<aura:interface/>");

        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(),
                new InterfaceDefFileBundleBuilder());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://test:matching*");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        assertEquals(3, descriptors.size());
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingComponent", ComponentDef.class)));
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingEvent", EventDef.class)));
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "test", "matchingInterface", InterfaceDef.class)));
    }

    @Test
    public void testFind_WithNamespaceGlob_MatchesMultiple() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "matchingNamespace1", "component", ".cmp", "<aura:component/>");
        makeFile(components, "matchingNamespace2", "event", ".evt", "<aura:event/>");
        makeFile(components, "matchingNamespace3", "interface", ".intf", "<aura:interface/>");
        makeFile(components, "otherNamespace1", "component", ".cmp", "<aura:component/>");
        makeFile(components, "otherNamespace2", "event", ".evt", "<aura:event/>");
        makeFile(components, "otherNamespace3", "interface", ".intf", "<aura:interface/>");
        Collection<FileBundleSourceBuilder> builders = Sets.newHashSet(
                new ComponentDefFileBundleBuilder(),
                new EventDefFileBundleBuilder(),
                new InterfaceDefFileBundleBuilder());
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, builders);
        DescriptorFilter filter = new DescriptorFilter("markup://matching*:*");
        Set<DefDescriptor<?>> descriptors = loader.find(filter);
        assertEquals(3, descriptors.size());
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "matchingNamespace1", "component", ComponentDef.class)));
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "matchingNamespace2", "event", EventDef.class)));
        assertTrue(descriptors
                .contains(new DefDescriptorImpl<>("markup", "matchingNamespace3", "interface", InterfaceDef.class)));
    }

    @Test
    public void testIsInternalNamespace_WithNull_ReturnsTrue() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, null);
        assertTrue("All namespaces loaded by FileBundleSourceLoader are to be intenal",
                loader.isInternalNamespace(null));
    }

    @Test
    public void testIsInternalNamespace_WithString_ReturnsTrue() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, null);
        assertTrue("All namespaces loaded by FileBundleSourceLoader are to be internal," +
                "Regardless of the namespace.", loader.isInternalNamespace("fooBared"));
    }

    @Test
    public void testReset_WithFileAdditions() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component1", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        Set<DefDescriptor<?>> descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(1, descriptors.size());

        makeFile(components, "test", "component2", ".cmp", "<aura:component/>");
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(1, descriptors.size());

        loader.reset();
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(2, descriptors.size());
    }

    @Test
    public void testReset_WithFileAdditions_MultipleSourceDirs() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());
        sources.add(getAltComponentLocation());

        File sourcesDir1 = sources.get(0).getSourceDirectory();
        makeFile(sourcesDir1, "test", "component1", ".cmp", "<aura:component/>");
        File sourcesDir2 = sources.get(1).getSourceDirectory();
        makeFile(sourcesDir2, "test", "component2", ".cmp", "<aura:component/>");

        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));

        Set<DefDescriptor<?>> descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(2, descriptors.size());

        makeFile(sourcesDir2, "test", "component3", ".cmp", "<aura:component/>");
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(2, descriptors.size());

        loader.reset();

        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(3, descriptors.size());
    }

    @Test
    public void testReset_WithFileDeletions() throws Exception {
        List<FileSourceLocation> sources = new ArrayList<>();
        sources.add(getComponentLocation());

        File components = sources.get(0).getSourceDirectory();
        makeFile(components, "test", "component1", ".cmp", "<aura:component/>");
        File fileToDelete = makeFile(components, "test", "component2", ".cmp", "<aura:component/>");
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sources, Sets.newHashSet(new ComponentDefFileBundleBuilder()));
        Set<DefDescriptor<?>> descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(2, descriptors.size());

        fileToDelete.delete();
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(2, descriptors.size());

        loader.reset();
        descriptors = loader.find(new DescriptorFilter("markup://test:*"));
        assertEquals(1, descriptors.size());
    }
}
