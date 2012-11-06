/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.css.parser;

import com.google.common.css.*;
import com.google.common.css.compiler.ast.CssTree;
import com.google.common.css.compiler.ast.ErrorManager;
import com.google.common.css.compiler.ast.GssError;
import com.google.common.css.compiler.ast.GssParser;
import com.google.common.css.compiler.passes.CompactPrinter;
import com.google.common.css.compiler.passes.PrettyPrinter;

import java.util.*;

/**
 * Parses CSS using Google Closure Stylesheets.
 *
 *
 * @since 0.0.199
 */
public class AuraCSSParser {

    public static final String ISSUE_MESSAGE = "Issue(s) found by Parser:";
    private static final String COMPONENT_NAMESPACE = "THIS";

    // any CSS functions that GCS doesn't know about can be added here.
    //private static final List<String> allowedNonStandardFunctions = ImmutableList.of("translateZ", "color-stop");
    // any CSS properties that GCS doesn't know about can be added here.
    //private static final List<String> allowNonRecognizedProperties = ImmutableList.of("user-select");

    private ClosureErrorManager errorManager = new ClosureErrorManager();

    private final String namespace;
    private final String contents;
    private final ThemeParserResultHolder resultHolder;
    private final Set<String> allowedConditions;
    private final Set<String> foundConditions;

    /**
     * AuraCSSParser uses the infrastructure supplied by Google's Closure
     * Stylesheets project.
     *
     * @param namespace
     * @param contents the actual css
     */
    public AuraCSSParser(String namespace, String contents) {
        this(namespace, contents, null, null, null);
    }

    /**
     * AuraCSSParser uses the infrastructure supplied by Google's Closure
     * Stylesheets project.
     *
     * @param namespace
     * @param contents the actual css
     */
    public AuraCSSParser(String namespace, String contents, ThemeParserResultHolder resultHolder, Set<String> allowedConditions, Set<String> foundConditions) {
        this.namespace = namespace;
        this.contents = contents;
        this.resultHolder = resultHolder;
        this.allowedConditions = allowedConditions;
        this.foundConditions = foundConditions;
    }

    /**
     * Parse the css and return the results.  If errors are found @see #hasErrors will return
     * true, and the error message will be found here @see #getErrorMessage
     */
    public String parse(boolean validateNamespace) {
        JobDescription job = createJobDescription();
        return parse(job, validateNamespace);
    }

    public String parse(boolean validateNamespace, String condition) {
        JobDescription job = createJobDescription(Arrays.asList(condition));
        return parse(job, validateNamespace);
    }

    private String parse(JobDescription job, boolean validateNamespace) {
        try {
            // turn the content into a CssTree
            GssParser parser = new GssParser(job.inputs);
            CssTree cssTree = parser.parse();
            // run passes over the tree
            new StandardPassRunner(job, errorManager, allowedConditions, foundConditions).runPasses(cssTree);
            // adds additional Aura-specific passes.  right now, only for validating namespaces
            // validate namespaces must come after the PassRunner - otherwise the namespaces may not be
            // available.
            if (validateNamespace) {
                new AuraPassRunner(namespace, errorManager, resultHolder).runPasses(cssTree);
            }
            // and print out the results
            return print(job, cssTree);
        } catch (Throwable t) {
            errorManager.report(t);
            return null;
        }
    }

    /**
     * If errors were found during parsing this will report true.
     */
    public boolean hasErrors() {
        return errorManager.hasErrors();
    }

    /**
     * Returns all of the errors all pretty-like.
     */
    public String getErrorMessage() {
        return errorManager.formatErrors();
    }

    private String print(JobDescription job, CssTree cssTree) {
        switch (job.outputFormat) {
            case PRETTY_PRINTED:
                PrettyPrinter prettyPrinterPass = new PrettyPrinter(cssTree
                        .getVisitController());
                prettyPrinterPass.runPass();
                return prettyPrinterPass.getPrettyPrintedString();
            case COMPRESSED:
                CompactPrinter compactPrinterPass = new CompactPrinter(cssTree);
                compactPrinterPass.runPass();
                return compactPrinterPass.getCompactPrintedString();
            default:
                throw new UnsupportedOperationException("Only PRETTY_PRINTED and COMPRESSED supported");
        }
    }

    /**
     * Describes which pass logic will be applied to the css.
     *
     * @return
     */
    private JobDescription createJobDescription(List<String> trueConditionNames) {
        JobDescriptionBuilder builder = new JobDescriptionBuilder();
        builder.setInputOrientation(JobDescription.InputOrientation.LTR);
        builder.setOutputOrientation(JobDescription.OutputOrientation.LTR);
        builder.setOutputFormat(JobDescription.OutputFormat.PRETTY_PRINTED);
        builder.setAllowUnrecognizedFunctions(true);
        builder.setAllowUnrecognizedProperties(true);
        //builder.setAllowedNonStandardFunctions(allowedNonStandardFunctions);
        //builder.setAllowedUnrecognizedProperties(allowNonRecognizedProperties);
        builder.setAllowWebkitKeyframes(true);
        builder.setProcessDependencies(true);
        builder.setSimplifyCss(false);
        builder.setEliminateDeadStyles(false);
        // not needed now, but perhaps in the future?
        //builder.setCopyrightNotice(xxx);
        //builder.setTrueConditionNames(xxx);
        //builder.setExcludedClassesFromRenaming(xxx);
        builder.setCssSubstitutionMapProvider(createSubstitionMapProvider());
        builder.addInput(new SourceCode(namespace, contents));
        if (trueConditionNames!=null) {
            builder.setTrueConditionNames(trueConditionNames);
        }
        return builder.getJobDescription();
    }

    private JobDescription createJobDescription() {
        return createJobDescription(null);
    }

    /**
     * Provides a class name substitution map for the PassRunner.
     *
     * @return
     */
    private SubstitutionMapProvider createSubstitionMapProvider() {
        // create the substitution map for the component's namespace
        final Map<String, String> classSubstitution =  new HashMap<String, String>();
        classSubstitution.put(COMPONENT_NAMESPACE, namespace);
        // if more substitutions are needed, they can go here

        final SubstitutionMap subMap = new SubstitutionMap() {
            @Override
            public String get(String key) {
                return classSubstitution.get(key);
            }
        };

        return new SubstitutionMapProvider() {
            @Override
            public SubstitutionMap get() {
                return subMap;
            }
        };
    }

    private static class ClosureErrorManager implements ErrorManager {

        private List<GssError> gssErrors = new ArrayList<GssError>();
        private List<String> otherErrors = new ArrayList<String>();

        @Override
        public void report(GssError error) {
            gssErrors.add(error);
        }

        public void report(Throwable error) {
            String cause = error.getCause()!=null ? error.getCause().getMessage() : error.getMessage();
            otherErrors.add(cause);
        }

        @Override
        public void generateReport() {
            throw new UnsupportedOperationException("generateReport() not supported");
        }

        @Override
        public boolean hasErrors() {
            return gssErrors.size()+otherErrors.size()>0;
        }

        public String formatErrors() {
            StringBuilder sb = new StringBuilder(ISSUE_MESSAGE);
            for(GssError error : gssErrors) {
                sb.append(error.format()).append("\n");
            }
            for(String error : otherErrors) {
                sb.append(error).append("\n");
            }
            return sb.toString();
        }
    }

}
