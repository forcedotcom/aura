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
package org.auraframework.http;

import com.google.common.collect.ImmutableList;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.ContextService;
import org.auraframework.service.CSPInliningService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;

import javax.inject.Inject;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import static org.auraframework.http.AuraCSPInliningService.InlineScriptMode.NONCE;
import static org.auraframework.http.AuraCSPInliningService.InlineScriptMode.UNSUPPORTED;

@ServiceComponent
public class AuraCSPInliningService implements CSPInliningService {
	static final long serialVersionUID = -5862171003552767370L;
	
	static String INLINE = "<script>%s</script>";
	static String INLINE_NONCE = "<!--\"'--><script nonce=\"%s\">%s</script>";
	static String NONCE_INJECTION_PROTECTION = "<!--\"'-->";

    public enum InlineScriptMode{
        UNSUPPORTED(""),
        HASH("'sha256-%s'"),
        NONCE("'nonce-%s'");

        private String format;

        InlineScriptMode(String format){
            this.format = format;
        }

        public String toDirective(String... params){
            return String.format(format, (Object[]) params);
        }
    }

    @Inject
    private ContextService contextService;

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
			case NONCE:
			case UNSUPPORTED:
			default:
				break;
        }
    }

    @Override
    public void writeInlineScriptAttributes(Appendable out) throws IOException {
        if (getInlineMode() == NONCE){
            out.append(String.format(" nonce=\"%s\" ", contextService.getCurrentContext().getScriptNonce()));
        }
    }

    @Override
    public void writeInlineScript(String script, Appendable out) throws IOException {
        if (script != null && script.length() > 0) {
            processScript(script);
            switch(getInlineMode()){
                case HASH:
                    out.append(String.format(INLINE, script));
                    break;
                case NONCE:
                    out.append(String.format(INLINE_NONCE, script));
                    break;
				case UNSUPPORTED:
				default:
					break;
            }

        }
    }

    @Override
    public boolean isSupported() {
        return getInlineMode() != UNSUPPORTED;
    }

    @Override
    public void preScriptAppend(Appendable out) throws IOException {
        switch(getInlineMode()){
            case UNSUPPORTED:
            case HASH:
                return;
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

    InlineScriptMode getInlineMode() {
        return UNSUPPORTED;
    }
}
