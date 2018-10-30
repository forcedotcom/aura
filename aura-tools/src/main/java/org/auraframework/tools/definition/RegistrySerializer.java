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
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.BundleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.source.file.FileSourceLocationImpl;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.RegistryService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.BundleSource;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.FileSourceLocation;
import org.auraframework.system.RegistrySet;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Compile components into a set of static registries and write them to a file.
 *
 * This requires a components directory, an output directory, and optionally can take
 * a set of namespaces to exclude.
 *
 * Note that the output file is a binary object file that is a set of registries,
 * one per namespace, that contain all of the defs that are in the namespaces.
 */
public class RegistrySerializer {
    private static final String COMPONENTS_DIR = "components";
    private static final String MODULES_DIR = "modules";

    private static final Log log = LogFactory.getLog(RegistrySerializer.class);

    /**
     * An exception during serialization.
     */
    public static final class RegistrySerializerException extends Exception {
        private static final long serialVersionUID = -3672164920700940831L;

        private RegistrySerializerException(String message, Throwable cause) {
            super(message, cause);
        }

        private RegistrySerializerException(String message) {
            super(message);
        }
    }

    public interface RegistrySerializerLogger {
        void error(CharSequence loggable);

        void error(CharSequence loggable, Throwable cause);

        void error(Throwable cause);

        void warning(CharSequence loggable);

        void warning(CharSequence loggable, Throwable cause);

        void warning(Throwable cause);

        void info(CharSequence loggable);

        void info(CharSequence loggable, Throwable cause);

        void info(Throwable cause);

        void debug(CharSequence loggable);

        void debug(CharSequence loggable, Throwable cause);

        void debug(Throwable cause);
    }

    private static class DefaultLogger implements RegistrySerializerLogger {
        @Override
        public void error(CharSequence loggable) {
        }

        @Override
        public void error(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void error(Throwable cause) {
        }

        @Override
        public void warning(CharSequence loggable) {
        }

        @Override
        public void warning(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void warning(Throwable cause) {
        }

        @Override
        public void info(CharSequence loggable) {
        }

        @Override
        public void info(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void info(Throwable cause) {
        }

        @Override
        public void debug(CharSequence loggable) {
        }

        @Override
        public void debug(CharSequence loggable, Throwable cause) {
        }

        @Override
        public void debug(Throwable cause) {
        }
    };

    @Nonnull
    private final DefaultLogger DEFAULT_LOGGER = new DefaultLogger();

    /**
     * sourceDirectories: The base directory/directories for components.
     */
    private final List<File> sourceDirectories;

    /**
     * outputDirectory: The directory in which to put out the .registries file.
     */
    @Nonnull
    private final File outputDirectory;

    /**
     * excluded: Namespaces to exclude.
     */
    @Nonnull
    private final String[] excluded;

    /**
     * A logger for logging information to the user.
     */
    @Nonnull
    private final RegistrySerializerLogger logger;

    @Nonnull
    private final RegistryService registryService;

    @Nonnull
    private final ConfigAdapter configAdapter;

    @Nonnull
    private final ContextService contextService;

    /**
     * A flag for an error occurring.
     */
    private boolean error = false;

    /**
     * Create a compiler instance.
     *
     * This creates a compiler for the component and output directory specified.
     *
     * @param componentDirectory the directory that we should use for components.
     * @param outputDirectory the output directory where we should write the compiled component '.registry' file.
     * @param excluded a set of excluded namespaces.
     */
    public RegistrySerializer(@Nonnull RegistryService registryService, @Nonnull ConfigAdapter configAdapter,
            @Nonnull List<File> sourceDirectories, @Nonnull File outputDirectory,
            @Nonnull String[] excluded, @CheckForNull RegistrySerializerLogger logger,
            @Nonnull ContextService contextService) {
        this.registryService = registryService;
        this.configAdapter = configAdapter;
        this.sourceDirectories = sourceDirectories;
        this.outputDirectory = outputDirectory;
        this.contextService = contextService;
        this.excluded = excluded;
        if (logger == null) {
            logger = DEFAULT_LOGGER;
        }
        this.logger = logger;
    }

    /**
     * write out the set of namespace registries to the given output stream.
     *
     * @param out the output stream to write into.
     * @throws RegistrySerializerException if there is an error.
     */
    public void write(@Nonnull OutputStream out, DefRegistry master) throws RegistrySerializerException {
        List<DefRegistry> regs = new ArrayList<>();

        Set<String> namespaces = master.getNamespaces();
        if (excluded != null) {
            for (String x : excluded) {
                if (!namespaces.remove(x)) {
                    throw new RegistrySerializerException("Unable to exclude "+x);
                }
            }
        }

        for (String name : namespaces) {
            DefRegistry reg = getRegistry(master, name);
            if (reg != null) {
                regs.add(reg);
            }
        }
        if (error) {
            return;
        }

        ObjectOutputStream objectOut = null;
        try {
            try {
                objectOut = new ObjectOutputStream(out);
                objectOut.writeObject(regs);
            } finally {
                out.close();
            }
        } catch (IOException ioe) {
            logger.error("Unable to write out file", ioe);
            error = true;
        }
    }

    /**
     * Get a registry for the namespace given.
     *
     * This function will compile all of the root definitions in a namespace, and then get all resulting
     * definitions out of that namespace, and create a static registry suitable for serialization.
     *
     * @param namespace the namespace for which we want to retrieve a static registry.
     */
    private DefRegistry getRegistry(@Nonnull DefRegistry master, @Nonnull String namespace) {
        Set<String> prefixes = new HashSet<>();
        Set<DefType> types = new HashSet<>();
        Set<DefDescriptor<?>> descriptors;
        Map<DefDescriptor<?>, Definition> filtered = new HashMap<>();

        // TODO remove once namespace casing is fixed W-5451217
        String existingNamespace = configAdapter.getInternalNamespacesMap().get(namespace.toLowerCase());
        if (existingNamespace != null) {
            // modules will have lower cased namespace folder
            // it needs to use the case sensitive namespace to override existing aura components
            namespace = existingNamespace;
        } else {
            configAdapter.addInternalNamespace(namespace);
        }
        Set<String> namespaces = Sets.newHashSet(namespace);

        //
        // Fetch all matching descriptors for our 'root' definitions.
        //
        logger.debug("******************************************* "+namespace+" ******************************");
        DescriptorFilter root_nsf = new DescriptorFilter(namespace, Lists.newArrayList(BundleSource.bundleDefTypes));
        descriptors = master.find(root_nsf);
        for (DefDescriptor<?> desc : descriptors) {
            try {
                long startNanos = System.nanoTime();
                Definition def = master.getDef(desc);
                logger.debug("ENTRY: " + desc + "@" + desc.getDefType().toString() + " in " + (System.nanoTime() - startNanos)/1000000 + " ms");
                if (def == null) {
                    logger.error("Unable to find " + desc + "@" + desc.getDefType());
                    error = true;
                    continue;
                }
                types.add(desc.getDefType());
                prefixes.add(desc.getPrefix());
                filtered.put(desc, def);
                if (def instanceof BundleDef) {
                    BundleDef rd = (BundleDef) def;
                    Map<DefDescriptor<?>, Definition> bundled = rd.getBundledDefs();
                    if (bundled != null) {
                        for (Map.Entry<DefDescriptor<?>, Definition> entry : bundled.entrySet()) {
                            logger.debug("ENTRY:\t " + entry.getKey() + "@" + entry.getKey().getDefType().toString());
                            filtered.put(entry.getKey(), entry.getValue());
                            types.add(entry.getKey().getDefType());
                            prefixes.add(entry.getKey().getPrefix());
                        }
                    }
                }
            } catch (QuickFixException qfe) {
                logger.error(qfe);
                error = true;
            }
        }
        if (error) {
            return null;
        }
        return new StaticDefRegistryImpl(types, prefixes, namespaces, filtered.values());
    }

    public void execute() throws RegistrySerializerException, IOException {
        if(sourceDirectories == null || sourceDirectories.isEmpty()) {
            throw new RegistrySerializerException("Component source directory is required");
        }

        List<FileSourceLocation> sourceLocations = new ArrayList<>();

        for (File sourceDirectory : sourceDirectories) {
            if (!sourceDirectory.exists() || !sourceDirectory.isDirectory()) {
                throw new RegistrySerializerException("Component directory is not a directory: " + sourceDirectory);
            }
            if (!sourceDirectory.canRead()) {
                throw new RegistrySerializerException("Unable to read/write " + sourceDirectory);
            }
            if (sourceDirectory.getName().contains(MODULES_DIR)) {
                sourceLocations.add(FileSourceLocationImpl.modules(sourceDirectory));
            } else if (sourceDirectory.getName().contains(COMPONENTS_DIR)) {
                sourceLocations.add(FileSourceLocationImpl.components(sourceDirectory));
            } else {
                throw new RegistrySerializerException("Unknown source directory type");
            }
        }

        if (outputDirectory == null) {
            throw new RegistrySerializerException("Output Directory is required");
        }
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs();
        }
        if (!outputDirectory.isDirectory()) {
            throw new RegistrySerializerException("Output directory is not a directory: " + outputDirectory);
        }
        if (!outputDirectory.canWrite()) {
            throw new RegistrySerializerException("Output directory is not writable: " + outputDirectory);
        }
        File outputFile = new File(outputDirectory, ".registries");
        if (outputFile.exists()) {
            boolean deleted = outputFile.delete();
            if (!deleted && outputFile.exists()) {
                throw new RegistrySerializerException("Unable to delete and create a new file: " + outputFile);
            }
        }
        try {
            outputFile.createNewFile();
        } catch (IOException ioe) {
            throw new RegistrySerializerException("Unable to create " + outputFile);
        }

        FileOutputStream out;
        try {
            out = new FileOutputStream(outputFile);
        } catch (FileNotFoundException fnfe) {
            throw new RegistrySerializerException("Unable to create " + outputFile, fnfe);
        }
        try {
            // TODO remove once all downstream projects are updated to compile both components and modules together W-5432127 W-5480526
            if (sourceDirectories.size() == 1 && sourceDirectories.get(0).getPath().contains(MODULES_DIR)) {
                File modulesSourceDir = sourceDirectories.get(0);
                // need to add components namespaces to perform correct namespace case conversion for module namespaces
                File auraComponentsDirectory = new File(modulesSourceDir.getParentFile(), COMPONENTS_DIR);
                if (auraComponentsDirectory.exists()) {
                    FileSourceLocation auraComponentsLocation = FileSourceLocationImpl.components(auraComponentsDirectory);
                    for (String namespace: registryService.getRegistry(Lists.newArrayList(auraComponentsLocation)).getNamespaces()) {
                        configAdapter.addInternalNamespace(namespace);
                    }
                }
            }

            DefRegistry master = registryService.getRegistry(sourceLocations);
            RegistrySet registries = registryService.getRegistrySet(master);

            contextService.startBasicContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED, registries);
            try {
                write(out, master);
            } finally {
                contextService.endContext();
            }
            if (error) {
                throw new RegistrySerializerException("one or more errors occurred during compile");
            }
        } finally {
            try {
                out.close();
            } catch (IOException ioe) {
                log.error(ioe);
            }
        }
    }

    /**
     * Gets the componentDirectory for this instance.
     *
     * @return The componentDirectory.
     */
    public List<File> getSourceDirectories() {
        return this.sourceDirectories;
    }

    /**
     * Gets the outputDirectory for this instance.
     *
     * @return The outputDirectory.
     */
    public File getOutputDirectory() {
        return this.outputDirectory;
    }

    /**
     * Gets the excluded for this instance.
     *
     * @return The excluded.
     */
    public String[] getExcluded() {
        return this.excluded;
    }
}
