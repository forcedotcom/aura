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
package org.auraframework.impl.validation;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.validation.ValidationError;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Misc utility methods used in validation
 */
public final class ValidationUtil {

    private static final Log LOG = LogFactory.getLog(ValidationUtil.class);

    public static AuraContext startValidationContext() {
        return Aura.getContextService().startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED);
    }

    public static void endValidationContext() {
        Aura.getContextService().endContext();
    }

    public static String writeReport(List<ValidationError> errors, File reportFile) throws IOException {
        reportFile.getParentFile().mkdirs();
        PrintWriter writer = new PrintWriter(new FileWriter(reportFile));
        try {
            for (ValidationError error : errors) {
                String message = error.toCommonFormat();
                writer.println(message);
            }
        } finally {
            writer.close();
        }
        String message = errors.size() + " errors written to " + reportFile.getAbsolutePath();
        LOG.info(message);
        return message;
    }

    public static Set<DefDescriptor<?>> getAllDescriptorsIn(String rootPath) throws IOException {
        File root = new File(rootPath).getCanonicalFile();
        if (!root.exists()) {
            throw new IllegalArgumentException("resource doesn't exist: " + root.getAbsolutePath());
        }

        // find component source dirs for resources to check
        List<File> componentSourceDirs = ValidationUtil.findComponentSourceDirs(root);
        LOG.info("componentSourceDirs: " + componentSourceDirs);

        if (componentSourceDirs.size() == 0) {
            LOG.info("no definitions found in " + root.getAbsolutePath());
            return NO_DESCRIPTORS;
        }

        if (componentSourceDirs.size() > 1) {
            LOG.warn("multiple roots NYI, ignoring all but first: " + componentSourceDirs);
            // TODO: implement
        }

        File componentSourceDir = componentSourceDirs.get(0);

        // get list of descriptors for all definitions found
        ValidationFileSourceLoader sourceLoader = new ValidationFileSourceLoader(componentSourceDir);
        Set<DefDescriptor<?>> descriptors = sourceLoader.findIn(root);
        LOG.info("# descriptors to validate: " + descriptors.size());

        return descriptors;
    }

    private static final Set<DefDescriptor<?>> NO_DESCRIPTORS = ImmutableSet.of();

    /**
     * @return all descriptors known by the Aura runtime
     */
    public static Set<DefDescriptor<?>> getAllKnownDescriptors() throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        Set<DefDescriptor<?>> descriptors = definitionService.find(new DescriptorFilter("*://*:*"));
        Set<DefDescriptor<?>> includedDescriptors = new HashSet<DefDescriptor<?>>();

        // add bundle ones from RootDefinition elements
        Set<DefDescriptor<?>> bundlesDescriptors = new HashSet<DefDescriptor<?>>();
        for (DefDescriptor<?> descriptor : descriptors) {
            Definition definition = null;
            try {
                definition = descriptor.getDef();
            } catch (Exception ex) {
                LOG.warn("exception loading " + descriptor, ex);
            }

            includedDescriptors.add(descriptor);
            if (definition instanceof RootDefinition) {
                RootDefinition rootDefinition = (RootDefinition) definition;
                List<DefDescriptor<?>> bundle = rootDefinition.getBundle();
                if (bundle != null) {
                    bundlesDescriptors.addAll(bundle);
                }
            }
        }
        includedDescriptors.addAll(bundlesDescriptors);

        return includedDescriptors;
    }

    /**
     * Adds lineOffset to all error lines
     */
    public static <T extends ValidationError> List<T> patchErrorLines(List<T> errors, int lineOffset) {
        if (errors == null) {
            return null;
        }
        if (lineOffset != 0) {
            for (ValidationError error : errors) {
                error.setLine(error.getLine() + lineOffset);
            }
        }
        return errors;
    }

    /**
     * Misc patching of all errors
     */
    public static <T extends ValidationError> List<T> patchErrors(List<T> errors) {
        if (errors == null) {
            return null;
        }
        for (ValidationError error : errors) {
            String message = error.getMessage();
            if (message.endsWith(".")) {
                error.setMessage(message.substring(0, message.length() - 1));
            }
        }
        return errors;
    }

    /**
     * Leaves only the name part of the filenames (i.e. componentController.js)
     */
    public static <T extends ValidationError> List<T> trimFilenames(List<T> errors) {
        if (errors == null) {
            return null;
        }
        for (ValidationError error : errors) {
            error.setFilename(new File(error.getFilename()).getName());
        }
        return errors;
    }

    /**
     * Finds the components source directories for all components found inside path
     */
    public static List<File> findComponentSourceDirs(File path) {
        // assumes: root/namespace/component/component.[cmp|app]
        // traverses file system starting at path and adds the component source dirs for all .cmp/.app found
        if (!path.exists()) {
            throw new IllegalArgumentException("path doesn't exist: " + path.getAbsolutePath());
        }
        if (path.isFile()) {
            // i.e. basicController.js
            path = path.getParentFile();
        }
        return new ComponentSourceDirsFinder().find(path);
    }

    private static class ComponentSourceDirsFinder {
        final Set<File> roots = Sets.newHashSet();

        ArrayList<File> find(File path) {
            traverse(path);
            return Lists.newArrayList(roots);
        }

        private void traverse(File file) {
            if (file.isDirectory()) {
                for (File child : file.listFiles()) {
                    traverse(child);
                }
            } else {
                String name = file.getName();
                if (name.endsWith(".cmp") || name.endsWith(".app")) {
                    roots.add(file.getParentFile().getParentFile().getParentFile());
                }
            }
            // TODO: optimize by not traversing within already found component source dirs
        }
    }
}
