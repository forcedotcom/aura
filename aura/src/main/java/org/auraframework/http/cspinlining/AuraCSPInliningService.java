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
package org.auraframework.http.cspinlining;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.NONCE;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.common.base.MoreObjects;
import com.google.common.collect.ImmutableList;

@ServiceComponent
public class AuraCSPInliningService implements CSPInliningService {
    static final long serialVersionUID = -5862171003552767370L;
    
    static String INLINE = "<script>%s</script>";
    static String INLINE_NONCE = "<!--\"'--><script nonce=\"%s\">%s</script>";
    static String NONCE_INJECTION_PROTECTION = "<!--\"'-->";

    private List<CSPInliningRule> rules;

    protected ContextService contextService;

    @Autowired
    public void setContextService(ContextService contextService){this.contextService = contextService;}

    @Autowired(required = false)
    public void setRules(List<CSPInliningRule> rules){this.rules = rules;}

    @Override
    public List<String> getCurrentScriptDirectives() {
        AuraContext context = contextService.getCurrentContext();
        List<String> directives = new ArrayList<>();
        InlineScriptMode scriptMode = getInlineMode();
        switch (scriptMode){
            case HASH:
                ImmutableList<String> scriptHashes = context.getScriptHashes();
                for (String hash: scriptHashes){
                    directives.add(scriptMode.toDirective(hash));
                }
                break;
            case NONCE:
                directives.add(scriptMode.toDirective(context.getScriptNonce()));
                break;
            case UNSUPPORTED:
            case UNSAFEINLINE:
            default:
                break;
        }
        return directives;
    }

    @Override
    public void processScript(String script) {
        switch(getInlineMode()){
            case HASH:
                contextService.getCurrentContext().addScriptHash(hashScript(script));
                break;
            case UNSAFEINLINE:
            case NONCE:
            case UNSUPPORTED:
            default:
                break;
        }
    }

    @Override
    public void writeInlineScriptAttributes(Appendable out) throws IOException {
        if (getInlineMode() == NONCE){
            ensureNoncePresent();
            out.append(String.format(" nonce=\"%s\" ", contextService.getCurrentContext().getScriptNonce()));
        }
    }

    @Override
    public void writeInlineScript(String script, Appendable out) throws IOException {
        if (script != null && script.length() > 0) {
            processScript(script);
            switch(getInlineMode()){
                case UNSAFEINLINE:
                case HASH:
                    out.append(String.format(INLINE, script));
                    break;
                case NONCE:
                    ensureNoncePresent();
                    out.append(String.format(INLINE_NONCE, contextService.getCurrentContext().getScriptNonce(), script));
                    break;
                case UNSUPPORTED:
                default:
                    break;
            }

        }
    }

    @Override
    public InlineScriptMode getInlineMode() {
        AuraContext context = contextService.getCurrentContext();
        if (context.getInlineScriptMode() != null) {
            return context.getInlineScriptMode();
        }
        CSPInliningCriteria criteria = new CSPInliningCriteria(contextService.getCurrentContext());
        List<CSPInliningRule> rules = MoreObjects.firstNonNull(this.rules, ImmutableList.<CSPInliningRule>of());

        rules.stream().filter(r -> r.isRelevant(criteria)).forEach(r -> r.process(criteria));
        context.setInlineScriptMode(criteria.getMode());

        return criteria.getMode();
    }

    @Override
    public void preScriptAppend(Appendable out) throws IOException {
        switch(getInlineMode()){
            case UNSAFEINLINE:
            case UNSUPPORTED:
            case HASH:
                break;
            case NONCE:
                out.append(NONCE_INJECTION_PROTECTION);
        }
    }

    String hashScript(String script) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(script.getBytes());
            String base64ShaHash = Base64.getEncoder().encodeToString(digest.digest());
            return base64ShaHash;

        } catch (NoSuchAlgorithmException e) {
            throw new AuraRuntimeException(e);
        }
    }

    private void ensureNoncePresent() {
        AuraContext currentContext = contextService.getCurrentContext();
        if (currentContext.getScriptNonce() == null){
            Random r = new Random();
            String nonce = new UUID(r.nextLong(), r.nextLong()).toString();
            currentContext.setScriptNonce(nonce);
        }
    }

    public List<CSPInliningRule> getRules() {
        return rules;
    }
}
