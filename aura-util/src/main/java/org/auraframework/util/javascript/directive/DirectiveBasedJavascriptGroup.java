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
package org.auraframework.util.javascript.directive;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;

import org.apache.log4j.Logger;
import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.CommonJavascriptGroupImpl;
import org.auraframework.util.javascript.SourcemapWriter;
import org.auraframework.util.javascript.builder.EngineJavascriptBuilder;
import org.auraframework.util.javascript.builder.EnvJavascriptBuilder;
import org.auraframework.util.javascript.builder.ExternalLibJavascriptBuilder;
import org.auraframework.util.javascript.builder.FrameworkJavascriptBuilder;
import org.auraframework.util.javascript.builder.JavascriptBuilder;
import org.auraframework.util.javascript.builder.JavascriptResource;
import org.auraframework.util.javascript.builder.LockerJavascriptBuilder;
import org.auraframework.util.resource.ResourceLoader;
import org.auraframework.util.text.Hash;

/**
 * Javascript group that contains directives for parsing instructions or metadata or other fun stuff. It starts from one
 * file which should include the others.
 */
public class DirectiveBasedJavascriptGroup extends CommonJavascriptGroupImpl {
    
    private static final Logger LOGGER = Logger.getLogger(DirectiveBasedJavascriptGroup.class.getName());
    
    /**
     * We spawn multiple threads to go the per-mode generation, and throw this to indicate at least one failure. When
     * printed, this exception will have a "caused by" stack trace for the first error, but its message will identify
     * the cause (and failing thread, which hints at the compilation mode) for each error encountered.
     */
    public static class CompositeRuntimeException extends RuntimeException {
        private static final long serialVersionUID = 7863307967596024441L;

        public Map<String, Throwable> errors;

        public CompositeRuntimeException(String message, Map<String, Throwable> errors) {
            super(message, errors == null || errors.isEmpty() ? null : errors.entrySet().iterator().next().getValue());
            this.errors = errors;
        }

        /** Prints an overall summary, and the message of each error. */
        @Override
        public String toString() {
            StringBuilder builder = new StringBuilder();
            builder.append(getClass().getName());
            String message = getMessage();
            if (message != null && message.isEmpty()) {
                message = null;
            }
            if (message != null || errors.size() > 0) {
                builder.append(": ");
            }
            if (message != null) {
                builder.append(message);
                builder.append("\n");
            }
            if (errors.size() > 0) {
                builder.append(errors.size());
                builder.append(" threads failed with throwables\n");
                for (Map.Entry<String, Throwable> ent : errors.entrySet()) {
                    builder.append("[");
                    builder.append(ent.getKey());
                    builder.append("] ");
                    Throwable thrown = ent.getValue();
                    builder.append(thrown.getClass().getName());
                    message = thrown.getMessage();
                    if (message != null && !message.isEmpty()) {
                        builder.append(": ");
                        builder.append(message);
                    }
                    builder.append("\n");
                }
            }
            return builder.toString();
        }
    }

    // Caching for resources
    private static final String LIB_CACHE_TEMP_DIR = IOUtil.newTempDir("auracache");

    // name for threads that compress and write the output
    public static final String THREAD_NAME = "jsgen.";

    private static final String COMPAT_SUFFIX = "_compat";

    private final List<DirectiveType<?>> directiveTypes;
    private final Set<JavascriptGeneratorMode> modes;
    private final File startFile;
    private CountDownLatch counter;
    private Map<String, Throwable> errors;

    // used during parsing, should be clear for storing in memory
    private DirectiveParser parser;

    protected ResourceLoader resourceLoader = null;
    protected List<JavascriptBuilder> javascriptBuilders;


    public DirectiveBasedJavascriptGroup(String name, File root, String start) throws IOException {
        this(name, root, start, DirectiveTypes.DEFAULT_TYPES, EnumSet.of(JavascriptGeneratorMode.DEVELOPMENT,
                JavascriptGeneratorMode.PRODUCTION));
        errors = null;
    }

    public DirectiveBasedJavascriptGroup(String name, File root, String start, List<DirectiveType<?>> directiveTypes,
            Set<JavascriptGeneratorMode> modes) throws IOException {
        super(name, root);
        this.directiveTypes = directiveTypes;
        this.modes = modes;
        this.startFile = addFile(start);
        this.resourceLoader = new ResourceLoader(LIB_CACHE_TEMP_DIR, true);

        /**
         * aura_*.js is built from 5 separate bundled resources depending on the mode it will be running
         * 1. Test mode global snippet
         * 2. lwc framework source
         * 3. locker source
         * 4. Aura framework source
         * 5. External libraries such as moment, DOMPurify,...
         */
        javascriptBuilders = new ArrayList<>();
        javascriptBuilders.add(new EnvJavascriptBuilder());
        javascriptBuilders.add(new EngineJavascriptBuilder(resourceLoader));
        javascriptBuilders.add(new LockerJavascriptBuilder(resourceLoader));
        javascriptBuilders.add(new FrameworkJavascriptBuilder());
        javascriptBuilders.add(new ExternalLibJavascriptBuilder(resourceLoader));
    }

    public List<DirectiveType<?>> getDirectiveTypes() {
        return directiveTypes;
    }

    public File getStartFile() {
        return startFile;
    }

    public Set<JavascriptGeneratorMode> getJavascriptGeneratorModes() {
        return modes;
    }

    @Override
    public void parse() throws IOException {
        parser = new DirectiveParser(this, getStartFile());
        parser.parseFile();
    }

    @Override
    public void generate(File destRoot, boolean doValidation) throws IOException {
        if (parser == null) {
            throw new RuntimeException("No parser available to generate with");
        }
        // generating all modes along with engine compatibility
        counter = new CountDownLatch(modes.size() * 2);
        errors = new HashMap<>();

        fetchIncludedSources();

        for (JavascriptGeneratorMode mode : modes) {
            generateForMode(destRoot, mode);
        }
        try {
            counter.await();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        if (!errors.isEmpty()) {
            throw new CompositeRuntimeException("Errors generating javascript for " + getName(), errors);
        }
        errors = null;
    }

    private void fetchIncludedSources() throws MalformedURLException {
         for (JavascriptBuilder builder : this.javascriptBuilders) {
             builder.fetchResources();
         }
     }

    protected void generateForMode(File destRoot, final JavascriptGeneratorMode mode) throws IOException {
        final File modeJs = new File(destRoot, getName() + "_" + mode.getSuffix() + ".js");
        final File modeCompatJs = new File(destRoot, getName() + "_" + mode.getSuffix() + COMPAT_SUFFIX + ".js");

        List<File> filesToWrite = new ArrayList<>();
        filesToWrite.add(modeJs);
        filesToWrite.add(modeCompatJs);

        final String everything = buildContent(mode);
        final String threadName = THREAD_NAME + mode;
        int writtenCount = 0;
        List<File> writtenFiles = new ArrayList<>();

        for (File file : filesToWrite) {
            if (file.exists()) {
                if (file.lastModified() < getLastMod() || !mode.allowedInProduction()) {
                    File sourcemapFile = SourcemapWriter.getSourcemapFile(file);
                    File sourceContentFile = SourcemapWriter.getSourcContentFile(file);
                    file.delete();
                    if(sourcemapFile.exists()) {
                        sourcemapFile.delete();
                    }
                    if(sourceContentFile.exists()) {
                        sourceContentFile.delete();
                    }
                } else {
                    // its up to date already, skip
                    LOGGER.info("File up-to-date and does not need to be compiled: " + file.getName());
                    counter.countDown();
                    writtenFiles.add(file);
                    if (++writtenCount == 2) return; else continue;
                }
            }
            file.getParentFile().mkdirs();
        }

        Runnable writeMode = () -> {
            try {
                Writer sourceContentWriter = null; // aura_*.map.js (if the mode supports sourcemap)
                SourcemapWriter sourcemapWriter = null; // aura_*.js.map (if the mode supports sourcemap)

                //There are two files generated for each mode(aura_[mode].js and aura_[mode]_compat.js)
                for (File outputFile : filesToWrite) {
                    if (writtenFiles.contains(outputFile)) continue;

                    File sourcemapFile = null;
                    File sourceContentFile = null;
                    String outputFileName = outputFile.getName();
                    boolean isCompat = outputFileName.contains(COMPAT_SUFFIX);

                    try (Writer outputWriter = new FileWriter(outputFile)) {

                        for(JavascriptBuilder builder : this.javascriptBuilders) {
                            JavascriptResource resource = builder.build(mode, isCompat, everything, outputFileName);

                            String sourcemap;
                            // generate source content and sourcemap only if the "mode" have an associated sourcemap.
                            if((sourcemap = resource.getSourcemap()) != null) {
                                if(sourcemapFile == null) {
                                    sourcemapFile = SourcemapWriter.getSourcemapFile(outputFile);
                                    sourceContentFile = SourcemapWriter.getSourcContentFile(outputFile);

                                    sourcemapWriter = new SourcemapWriter(sourcemapFile);
                                    sourceContentWriter = new FileWriter(sourceContentFile);
                                }

                                outputWriter.flush();
                                long lineCount = Files.lines(outputFile.toPath()).count();
                                // +1 - closure compiler wraps compressed output in an anonymous function which adds an extra line to the minified output.
                                sourcemapWriter.writeSection(outputFileName, lineCount + 1, 0, sourcemap);

                                String inputContent;
                                if((inputContent = resource.getInput()) != null) {
                                    sourceContentWriter.append(inputContent).append("\n");
                                }
                            }

                            // do this after writing sourcemap so that the offset line-count would be calculated before writing this output.
                            String outputContent;
                            if((outputContent = resource.getOutput()) != null) {
                                outputWriter.append(outputContent).append("\n");
                            }
                        }

                        if(sourcemapFile != null) {
                            outputWriter.append(String.format(SourcemapWriter.SOURCEMAP_COMMENT, this.getLastMod(), sourcemapFile.getName()));
                        }
                        LOGGER.info("File is changed and is compiled: " + outputFile.getName());
                    } finally {
                        if(sourcemapWriter != null) {
                            sourcemapWriter.close();
                        }
                        if(sourceContentWriter != null) {
                            sourceContentWriter.close();
                        }

                        outputFile.setReadOnly();
                        if(sourceContentFile != null) {
                            sourceContentFile.setReadOnly();
                        }
                        if(sourcemapFile != null) {
                            sourcemapFile.setReadOnly();
                        }
                        counter.countDown();
                    }
                }
            } catch (Throwable t) {
                // Store any problems, to be thrown in a composite runtime exception from the main thread.
                // Otherwise, they kill this worker thread but are basically ignored.
                errors.put(threadName, t);
            }
        };

        new Thread(writeMode, threadName).start();

    }

    protected String buildContent(JavascriptGeneratorMode mode) {
        return parser.generate(mode);
    }

    @Override
    public boolean isStale() {
        if (!isGroupHashKnown()) {
            return true;
        }
        // Otherwise, we're stale IFF we have changed contents.
        try {
            Hash currentTextHash = computeGroupHash(getFiles());
            return !currentTextHash.equals(getGroupHash());
        } catch (IOException e) {
            // presume we're stale; we'll probably try to regenerate and die from that.
            return true;
        }
    }

    @Override
    public void postProcess() {
        // parser isn't needed at runtime
        parser = null;
    }

    @Override
    public void regenerate(File destRoot) throws IOException {
        reset();
        // 202: Disable JS validation since we precompile definitions
        generate(destRoot, false);
        postProcess();
    }

    @Override
    public void reset() throws IOException {
        setContents(null, this.startFile);
        parse();
        getGroupHash(); // Ensure the new bundle knows its hash once the directives are parsed.
    }
}
