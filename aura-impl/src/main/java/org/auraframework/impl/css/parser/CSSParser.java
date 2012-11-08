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

import java.util.*;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.css.*;
import com.google.common.css.JobDescription.OutputFormat;
import com.google.common.css.compiler.ast.*;
import com.google.common.css.compiler.passes.*;

/**
 * @since 0.0.369
 */
public class CSSParser {

    public static final String ISSUE_MESSAGE = "Issue(s) found by Parser:";
    private static final String THIS_NAMESPACE = "THIS";

    // any CSS functions that GCS doesn't know about can be added here.
    //private static final List<String> allowedNonStandardFunctions = ImmutableList.of("translateZ", "color-stop");
    // any CSS properties that GCS doesn't know about can be added here.
    //private static final List<String> allowNonRecognizedProperties = ImmutableList.of("user-select");

    private final ClosureErrorManager errorManager = new ClosureErrorManager();

    private final boolean validateNamespace;
    private final String namespace;
    private final String contents;
    private final Set<String> allowedConditions;

    /**
     * PlumeCSSParser uses the infrastructure supplied by Google's Closure
     * Stylesheets project.
     *
     * @param namespace
     * @param contents the actual css
     */
    public CSSParser(boolean validateNamespace, String namespace, String contents, Set<String> allowedConditions) {
        this.validateNamespace = validateNamespace;
        this.namespace = namespace;
        this.contents = contents;
        this.allowedConditions = allowedConditions;
    }

    
    /**
     * Parse the css and return the results.  If errors are found @see #hasErrors will return
     * true, and the error message will be found here @see #getErrorMessage
     */

    public ThemeParserResultHolder parse() {
        try {
            boolean meh = "mobileMobile".equals(namespace);
            long t = System.currentTimeMillis();
            ThemeParserResultHolder resultHolder = new ThemeParserResultHolder();
            SourceCode sc = new SourceCode(namespace, contents);
            // parse the css tree
            GssParser parser = new GssParser(ImmutableList.of(sc));
            long t2 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " GssParser construction: " + Long.toString(t2 - t));
            }
            CssTree cssTree = parser.parse();

            long t3 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " parsing tree: " + Long.toString(t3 - t2));
            }

            // replaces .THIS with the current component class
            new CssClassRenaming(cssTree.getMutatingVisitController(), new ThisSubstitutionMap(namespace), null).runPass();

            long t4 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " CssClassRenaming: " + Long.toString(t4 - t3));
            }
            if (validateNamespace) {
                // verifies all classes are namespaced
                long tt = System.currentTimeMillis();
                new VerifyComponentClass(namespace, cssTree.getMutatingVisitController(), errorManager).runPass();
                long tt2 = System.currentTimeMillis();
                if (meh) {
                    System.err.println(namespace + " VerifyComponentClass: " + Long.toString(tt2 - tt));
                }
            }

            // finds all the images referenced and adds cache busters
            new GetComponentImageURLs(cssTree.getMutatingVisitController(), resultHolder).runPass();

            long t5 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " GetComponentImageURLs: " + Long.toString(t5 - t4));
            }
            // finds what conditionals are being used in this file
            new VerifyConditions(cssTree.getMutatingVisitController(), allowedConditions, resultHolder, errorManager).runPass();

            long t6 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " VerifyConditions: " + Long.toString(t6 - t5));
            }
            if (resultHolder.getFoundConditions() != null) {
                CssRootNode rootNode = cssTree.getRoot();
                for (String condition : resultHolder.getFoundConditions()) {
                    // need a copy of the tree, as eliminating the conditionals will modify it

                    long tc = System.currentTimeMillis();
                    CssTree treeCopy = new CssTree(sc, rootNode.deepCopy());
                    System.err.println(namespace + " treecopy: " + Long.toString(System.currentTimeMillis() - tc));

                    // eliminate everything but this condition
                    new EliminateConditionalNodes(treeCopy.getMutatingVisitController(),
                            ImmutableSet.of(condition)).runPass();
                    // generate the css for this browser condition
                    resultHolder.putBrowserCss(condition, this.print(OutputFormat.PRETTY_PRINTED, treeCopy));
                }
                // operate on clones.
            }

            long t7 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " browser permutations: " + Long.toString(t7 - t6));
            }
            // eliminate all conditional nodes for the default output
            new EliminateConditionalNodes(cssTree.getMutatingVisitController(),
                    Collections.<String>emptySet()).runPass();

            long t8 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " default permutation: " + Long.toString(t8 - t7));
            }
            // generate the default css
            resultHolder.setDefaultCss(this.print(OutputFormat.PRETTY_PRINTED, cssTree));
            long t9 = System.currentTimeMillis();
            if (meh) {
                System.err.println(namespace + " default output: " + Long.toString(t9 - t8));
                System.err.println(namespace + " totalt: " + Long.toString(t9 - t));
            }
            return resultHolder;
        } catch (GssParserException g) {
            errorManager.report(g);
            return null;
        }
    }

    /**
     * @return true if errors were found during parsing
     */
    public boolean hasErrors() {
        return errorManager.hasErrors();
    }

    /**
     * @return all of the errors formatted all pretty-like
     */
    public String getErrorMessage() {
        return errorManager.formatErrors();
    }

    private String print(JobDescription.OutputFormat outputFormat, CssTree cssTree) {
        switch (outputFormat) {
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
     *
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
        builder.addInput(new SourceCode(namespace, contents));
        if (trueConditionNames!=null) {
            builder.setTrueConditionNames(trueConditionNames);
        }
        return builder.getJobDescription();
    }*/

    /**
     * substitution map that replaces .THIS with namespace
     */
    private static class ThisSubstitutionMap implements SubstitutionMap {
        private final String namespace;

        private ThisSubstitutionMap(String namespace) {
            this.namespace = namespace;
        }

        @Override
        public String get(String key) {
            if (THIS_NAMESPACE.equals(key)) {
                return namespace;
            }
            return null;
        }
    };

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