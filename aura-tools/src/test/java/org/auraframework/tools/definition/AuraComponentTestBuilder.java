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
package org.auraframework.tools.definition;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

import org.auraframework.Aura;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.DescriptorFileMapper;
import org.auraframework.system.SourceListener;
import org.auraframework.util.IOUtil;

/**
 * A class to build a temporary components folder to allow for read/write tests.
 * 
 * This class can be used to build and auto-clean up a test directory with a components directory nested inside. It can
 * then be inserted in the set of loaders using {@link #installComponentLocationAdapter()}. it implements
 * {@link AutoCloseable} with an idempotent close method so that it can be called multiple times. In the event that
 * tests are run in a try-with-resources, this should automatically get cleaned up.
 */
public class AuraComponentTestBuilder extends DescriptorFileMapper implements AutoCloseable {
    private Path componentsPath;
    private final ComponentLocationAdapter cla;
    private final SourceListener sourceListener;

    /**
     * Create a new test builder.
     */
    public AuraComponentTestBuilder(SourceListener sourceListener) throws IOException {
        File tmpDir = new File(IOUtil.newTempDir("testComponens"));
        componentsPath = tmpDir.toPath();
        cla = new ComponentLocationAdapter.Impl(tmpDir);
        this.sourceListener = sourceListener;
    }

    @Override
    public void close() {
        if (componentsPath != null) {
            try {
                Files.walkFileTree(componentsPath, new DeleteVisitor());
                componentsPath = null;
            } catch (IOException ioe) {
                // DOH!
            }
        }

        sourceListener.onSourceChanged(SourceListener.SourceMonitorEvent.CHANGED, null);
    }

    /**
     * Create a components dir for use in tests.
     * 
     * This components dir must be registered and runk
     */
    public Path getComponentsPath() {
        return this.componentsPath;
    }

    /**
     * Get the component location adapter for the component directory.
     * 
     * This is here for completeness, most use cases want installComponentLocationAdapter.
     */
    public ComponentLocationAdapter getComponentLocationAdapter() {
        return cla;
    }

    /**
     * Install the component location adapter (allow access to the components).
     * 
     * This function puts the component location adapter in the set that is returned by the Service loader. It uses the
     * mock, so one must be careful with it.
     */
// disable because serviceLoader.getAll cannot be mocked out
//    public void installComponentLocationAdapter() {
//        mockedServiceLoader = ServiceLocatorMocker.spyOnServiceLocator();
//        modified = Sets.newHashSet();
//        modified.addAll(mockedServiceLoader.getAll(ComponentLocationAdapter.class));
//        modified.add(cla);
//        Mockito.when(mockedServiceLoader.getAll(ComponentLocationAdapter.class)).thenReturn(modified);
//        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);
//    }

    /**
     * Build a directory for a namespace, and return the new namespace.
     * 
     * This safely builds a new namespace, using the component path as a unique marker.
     * 
     * @return the namespace that was created.
     */
    public String getNewNamespace() throws IOException {
        Path nsPath = Files.createTempDirectory(componentsPath, componentsPath.getFileName().toString() + "_");
        return nsPath.getFileName().toString();
    }

    /**
     * Build a directory for a bundle, and return the name.
     * 
     * Creates a unique name in the filesystem based namespace.
     * 
     * @return the new bundle name.
     */
    public String getNewName(String namespace) throws IOException {
        Path nsPath = componentsPath.resolve(namespace);
        Path bundlePath = Files.createTempDirectory(nsPath, "test");
        return bundlePath.getFileName().toString();
    }

    /**
     * Build a new bundle in a new namespace with given content.
     * 
     * This allows building a new bundle without caring about the name. It builds it in a new namespace.
     * 
     * @return a descriptor for the bundle.
     */
    public <T extends Definition> DefDescriptor<T> getNewObject(Class<T> clazz, String content) throws IOException {
        return getNewObject(getNewNamespace(), clazz, content);
    }

    /**
     * Create a new bundle in a current namespace with a given name and type.
     * 
     * This should be used for the bundle-defining name, and subsequent calls should use the descriptor form since this
     * will create a new name.
     */
    public <T extends Definition> DefDescriptor<T> getNewObject(String ns, Class<T> clazz, String contents)
            throws IOException {
        String name = getNewName(ns);
        String qualified = null;
        // FIXME: W-2368202
        DefType defType = DefType.getDefType(clazz);
        switch (defType) {
        case CONTROLLER:
        case TESTSUITE:
        case MODEL:
        case RENDERER:
        case HELPER:
        case STYLE:
        case FLAVORED_STYLE:
        case TYPE:
        case PROVIDER:
        case TOKEN_DESCRIPTOR_PROVIDER:
        case TOKEN_MAP_PROVIDER:
        case INCLUDE:
        case REQUIRED_VERSION:
            qualified = String.format("%s.%s", ns, name);
            break;
        // subtypes
        case ACTION:
        case DESCRIPTION:
        case INCLUDE_REF:
            return null;
        case ATTRIBUTE:
        case TESTCASE:
        case TOKEN:
        case TOKENS_IMPORT:
        case ATTRIBUTE_DESIGN:
        case DESIGN_TEMPLATE:
        case DESIGN_TEMPLATE_REGION:
        case FLAVOR_INCLUDE:
        case FLAVOR_DEFAULT:
            qualified = name;
            break;
        case APPLICATION:
        case COMPONENT:
        case INTERFACE:
        case EVENT:
        case LIBRARY:
        case DOCUMENTATION:
        case EXAMPLE:
        case TOKENS:
        case DESIGN:
        case SVG:
        case FLAVOR_BUNDLE:
        case FLAVORS:
            qualified = String.format("%s:%s", ns, name);
            break;
        default:
            break;
        }
        DefDescriptor<T> desc = Aura.getDefinitionService().getDefDescriptor(qualified, clazz);
        createFile(desc, contents);
        return desc;
    }

    /**
     * Get the path to a bundle.
     */
    public Path getBundlePath(DefDescriptor<?> descriptor) {
        Path namespacePath = componentsPath.resolve(descriptor.getNamespace());
        Path bundlePath;

        if (descriptor.getBundle() != null) {
            bundlePath = namespacePath.resolve(descriptor.getBundle().getName());
        } else {
            bundlePath = namespacePath.resolve(descriptor.getName());
        }
        return bundlePath;
    }

    /**
     * Create a bundle.
     */
    public Path createBundle(DefDescriptor<?> descriptor) throws IOException {
        Path bundlePath = getBundlePath(descriptor);
        Files.createDirectories(bundlePath);
        return bundlePath;
    }

    /**
     * Get a file path.
     */
    public Path getFilePath(DefDescriptor<?> descriptor) {
        return componentsPath.resolve(getPath(descriptor));
    }

    /**
     * Create a bundle.
     */
    public Path createFile(DefDescriptor<?> descriptor, String contents) throws IOException {
        Path filePath = getFilePath(descriptor);
        createBundle(descriptor);
        Files.write(filePath, contents.getBytes(Charset.forName("UTF-8")));
        return filePath;
    }

    /**
     * A class to recursively delete directories.
     */
    private class DeleteVisitor extends SimpleFileVisitor<Path> {
        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
            Files.delete(file);
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult postVisitDirectory(Path dir, IOException e) throws IOException {
            if (e == null) {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            } else {
                // directory iteration failed
                throw e;
            }
        }
    }
}
