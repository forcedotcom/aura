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
package org.auraframework.impl.css.parser;

import java.nio.charset.Charset;
import java.util.List;
import java.util.Set;
import java.util.Stack;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.expression.Expression;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.phloc.css.ECSSVersion;
import com.phloc.css.ICSSWriterSettings;
import com.phloc.css.decl.CSSDeclaration;
import com.phloc.css.decl.CSSExpression;
import com.phloc.css.decl.CSSFontFaceRule;
import com.phloc.css.decl.CSSKeyframesBlock;
import com.phloc.css.decl.CSSKeyframesRule;
import com.phloc.css.decl.CSSMediaExpression;
import com.phloc.css.decl.CSSMediaQuery;
import com.phloc.css.decl.CSSMediaRule;
import com.phloc.css.decl.CSSPageRule;
import com.phloc.css.decl.CSSSelector;
import com.phloc.css.decl.CSSStyleRule;
import com.phloc.css.decl.CSSSupportsRule;
import com.phloc.css.decl.CSSViewportRule;
import com.phloc.css.decl.CascadingStyleSheet;
import com.phloc.css.decl.visit.CSSVisitor;
import com.phloc.css.decl.visit.DefaultCSSVisitor;
import com.phloc.css.handler.ICSSParseExceptionHandler;
import com.phloc.css.parser.ParseException;
import com.phloc.css.reader.CSSReader;
import com.phloc.css.writer.CSSWriterSettings;

/**
 * Not thread safe.
 */
public class CSSParser extends DefaultCSSVisitor {

    public static final String ISSUE_MESSAGE = "Issue(s) found by Parser:";

    private static final String CONDITIONAL_IF = "aura-if";
    private static final String CONDITIONAL_ELSEIF = "aura-elseif";
    private static final String CONDITIONAL_ELSE = "aura-else";
    private static final Pattern IF_PATTERN = Pattern.compile("@if[\\s\\(]+([^{\\s\\)]*)[\\s\\)\\{]*");
    private static final String IF_REPLACEMENT = "@media (" + CONDITIONAL_IF + ":$1){";
    private static final Pattern ELSEIF_PATTERN = Pattern.compile("@elseif[\\s\\(]+([^{\\s\\)]*)[\\s\\)\\{]*");
    private static final String ELSEIF_REPLACEMENT = "@media (" + CONDITIONAL_ELSEIF + ":$1){";
    private static final Pattern ELSE_PATTERN = Pattern.compile("@else[\\s\\{]*");
    private static final String ELSE_REPLACEMENT = "@media (" + CONDITIONAL_ELSE + "){";
    private static final Pattern THEME_PATTERN = Pattern.compile("(:\\s*(?:t|theme)\\s*)\\(([^\\)]+)\\)");
    private static final Pattern QUOTED_PATTERN = Pattern.compile("(?:^\"[^\"]*\"$)|(?:^'[^']*'$)");
    private static final Set<String> CUSTOM_FEATURES = ImmutableSet.of(CONDITIONAL_IF, CONDITIONAL_ELSEIF,
            CONDITIONAL_ELSE);

    private final String contents;
    private final String filename;
    private final String componentClass;
    private final Set<String> allowedConditions;
    private final StringBuffer sb = new StringBuffer();
    private final List<Exception> errors = Lists.newArrayList();
    private final List<ComponentDefRef> components = Lists.newArrayList();
    private final List<ComponentDefRef> componentsBuffer = Lists.newArrayList();
    private final ICSSParseExceptionHandler errorHandler = new ErrorHandler();
    private final Stack<ComponentDefRefImpl.Builder> conditionalBuilder = new Stack<ComponentDefRefImpl.Builder>();
    private final ICSSWriterSettings writerSettings = createWriterSettings();

    private final List<Rework<CSSSelector>> selectorRework;
    private final List<Rework<CSSDeclaration>> declarationRework;
    private final List<DynamicRework<CSSDeclaration>> dynDeclarationRework;

    private final ReworkThemeFunction themeFunction;

    /**
     * @param namespace Namespace of the {@link StyleDef} being parsed.
     * @param name Name of the {@link StyleDef} being parsed.
     * @param validateNamespace Whether to validate that the CSS is properly scoped with the correct classnames.
     * @param contents the actual css
     */
    public CSSParser(String namespace, String name, boolean validateNamespace,
            String componentClass, String contents, Set<String> allowedConditions, String filename) {
        this.filename = filename;
        this.componentClass = componentClass;
        this.contents = preProcess(contents);
        this.allowedConditions = allowedConditions;

        this.themeFunction = new ReworkThemeFunction(namespace, name, filename);

        this.selectorRework = ImmutableList.<Rework<CSSSelector>> of(
                new ReworkClassName(componentClass, validateNamespace));

        this.declarationRework = ImmutableList.of(
                new ReworkNamespaceConstants(namespace),
                new ReworkImageUrls());

        this.dynDeclarationRework = ImmutableList.<DynamicRework<CSSDeclaration>> of(
                themeFunction);
    }

    /**
     * Not thread safe. Call only once.
     * 
     * @see #results()
     */
    public List<ComponentDefRef> parse() throws QuickFixException {
        CascadingStyleSheet css = CSSReader.readFromString(contents, Charset.forName("utf-8"), ECSSVersion.CSS30,
                errorHandler);

        if (css != null) {
            CSSVisitor.visitCSS(css, this);
            flush();
        }

        if (errors.size() > 0) {
            throw new StyleParserException(formatErrors(), null);
        }

        return components;
    }

    /**
     * Get all references to {@link ThemeDef}s within the parsed CSS. Not useful unless {@link #parse()} has already
     * been called. The references are still in the raw format... the actual descriptors can be parsed using
     * {@link ThemeValueProvider}.
     */
    public Set<String> getThemeReferences() {
        return themeFunction.getAllReferences();
    }

    private String formatErrors() {
        StringBuilder sb = new StringBuilder(ISSUE_MESSAGE);
        sb.append(" (").append(filename).append(" \n");
        for (Exception error : errors) {
            sb.append('\t');
            sb.append(error.getMessage());
            if (error instanceof AuraException) {
                Location l = ((AuraException) error).getLocation();
                sb.append(" (line ");
                sb.append(l.getLine());
                sb.append(", col ");
                sb.append(l.getColumn());
                sb.append(')');
            }
            sb.append('\n');
        }
        return sb.toString();
    }

    private String preProcess(String contents) {
        // replace conditionals
        contents = IF_PATTERN.matcher(contents).replaceAll(IF_REPLACEMENT);
        contents = ELSEIF_PATTERN.matcher(contents).replaceAll(ELSEIF_REPLACEMENT);
        contents = ELSE_PATTERN.matcher(contents).replaceAll(ELSE_REPLACEMENT);

        // wrap the arguments of theme functions in quotes.
        // this bit of ugly code allows for theme values to be unquoted in the source.
        final Matcher themeMatcher = THEME_PATTERN.matcher(contents);
        boolean matched = themeMatcher.find();
        if (matched) {
            final Matcher quotedMatcher = QUOTED_PATTERN.matcher("");
            final StringBuffer newContents = new StringBuffer();
            final StringBuilder tmp = new StringBuilder(32);
            do {
                String arguments = themeMatcher.group(2);
                if (!quotedMatcher.reset(arguments).matches()) {
                    tmp.setLength(0);
                    tmp.append(themeMatcher.group(1)) // append the colon, function name, and whitespace
                            .append("(\"") // append opening bracket plus quotation mark
                            .append(themeMatcher.group(2)) // append arguments
                            .append("\")"); // append closing quote and parenthesis
                    themeMatcher.appendReplacement(newContents, tmp.toString());
                }
                matched = themeMatcher.find();
            } while (matched);
            themeMatcher.appendTail(newContents);
            contents = newContents.toString();
        }

        return contents;
    }

    @Override
    public void onBeginStyleRule(CSSStyleRule rule) {
        // perform static selector rework, then append selector content
        List<CSSSelector> reworkedSelectors = reworkSelectors(rule);
        for (int i = 0; i < reworkedSelectors.size(); i++) {
            if (i != 0) {
                addText(",");
            }
            addOrBuffer(reworkedSelectors.get(i));
        }

        // add opening declaration bracket
        addText("{");

        // perform static declaration rework, then append declaration content
        List<CSSDeclaration> reworkedDeclarations = reworkDeclarations(rule);
        for (int i = 0; i < reworkedDeclarations.size(); i++) {
            if (i != 0) {
                addText(";");
            }
            addOrBuffer(reworkedDeclarations.get(i));
        }

        // add closing declaration bracket
        addText("}");
    }

    /**
     * Performs all registered selector {@link Rework} operations on the selectors in the given rule.
     * 
     * Note that this does not fully update the original rule's selectors list! If an existing selector is changed this
     * will be reflected properly, however any selectors that are added or removed will not be reflected in the original
     * rule. This can be easily done if needed, but since we are handling the print ourselves there is currently no need
     * to perform this extra step.
     * 
     * @param rule The rule containing the selectors to rework.
     * @return All reworked selectors. Note that some of the original selectors may have been removed or new ones added.
     */
    private List<CSSSelector> reworkSelectors(CSSStyleRule rule) {
        List<CSSSelector> selectors = Lists.newArrayList(rule.getAllSelectors());

        for (Rework<CSSSelector> rework : selectorRework) {
            List<CSSSelector> reworkedSelectors = Lists.newArrayList();
            for (CSSSelector selector : selectors) {
                rework.perform(selector, reworkedSelectors, errors);
            }
            selectors = reworkedSelectors;
        }

        return selectors;
    }

    /**
     * Performs all registered declaration {@link Rework} operations on the declarations in the given rule.
     * 
     * Note that this does not fully update the original rule's declaration list! If an existing declaration is changed
     * this will be reflected properly, however any selectors that are added or removed will not be reflected in the
     * original rule. This can be easily done if needed, but since we are handing the print ourselves there is currently
     * no need to perform this extra step.
     * 
     * @param rule The rule containing the declarations to rework.
     * @return All reworked declarations. Note that some of the original declarations may have been removed or new ones
     *         added.
     */
    private List<CSSDeclaration> reworkDeclarations(CSSStyleRule rule) {
        List<CSSDeclaration> declarations = Lists.newArrayList(rule.getAllDeclarations());

        for (Rework<CSSDeclaration> rework : declarationRework) {
            List<CSSDeclaration> reworkedDeclarations = Lists.newArrayList();
            for (CSSDeclaration declaration : declarations) {
                rework.perform(declaration, reworkedDeclarations, errors);
            }
            declarations = reworkedDeclarations;
        }

        return declarations;
    }

    /**
     * Adds the selector contents to the output.
     * 
     * If we ever need to we can handle dynamic selector rework here, similar to {@link #addOrBuffer(CSSDeclaration)} .
     * 
     * @param selector Add the content from this selector.
     */
    private void addOrBuffer(CSSSelector selector) {
        addText(selector.getAsCSSString(writerSettings, 0));
    }

    /**
     * Adds the declaration content to the output.
     * 
     * If this declaration is a match for registered {@link DynamicRework} we will add all previous text content in the
     * string buffer (see {@link #addText(String)}) to the components buffer as a text component, then add the
     * {@link DynamicRework}'s {@link ComponentDefRef} to the components buffer as well.
     * 
     * @param declaration Add the content from this declaration.
     */
    private void addOrBuffer(CSSDeclaration declaration) {
        ComponentDefRef cmp = getComponentReplacement(declaration);
        if (cmp != null) {
            bufferTextCDR();
            componentsBuffer.add(cmp);
        } else {
            addText(declaration.getAsCSSString(writerSettings, 0));
        }
    }

    /**
     * Checks all registered declaration {@link DynamicRework} for a match with the given declaration. The first
     * {@link DynamicRework} to match will have it's {@link ComponentDefRef} returned (thus rework order may be
     * important).
     * 
     * @param declaration Perform rework on this declaration.
     * @return The {@link ComponentDefRef} for the rework, or null if no registered {@link DynamicRework} matches.
     */
    private ComponentDefRef getComponentReplacement(CSSDeclaration declaration) {
        for (DynamicRework<CSSDeclaration> rework : dynDeclarationRework) {
            ComponentDefRef cmp = rework.perform(declaration, errors);
            if (cmp != null) {
                return cmp;
            }
        }

        return null;
    }

    /**
     * Adds some text to the string buffer.
     * 
     * @param code The text to add.
     */
    private void addText(String code) {
        sb.append(code);
    }

    /**
     * Adds all text in the string buffer as a text component.
     */
    private void addTextCDR() {
        if (sb.length() > 0) {
            components.add(createTextCDR());
        }
    }

    /**
     * Adds all text in the string buffer as a text component to the buffered components list.
     */
    private void bufferTextCDR() {
        if (sb.length() > 0) {
            componentsBuffer.add(createTextCDR());
        }
    }

    /**
     * Creates a text component with the contents from the string buffer. The buffer is then reset.
     */
    private ComponentDefRef createTextCDR() {
        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor("aura:text");
        builder.setAttribute("value", sb.toString());
        sb.setLength(0);
        return builder.build();
    }

    /**
     * Appends components in the components buffer to the components list, then appends any text in the string buffer as
     * a text component to the components list.
     */
    private void flush() {
        components.addAll(componentsBuffer);
        componentsBuffer.clear();
        addTextCDR();
    }

    private String validateConditional(CSSMediaExpression exp) {
        CSSExpression val = exp.getValue();
        if (val != null) {
            String value = val.getAsCSSString(writerSettings, 0).toUpperCase();
            if (!allowedConditions.contains(value)) {
                throw new AuraRuntimeException("Unknown browser: [" + value + "]. The allowed conditionals are: "
                        + allowedConditions);
            }
            return value;
        }
        return null;
    }

    @Override
    public void onBeginFontFaceRule(CSSFontFaceRule rule) {
        // currently no support for any rework (e.g., theme function)
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginKeyframesBlock(CSSKeyframesBlock rule) {
        // handled already with onBeginKeyframesRule
        // addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginKeyframesRule(CSSKeyframesRule rule) {
        // currently no support for any rework (e.g., theme function)
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginPageRule(CSSPageRule rule) {
        // currently no support for any rework (e.g., theme function)
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginSupportsRule(CSSSupportsRule rule) {
        // currently no support for any rework (e.g., theme function)
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginViewportRule(CSSViewportRule rule) {
        // currently no support for any rework (e.g., theme function)
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    /**
     * We distinguish between regular media queries and our "fake" media queries used for conditionals. Anything with
     * not exactly one query and one expression is treated like a normal media query, and the contents are output
     * normally. Anything not matching one of our custom "feature" names is also treated like a normal media query.
     */
    @Override
    public void onBeginMediaRule(CSSMediaRule rule) {
        // our custom conditionals should have only one query
        if (rule.getMediaQueryCount() != 1) {
            addText(getMediaQueryOpen(rule));
            return;
        }

        CSSMediaQuery query = rule.getMediaQueryAtIndex(0);

        // our custom conditionals should have only one expression
        if (query.getMediaExpressionCount() != 1) {
            addText(getMediaQueryOpen(rule));
            return;
        }

        CSSMediaExpression exp = query.getMediaExpression(0);
        String feature = exp.getFeature();

        // check against our known conditional "feature" names
        if (!CUSTOM_FEATURES.contains(feature)) {
            addText(getMediaQueryOpen(rule));
            return;
        }

        // we have now confirmed that this is an aura conditional.
        String value = validateConditional(exp);
        Expression expression = null;

        if (value != null) {
            Location l = new Location(componentClass, exp.getSourceLocation().getFirstTokenBeginLineNumber(),
                    exp.getSourceLocation().getFirstTokenBeginColumnNumber(), -1);
            try {
                expression = AuraImpl.getExpressionAdapter().buildExpression("$Browser.is" + value, l);
            } catch (AuraValidationException e) {
                throw new AuraRuntimeException(e, l);
            }
        }

        flush();

        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor("aura:if");
        conditionalBuilder.push(builder);

        if (feature.equalsIgnoreCase(CONDITIONAL_IF)) {
            builder.setAttribute("isTrue", expression);
        } else if (feature.equalsIgnoreCase(CONDITIONAL_ELSEIF)) {
            builder.setAttribute("isTrue", expression);
        } else if (feature.equalsIgnoreCase(CONDITIONAL_ELSE)) {
            builder.setAttribute("isTrue", true);
        } else {
            // should never get here unless the code in this class itself is screwed up
            throw new AuraRuntimeException("Feature name missing from known set of conditionals in CSS Parser.");
        }

    }

    /** Gets the media query text up until and including the opening brace */
    private String getMediaQueryOpen(CSSMediaRule rule) {
        StringBuilder builder = new StringBuilder(32);
        builder.append("@media ");

        for (int i = 0; i < rule.getMediaQueryCount(); i++) {
            if (i != 0) {
                builder.append(",");
            }
            builder.append(rule.getMediaQueryAtIndex(i).getAsCSSString(writerSettings, 0));
        }

        builder.append("{");
        return builder.toString();
    }

    @Override
    public void onEndMediaRule(CSSMediaRule rule) {
        if (conditionalBuilder.isEmpty()) {
            addText("}"); // close the media query
            return;
        }

        ComponentDefRefBuilder builder = conditionalBuilder.pop();
        bufferTextCDR();
        builder.setAttribute("body", Lists.newArrayList(componentsBuffer));
        componentsBuffer.clear();
        try {
            ComponentDefRef cdr = builder.build();
            if (conditionalBuilder.isEmpty()) {
                components.add(cdr);
            } else {
                conditionalBuilder.peek().setAttribute("else", cdr);
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }

    private class ErrorHandler implements ICSSParseExceptionHandler {
        @Override
        public void onException(ParseException ex) {
            errors.add(ex);
        }
    };

    private static ICSSWriterSettings createWriterSettings() {
        return new CSSWriterSettings(ECSSVersion.CSS30)
                // normally this would consult the current mode from context, however since everything else in this
                // class is outputting optimized content irrespective of the mode, there's no point in doing otherwise
                // here. A future task may be to change this setting and this class to pretty print in dev mode.
                .setOptimizedOutput(true)
                // phloc doesn't preserve whether the url is quoted or unquoted. Globally deciding one or the other
                // is error prone. Thus we are forced to add sub-par logic to handle this in ReworkImageUrls.java
                .setQuoteURLs(false);
    }

    public static void main(String[] args) {
        try {
            AuraContext context = Aura.getContextService().startContext(Mode.DEV, Format.JSON, Access.AUTHENTICATED);
            context.setClient(new Client("Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)"));
            System.out.println(Aura.getDefinitionService().getDefinition("ui.button", StyleDef.class).getCode());
        } catch (DefinitionNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (QuickFixException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
            Aura.getContextService().endContext();
        }
    }
}
