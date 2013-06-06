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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Stack;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.expression.Expression;
import org.auraframework.http.AuraBaseServlet;
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

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.phloc.css.ECSSVersion;
import com.phloc.css.ICSSWriterSettings;
import com.phloc.css.decl.CSSDeclaration;
import com.phloc.css.decl.CSSExpression;
import com.phloc.css.decl.CSSExpressionMemberFunction;
import com.phloc.css.decl.CSSExpressionMemberTermSimple;
import com.phloc.css.decl.CSSExpressionMemberTermURI;
import com.phloc.css.decl.CSSFontFaceRule;
import com.phloc.css.decl.CSSKeyframesBlock;
import com.phloc.css.decl.CSSKeyframesRule;
import com.phloc.css.decl.CSSMediaExpression;
import com.phloc.css.decl.CSSMediaQuery;
import com.phloc.css.decl.CSSMediaRule;
import com.phloc.css.decl.CSSPageRule;
import com.phloc.css.decl.CSSSelector;
import com.phloc.css.decl.CSSSelectorSimpleMember;
import com.phloc.css.decl.CSSStyleRule;
import com.phloc.css.decl.CSSSupportsRule;
import com.phloc.css.decl.CSSViewportRule;
import com.phloc.css.decl.CascadingStyleSheet;
import com.phloc.css.decl.ICSSExpressionMember;
import com.phloc.css.decl.ICSSSelectorMember;
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

    private static final String THIS_NAMESPACE = ".THIS";
    private static final String CONDITIONAL_IF = "aura-if";
    private static final String CONDITIONAL_ELSEIF = "aura-elseif";
    private static final String CONDITIONAL_ELSE = "aura-else";
    private static final HashSet<String> NON_REFINERS = Sets.newHashSet(" ", ":", ">", "+", "|");
    public static final String ISSUE_MESSAGE = "Issue(s) found by Parser:";
    private static final Pattern IF_PATTERN = Pattern.compile("@if[\\s\\(]+([^{\\s\\)]*)[\\s\\)\\{]*");
    private static final String IF_REPLACEMENT = "@media ("+CONDITIONAL_IF+":$1){";
    private static final Pattern ELSEIF_PATTERN = Pattern.compile("@elseif[\\s\\(]+([^{\\s\\)]*)[\\s\\)\\{]*");
    private static final String ELSEIF_REPLACEMENT = "@media ("+CONDITIONAL_ELSEIF+":$1){";
    private static final Pattern ELSE_PATTERN = Pattern.compile("@else[\\s\\{]*");
    private static final String ELSE_REPLACEMENT = "@media ("+CONDITIONAL_ELSE+"){";

    private final boolean validateNamespace;
    private final String componentClass;
    private final String namespace;
    private final String contents;
    private final Set<String> allowedConditions;
    private Map<String, String> nsDefs = null;
    private StyleParserResultHolder resultHolder;
    private ICSSParseExceptionHandler errorHandler;
    private List<Exception> errors;
    private final List<ComponentDefRef> components = Lists.newArrayList();
    private final StringBuffer sb = new StringBuffer();
    private final ICSSWriterSettings writerSettings = new CSSWriterSettings(ECSSVersion.CSS30).setOptimizedOutput(!Aura.getContextService().getCurrentContext().getMode().isDevMode());
    private final Stack<ComponentDefRefImpl.Builder> conditionalBuilder = new Stack<ComponentDefRefImpl.Builder>();
    private final String filename;

    /**
     * @param namespace
     * @param contents the actual css
     */
    public CSSParser(String namespace, boolean validateNamespace, String componentClass, String contents,
            Set<String> allowedConditions, String filename) {
        this.validateNamespace = validateNamespace;
        this.componentClass = componentClass;
        this.namespace = namespace;
        this.contents = preProcess(contents);
        this.allowedConditions = allowedConditions;
        this.filename = filename;
    }

    /**
     * Not thread safe.
     */
    public StyleParserResultHolder parse() throws QuickFixException {
        errorHandler = new ErrorHandler();
        resultHolder = new StyleParserResultHolder();
        errors = Lists.newArrayList();

        CascadingStyleSheet css = CSSReader.readFromString(contents, Charset.forName("utf-8"), ECSSVersion.CSS30, errorHandler);



        if(css != null){
            CSSVisitor.visitCSS(css, this);

            addTextCDR();
        }

        if(errors.size() > 0){
            throw new StyleParserException(formatErrors(), null);
        }
        resultHolder.setComponents(components);
        return resultHolder;
    }

    private String formatErrors() {
        StringBuilder sb = new StringBuilder(ISSUE_MESSAGE);
        sb.append(" (").append(filename).append(" \n");
        for (Exception error : errors) {
            sb.append('\t');
            sb.append(error.getMessage());
            if(error instanceof AuraException){
                Location l = ((AuraException)error).getLocation();
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

    private String preProcess(String contents){
        contents = IF_PATTERN.matcher(contents).replaceAll(IF_REPLACEMENT);
        contents = ELSEIF_PATTERN.matcher(contents).replaceAll(ELSEIF_REPLACEMENT);
        contents = ELSE_PATTERN.matcher(contents).replaceAll(ELSE_REPLACEMENT);
        return contents;
    }

    private void verifyAndReplaceComponentClass(CSSStyleRule rule){
        for(CSSSelector selector : rule.getAllSelectors()){
            boolean found = false;
            boolean replacement = false;
            boolean illegal = false;
            List<ICSSSelectorMember> replacementMembers = Lists.newArrayList();
            for(int i=0;i<selector.getMemberCount();i++){
                ICSSSelectorMember member = selector.getMemberAtIndex(i);
                String name = member.getAsCSSString(writerSettings, 0);
                if(!found && NON_REFINERS.contains(name)){
                    illegal = true;
                }
                if(name.equals(THIS_NAMESPACE)){
                    replacement = true;
                    found = true;
                    replacementMembers.add(new CSSSelectorSimpleMember(componentClass));
                }else{
                    if(name.equals(componentClass)){
                        found = true;
                    }
                    replacementMembers.add(member);
                }


            }
            if(validateNamespace && (!found || illegal)){
                Location l = new Location(componentClass, selector.getSourceLocation().getFirstTokenBeginLineNumber(), selector.getSourceLocation().getFirstTokenBeginColumnNumber(),-1);
                errors.add(new StyleParserException("CSS selectors must include component class: \"" + componentClass + "\"", l));
            }
            if(replacement){


                while(selector.getMemberCount()>0){
                    selector.removeMember(0);
                }

                for(int i=0;i<replacementMembers.size();i++){
                    selector.addMember(replacementMembers.get(i));
                }
            }
        }
    }

    private String resolveToken(String key){
        String ret = null;
        try {
            if(nsDefs == null){
                NamespaceDef namespaceDef = Aura.getDefinitionService().getDefinition(namespace, NamespaceDef.class);
                nsDefs = namespaceDef.getStyleTokens();
            }
            if(nsDefs.containsKey(key)){
                ret = nsDefs.get(key);
            }
        } catch (DefinitionNotFoundException dnfe) {
            // ignore.
        } catch(QuickFixException e){
            throw new AuraRuntimeException(e);
        }
        return ret;
    }

    private ICSSExpressionMember replaceMemberTokens(ICSSExpressionMember member){
        if(member instanceof CSSExpressionMemberFunction){
            CSSExpressionMemberFunction func = (CSSExpressionMemberFunction)member;
            CSSExpression expr = func.getExpression();
            List<ICSSExpressionMember> newMembers = Lists.newArrayList();
            for(int k=0;k<expr.getMemberCount();k++){
                newMembers.add(replaceMemberTokens(expr.getMemberAtIndex(k)));
            }
            while(expr.getMemberCount() > 0){
                expr.removeMember(0);
            }
            for(int j=0;j<newMembers.size();j++){
                expr.addMember(newMembers.get(j));
            }
        }else if(member instanceof CSSExpressionMemberTermURI){
            CSSExpressionMemberTermURI uri = (CSSExpressionMemberTermURI)member;
            String url = uri.getURIString();
            url = url.trim().replaceAll("(^['\"])|(['\"]$)", "");
            if (url.startsWith("/") && shouldAddCacheBuster()) {
                url = AuraBaseServlet.addCacheBuster(url);
            }
            resultHolder.addImageURL(url);
            return new CSSExpressionMemberTermURI(url);
        }else{

            String value = member.getAsCSSString(writerSettings, 0);
            if(value.matches("[A-Z]+")){
                String val = resolveToken(value);
                if(val != null){
                    return new CSSExpressionMemberTermSimple(val);
                }
            }
        }
        return member;
    }

    private void replaceNamespaceTokens(CSSStyleRule rule){

        for(int i=0;i<rule.getDeclarationCount();i++){
            CSSDeclaration decl = rule.getDeclarationAtIndex(i);
            CSSExpression expr = decl.getExpression();
            List<ICSSExpressionMember> newMembers = Lists.newArrayList();
            for(int j=0;j<expr.getMemberCount();j++){
                ICSSExpressionMember member = expr.getMemberAtIndex(j);

                newMembers.add(replaceMemberTokens(member));
            }
            while(expr.getMemberCount() > 0){
                expr.removeMember(0);
            }
            for(int j=0;j<newMembers.size();j++){
                expr.addMember(newMembers.get(j));
            }
        }
    }

    private boolean shouldAddCacheBuster() {
        return Aura.getConfigAdapter().isAuraJSStatic()
                && Aura.getContextService().getCurrentContext().getMode() != Mode.DEV;
    }

    @Override
    public void onBeginStyleRule(CSSStyleRule rule) {

        verifyAndReplaceComponentClass(rule);
        replaceNamespaceTokens(rule);

        addText(rule.getAsCSSString(writerSettings, 0));
    }

    private void addText(String code){
        sb.append(code);
    }

    private ComponentDefRef createTextCDR(){
        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor("aura:text");
        builder.setAttribute("value", sb.toString());
        sb.setLength(0);
        return builder.build();
    }

    private void addTextCDR(){
        if(sb.length() > 0){
            components.add(createTextCDR());
        }
    }

    private String validateConditional(CSSMediaExpression exp){
        CSSExpression val = exp.getValue();
        if(val != null){
            String value = val.getAsCSSString(writerSettings, 0).toUpperCase();
            if (!allowedConditions.contains(value)) {
                throw new AuraRuntimeException("Unknown browser: [" + value + "]. The allowed conditionals are: " + allowedConditions);
            }
            return value;
        }
        return null;
    }

    @Override
    public void onBeginFontFaceRule(CSSFontFaceRule rule) {
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginKeyframesBlock(CSSKeyframesBlock rule) {
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginKeyframesRule(CSSKeyframesRule rule) {
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginPageRule(CSSPageRule rule) {
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginSupportsRule(CSSSupportsRule rule) {
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginViewportRule(CSSViewportRule rule) {
        addText(rule.getAsCSSString(writerSettings, 0));
    }

    @Override
    public void onBeginMediaRule(CSSMediaRule rule) {
        for(int i=0;i<rule.getMediaQueryCount();i++){
            CSSMediaQuery query = rule.getMediaQueryAtIndex(i);

            for(int j=0;j<query.getMediaExpressionCount();j++){
                CSSMediaExpression exp = query.getMediaExpression(j);

                String feature = exp.getFeature();
                String value = validateConditional(exp);
                Expression expression = null;
                if(value != null){
                    Location l = new Location(componentClass, exp.getSourceLocation().getFirstTokenBeginLineNumber(), exp.getSourceLocation().getFirstTokenBeginColumnNumber(),-1);
                    try {
                        expression = AuraImpl.getExpressionAdapter().buildExpression("$Browser.is"+value, l);
                    } catch (AuraValidationException e) {
                        throw new AuraRuntimeException(e, l);
                    }
                }

                if(feature.equalsIgnoreCase(CONDITIONAL_IF)){

                    addTextCDR();
                    ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
                    conditionalBuilder.push(builder);

                    builder.setAttribute("isTrue", expression);
                    builder.setDescriptor("aura:if");
                }else if(feature.equalsIgnoreCase(CONDITIONAL_ELSEIF)){
                    addTextCDR();
                    ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
                    conditionalBuilder.push(builder);
                    builder.setAttribute("isTrue", expression);
                    builder.setDescriptor("aura:if");
                }else if(feature.equalsIgnoreCase(CONDITIONAL_ELSE)){
                    addTextCDR();
                    ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
                    conditionalBuilder.push(builder);
                    builder.setAttribute("isTrue", true);
                    builder.setDescriptor("aura:if");
                }else{
                    addText(rule.getAsCSSString(writerSettings, 0));
                }
            }
        }
    }

    @Override
    public void onEndMediaRule(CSSMediaRule rule) {
        List<ComponentDefRef> body = Lists.newArrayList(createTextCDR());
        ComponentDefRefBuilder builder = conditionalBuilder.pop();
        builder.setAttribute("body", body);
        try {
            ComponentDefRef cdr = builder.build();
            if(conditionalBuilder.isEmpty()){
                components.add(cdr);
            }else{
                conditionalBuilder.peek().setAttribute("else", cdr);
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }

    private class ErrorHandler implements ICSSParseExceptionHandler{

        @Override
        public void onException(ParseException ex) {
            errors.add(ex);
        }
    };

    public static void main(String[] args) {
        try{
            AuraContext context = Aura.getContextService().startContext(Mode.DEV, Format.JSON, Access.AUTHENTICATED);
            context.setClient(new Client("Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)"));

            System.out.println(Aura.getDefinitionService().getDefinition("ui.button", StyleDef.class).getCode());
        } catch (DefinitionNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (QuickFixException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }finally{
            Aura.getContextService().endContext();
        }
    }
}
