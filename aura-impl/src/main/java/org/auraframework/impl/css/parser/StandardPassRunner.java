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
/*
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 */

import com.google.common.base.Predicates;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.css.JobDescription;
import com.google.common.css.PrefixingSubstitutionMap;
import com.google.common.css.RecordingSubstitutionMap;
import com.google.common.css.SubstitutionMap;
import com.google.common.css.compiler.ast.CssCompilerPass;
import com.google.common.css.compiler.ast.CssTree;
import com.google.common.css.compiler.ast.ErrorManager;
import com.google.common.css.compiler.ast.GssFunction;
import com.google.common.css.compiler.passes.*;

import javax.annotation.Nullable;
import java.util.Map;
import java.util.Set;

/**
 * {@link StandardPassRunner} runs applies a sequence of {@link CssCompilerPass}es to a
 * {@link CssTree}.
 *
 *
 */
public class StandardPassRunner {

    // this should be part of JobBuilder
    private final static boolean allowUndefinedConstants = true;

    private static final ImmutableMap<String, GssFunction>
            EMPTY_GSS_FUNCTION_MAP = ImmutableMap.of();

    private final JobDescription job;
    private final ErrorManager errorManager;
    private final RecordingSubstitutionMap recordingSubstitutionMap;
    private final Set<String> allowedConditions;
    private final Set<String> foundConditions;

    public StandardPassRunner(JobDescription job, ErrorManager errorManager, Set<String> allowedConditions, Set<String> foundConditions) {
        this(job, errorManager, createSubstitutionMap(job), allowedConditions, foundConditions);
    }

    public StandardPassRunner(JobDescription job, ErrorManager errorManager,
                      RecordingSubstitutionMap recordingSubstitutionMap, Set<String> allowedConditions, Set<String> foundConditions) {
        this.job = job;
        this.errorManager = errorManager;
        this.recordingSubstitutionMap = recordingSubstitutionMap;
        this.allowedConditions = allowedConditions;
        this.foundConditions = foundConditions;
    }

    /**
     * Runs the passes on the specified {@link CssTree}. This method may be
     * invoked multiple times, as one compilation job may have one {@link CssTree}
     * per input file.
     */
    public void runPasses(CssTree cssTree) {
        if (job.processDependencies) {
            new CheckDependencyNodes(cssTree.getMutatingVisitController(),
                    errorManager).runPass();
        }

        new CreateMixins(cssTree.getMutatingVisitController(),
                errorManager).runPass();
        new CreateDefinitionNodes(cssTree.getMutatingVisitController(),
                errorManager).runPass();
        new CreateConstantReferences(cssTree.getMutatingVisitController())
                .runPass();
        new CreateConditionalNodes(cssTree.getMutatingVisitController(),
                errorManager).runPass();
        new CreateComponentNodes(cssTree.getMutatingVisitController(),
                errorManager).runPass();

        new CreateStandardAtRuleNodes(cssTree.getMutatingVisitController(),
                errorManager).runPass();
        new HandleUnknownAtRuleNodes(cssTree.getMutatingVisitController(),
                errorManager, job.allowedAtRules,
                true /* report */, false /* remove */).runPass();
        new ProcessWebkitKeyframes(cssTree.getMutatingVisitController(),
                errorManager, job.allowWebkitKeyframes, job.simplifyCss).runPass();
        new ProcessRefiners(cssTree.getMutatingVisitController(), errorManager,
                job.simplifyCss).runPass();

        // Collect mixin definitions and replace mixins
        CollectMixinDefinitions collectMixinDefinitions =
                new CollectMixinDefinitions(cssTree.getMutatingVisitController(),
                        errorManager);
        collectMixinDefinitions.runPass();
        new ReplaceMixins(cssTree.getMutatingVisitController(), errorManager,
                collectMixinDefinitions.getDefinitions()).runPass();

        new ProcessComponents<Object>(cssTree.getMutatingVisitController(),
                errorManager).runPass();
        // Check that the conditionals are valid before eliminating conditional nodes
        new VerifyConditions(
                cssTree.getMutatingVisitController(),
                allowedConditions, foundConditions, errorManager).runPass();
        // Eliminate conditional nodes.
        new EliminateConditionalNodes(
                cssTree.getMutatingVisitController(),
                ImmutableSet.copyOf(job.trueConditionNames)).runPass();
        // Collect constant definitions.
        CollectConstantDefinitions collectConstantDefinitionsPass =
                new CollectConstantDefinitions(cssTree);
        collectConstantDefinitionsPass.runPass();
        // Replace constant references.
        // This is the ONLY reason we had to copy the entire class - change the
        // last false to true
        ReplaceConstantReferences replaceConstantReferences =
                new ReplaceConstantReferences(cssTree,
                        collectConstantDefinitionsPass.getConstantDefinitions(),
                        true /* removeDefs */, errorManager,
                        allowUndefinedConstants);
        replaceConstantReferences.runPass();

        Map<String, GssFunction> gssFunctionMap = getGssFunctionMap();
        new ResolveCustomFunctionNodes(
                cssTree.getMutatingVisitController(), errorManager,
                gssFunctionMap, job.allowUnrecognizedFunctions,
                job.allowedNonStandardFunctions)
                .runPass();

        if (job.simplifyCss) {
            // Eliminate empty rules.
            new EliminateEmptyRulesetNodes(cssTree.getMutatingVisitController())
                    .runPass();
            // Eliminating units for zero values.
            new EliminateUnitsFromZeroNumericValues(
                    cssTree.getMutatingVisitController()).runPass();
            // Optimize color values.
            new ColorValueOptimizer(
                    cssTree.getMutatingVisitController()).runPass();
            // Compress redundant top-right-bottom-left value lists.
            new AbbreviatePositionalValues(
                    cssTree.getMutatingVisitController()).runPass();
        }
        if (job.eliminateDeadStyles) {
            // Report errors for duplicate declarations
            new DisallowDuplicateDeclarations(
                    cssTree.getVisitController(), errorManager).runPass();
            // Split rules by selector and declaration.
            new SplitRulesetNodes(cssTree.getMutatingVisitController()).runPass();
            // Dead code elimination.
            new MarkRemovableRulesetNodes(cssTree).runPass();
            new EliminateUselessRulesetNodes(cssTree).runPass();
            // Merge of rules with same selector.
            new MergeAdjacentRulesetNodesWithSameSelector(cssTree).runPass();
            new EliminateUselessRulesetNodes(cssTree).runPass();
            // Merge of rules with same styles.
            new MergeAdjacentRulesetNodesWithSameDeclarations(cssTree).runPass();
            new EliminateUselessRulesetNodes(cssTree).runPass();
        }
        // Perform BiDi flipping if required.
        if (job.needsBiDiFlipping()) {
            new MarkNonFlippableNodes(cssTree.getVisitController()).runPass();
            new BiDiFlipper(cssTree.getMutatingVisitController(),
                    job.swapLtrRtlInUrl, job.swapLeftRightInUrl).runPass();
        }
        // If specified, remove all vendor-specific properties except for the
        // whitelisted vendor.
        if (job.vendor != null) {
            new RemoveVendorSpecificProperties(job.vendor,
                    cssTree.getMutatingVisitController()).runPass();
        }
        // Unless all unrecognized properties are allowed, check for unrecognized
        // properties.
        if (!job.allowUnrecognizedProperties) {
            new VerifyRecognizedProperties(job.allowedUnrecognizedProperties,
                    cssTree.getVisitController(), errorManager).runPass();
        }
        // Rename class names
        if (recordingSubstitutionMap != null) {
            new CssClassRenaming(
                    cssTree.getMutatingVisitController(),
                    recordingSubstitutionMap, null).runPass();
        }
    }

    public @Nullable RecordingSubstitutionMap getRecordingSubstitutionMap() {
        return recordingSubstitutionMap;
    }

    /**
     * Creates the CSS class substitution map from the provider, if any.
     * Wraps it in a substitution map that optionally prefixes all of the renamed
     * classes. Additionaly wraps in a recording substituion map which excludes a
     * blacklist of classnames and allows the map to produced as an output.
     */
    private static RecordingSubstitutionMap createSubstitutionMap(
            JobDescription job) {
        if (job.cssSubstitutionMapProvider != null) {
            SubstitutionMap baseMap = job.cssSubstitutionMapProvider.get();
            if (baseMap != null) {
                SubstitutionMap map = baseMap;
                if (!job.cssRenamingPrefix.isEmpty()) {
                    map = new PrefixingSubstitutionMap(baseMap, job.cssRenamingPrefix);
                }
                return new RecordingSubstitutionMap(map,
                        Predicates.not(Predicates.in(job.excludedClassesFromRenaming)));
            }
        }
        return null;
    }

    /**
     * Gets the GSS function map from the provider, if any.
     *
     * @return the provided map or an empty map if none is provided
     */
    private Map<String, GssFunction> getGssFunctionMap() {
        if (job.gssFunctionMapProvider == null) {
            return EMPTY_GSS_FUNCTION_MAP;
        }

        Map<String, GssFunction> map =
                job.gssFunctionMapProvider.get(GssFunction.class);
        if (map == null) {
            return EMPTY_GSS_FUNCTION_MAP;
        }

        return map;
    }
}
