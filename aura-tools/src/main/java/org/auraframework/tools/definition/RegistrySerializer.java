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
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.BundleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.RegistryService;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
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
    private static final Log log = LogFactory.getLog(RegistrySerializer.class);

    /**
     * An exception during serialization.
     */
    @SuppressWarnings("serial")
    public class RegistrySerializerException extends Exception {
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
     * componentDirectory: The base directory for components.
     */
    private final File componentDirectory;

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

    private boolean modulesEnabled;

    /**
     * A flag for an error occuring.
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
            @Nonnull File componentDirectory, @Nonnull File outputDirectory,
            @Nonnull String[] excluded, @CheckForNull RegistrySerializerLogger logger,
            @Nonnull ContextService contextService, boolean modulesEnabled) {
        this.registryService = registryService;
        this.configAdapter = configAdapter;
        this.componentDirectory = componentDirectory;
        this.outputDirectory = outputDirectory;
        this.contextService = contextService;
        this.excluded = excluded;
        this.modulesEnabled = modulesEnabled;
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
        List<DefRegistry> regs = Lists.newArrayList();

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
        Set<String> prefixes = Sets.newHashSet();
        Set<DefType> types = Sets.newHashSet();
        Set<DefDescriptor<?>> descriptors;
        Map<DefDescriptor<?>, Definition> filtered = Maps.newHashMap();

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
        DescriptorFilter root_nsf;
        if (modulesEnabled) {
            root_nsf = new DescriptorFilter(namespace, Lists.newArrayList(DefType.MODULE));
        } else {
            root_nsf = new DescriptorFilter(namespace, Lists.newArrayList(BundleSource.bundleDefTypes));
        }
        descriptors = master.find(root_nsf);
        for (DefDescriptor<?> desc : descriptors) {
            logger.debug("ENTRY: " + desc + "@" + desc.getDefType().toString());
            try {
                Definition def = master.getDef(desc);
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

    public static final String ERR_ARGS_REQUIRED = "Component and Output Directory are both required";

    public void execute() throws RegistrySerializerException, IOException {
        if (componentDirectory == null || outputDirectory == null) {
            throw new RegistrySerializerException(ERR_ARGS_REQUIRED);
        }
        // Basic check... does the file exist?
        if (!componentDirectory.exists() || !componentDirectory.isDirectory()) {
            throw new RegistrySerializerException("Component directory is not a directory: "+componentDirectory);
        }
        if (!componentDirectory.canRead()) {
            throw new RegistrySerializerException("Unable to read/write "+componentDirectory);
        }
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs();
        }
        if (!outputDirectory.isDirectory()) {
            throw new RegistrySerializerException("Output directory is not a directory: "+outputDirectory);
        }
        if (!outputDirectory.canWrite()) {
            throw new RegistrySerializerException("Output directory is not writable: "+outputDirectory);
        }
        File outputFile = new File(outputDirectory, ".registries");
        if (outputFile.exists()) {
            boolean deleted = outputFile.delete();
            if (!deleted && outputFile.exists()) {
                throw new RegistrySerializerException("Unable to delete and create a new file: "+outputFile);
            }
        }
        try {
            outputFile.createNewFile();
        } catch (IOException ioe) {
            throw new RegistrySerializerException("Unable to create "+outputFile);
        }

        FileOutputStream out;
        try {
            out = new FileOutputStream(outputFile);
        } catch (FileNotFoundException fnfe) {
            throw new RegistrySerializerException("Unable to create "+outputFile, fnfe);
        }
        try {
            DefRegistry master;
            RegistrySet registries;
            if (modulesEnabled) {
                String parentProjectPath = componentDirectory.getParentFile().getCanonicalPath();
                // skip namespaces not in the current project (BUTC module-enforcer will fail otherwise)
                Predicate<ComponentLocationAdapter> filterIn = new Predicate<ComponentLocationAdapter>() {
                    @Override
                    public boolean test(ComponentLocationAdapter adapter) {
                        try {
                            File componentSourceDir = adapter.getComponentSourceDir();
                            if (componentSourceDir != null && !componentSourceDir.getCanonicalPath().startsWith(parentProjectPath)) {
                                logger.info("skipping: " + componentSourceDir.getCanonicalPath());
                                return false;
                            }
                            return true;
                        } catch (IOException x) {
                            logger.error(x);
                            return false;
                        }
                    }
                };
                // must get all component locations within current maven module first to register namespaces
                registries = registryService.buildRegistrySet(Mode.DEV, null, filterIn);
                // need to add components namespaces to perform correct namespace case conversion for module namespaces
                File auraComponentsDirectory = new File (componentDirectory.getParentFile(), "components");
                if (auraComponentsDirectory.exists()) {
                    for (String namespace: registryService.getRegistry(auraComponentsDirectory).getNamespaces()) {
                        configAdapter.addInternalNamespace(namespace);
                    }
                }
                // modules will use existing internal namespaces for conversion
                master = registryService.getModulesRegistry(componentDirectory);
            } else {
                master = registryService.getRegistry(componentDirectory);
                registries = registryService.getRegistrySet(master);
            }

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
    public File getComponentDirectory() {
        return this.componentDirectory;
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
