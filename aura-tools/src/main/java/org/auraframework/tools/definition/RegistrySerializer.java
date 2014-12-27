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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.NamespaceDef;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import edu.umd.cs.findbugs.annotations.CheckForNull;
import edu.umd.cs.findbugs.annotations.NonNull;

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
    private static final Log log =
        LogFactory.getLog(RegistrySerializer.class);

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
    };

    public static interface RegistrySerializerLogger {
        public void error(CharSequence loggable);

        public void error(CharSequence loggable, Throwable cause);

        public void error(Throwable cause);

        public void warning(CharSequence loggable);

        public void warning(CharSequence loggable, Throwable cause);

        public void warning(Throwable cause);

        public void info(CharSequence loggable);

        public void info(CharSequence loggable, Throwable cause);

        public void info(Throwable cause);

        public void debug(CharSequence loggable);

        public void debug(CharSequence loggable, Throwable cause);

        public void debug(Throwable cause);
    };

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
    
    @NonNull
    private final DefaultLogger DEFAULT_LOGGER = new DefaultLogger();

    /**
     * componentDirectory: The base directory for components.
     */
    private final File componentDirectory;

    /**
     * outputDirectory: The directory in which to put out the .registries file.
     */
    @NonNull
    private final File outputDirectory;

    /**
     * excluded: Namespaces to exclude.
     */
    @NonNull
    private final String[] excluded;

    /**
     * A logger for logging information to the user.
     */
    @NonNull
    private final RegistrySerializerLogger logger;

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
    public RegistrySerializer(@NonNull File componentDirectory, @NonNull File outputDirectory,
            @NonNull String[] excluded, @CheckForNull RegistrySerializerLogger logger) {
        this.componentDirectory = componentDirectory;
        this.outputDirectory = outputDirectory;
        this.excluded = excluded;
        if (logger == null) {
            logger = DEFAULT_LOGGER;
        }
        this.logger = logger;
    }

    /**
     * write out the set of namespace registries to the given output stream.
     *
     * @param namespaces the namespaces to serialize.
     * @param out the output stream to write into.
     * @throws RegistrySerializerException if there is an error.
     */
    public void write(@NonNull Set<String> namespaces, @NonNull OutputStream out) {
        List<DefRegistry<Definition>> regs = Lists.newArrayList();
        for (String name : namespaces) {
            regs.add(getRegistry(name));
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
    private DefRegistry<Definition> getRegistry(@NonNull String namespace) {
        Set<String> prefixes = Sets.newHashSet();
        Set<DefType> types = Sets.newHashSet();
        Set<DefDescriptor<?>> descriptors;
        List<Definition> defs = Lists.newArrayList();
        MasterDefRegistry mdr = Aura.getContextService().getCurrentContext().getDefRegistry();
        DescriptorFilter root_nsf = new DescriptorFilter(namespace,
                "COMPONENT,APPLICATION,EVENT,INTERFACE,LIBRARY,THEME,DOCUMENTATION,TESTSUITE,NAMESPACE,LAYOUTS,LAYOUT");
        Map<DefDescriptor<?>, Definition> filtered;
        Set<String> namespaces = Sets.newHashSet(namespace);
        //
        // Fetch all matching descriptors for our 'root' definitions.
        //
        descriptors = mdr.find(root_nsf);
        // HACK! this should go away with: W-2368045
        descriptors.add(Aura.getDefinitionService().getDefDescriptor("markup://"+namespace, NamespaceDef.class));
        for (DefDescriptor<?> desc : descriptors) {
            Definition def = null;
            try {
                def = mdr.getDef(desc);
                if (def == null) {
                    logger.error("Unable to find "+desc+"@"+desc.getDefType());
                    error = true;
                }
            } catch (QuickFixException qfe) {
                logger.error(qfe);
                error = true;
            }
        }
        //
        // Now filter the compiled set on the namespace.
        //
        Set<DefDescriptor<?>> empty = Sets.newHashSet();
        filtered = mdr.filterRegistry(empty);
        logger.debug("******************************************* "+namespace+" ******************************");
        for (Map.Entry<DefDescriptor<?>,Definition> entry : filtered.entrySet()) {
            DefDescriptor<?> desc = entry.getKey();
            Definition def = entry.getValue();
            // We ignore null here as we don't care about dead ends during compile.
            if (namespace.equals(desc.getNamespace()) && def != null) {
                logger.debug("ENTRY: "+desc+"@"+desc.getDefType().toString());
                types.add(desc.getDefType());
                prefixes.add(desc.getPrefix());
                defs.add(def);
            }
        }
        if (defs.size() == 0) {
            logger.error("No files compiled for "+namespace);
            error = true;
        }
        return new StaticDefRegistryImpl<>(types, prefixes, namespaces, defs);
    }

    public static final String ERR_ARGS_REQUIRED = "Component and Output Directory are both required";

    public void execute() throws RegistrySerializerException {
        if (componentDirectory == null || outputDirectory == null) {
            throw new RegistrySerializerException(ERR_ARGS_REQUIRED);
        }
        // Basic check... does the file exist?
        if (!componentDirectory.exists() || !componentDirectory.isDirectory()) {
            throw new RegistrySerializerException("Component directory is not a directory: "+componentDirectory);
        }
        if (!componentDirectory.canRead() || !componentDirectory.canWrite() ) {
            throw new RegistrySerializerException("Unable to read/write "+componentDirectory);
        }
        // Now, get our namespaces.
        FileSourceLoader fsl = new FileSourceLoader(componentDirectory);
        Set<String> namespaces = fsl.getNamespaces();
        if (excluded != null) {
            for (String x : excluded) {
                if (!namespaces.remove(x)) {
                    throw new RegistrySerializerException("Unable to exclude "+x);
                }
            }
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
            try {
                Aura.getContextService().startContext(Mode.DEV, null, Format.JSON, Authentication.AUTHENTICATED, null);
            } catch (QuickFixException qfe) {
                throw new RegistrySerializerException("problem creating context "+qfe);
            }
            try {
                write(namespaces, out);
            } finally {
                Aura.getContextService().endContext();
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
