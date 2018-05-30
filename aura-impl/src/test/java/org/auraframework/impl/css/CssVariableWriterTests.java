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
package org.auraframework.impl.css;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;

import org.auraframework.css.StyleContext;
import org.auraframework.css.TokenCache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TokensDef;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static junit.framework.TestCase.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class CssVariableWriterTests {

    DefinitionService definitionService;
    ContextService contextService;
    AuraContext auraContext;
    DefDescriptor<ApplicationDef> appDesc;
    CssVariableWriter target;
    ApplicationDef app;
    List<DefDescriptor<TokensDef>> tokens;
    StyleContext styleContext;
    TokenCache tokenCache;
    Set<String> tokenNames;

    @Before
    public void setup() throws Exception{
        definitionService = mock(DefinitionService.class);
        contextService = mock(ContextService.class);
        auraContext = mock(AuraContext.class);
        appDesc = mock(ApplicationDefDescriptor.class);
        app = mock(ApplicationDef.class);
        tokens = new ArrayList<>();
        styleContext = mock(StyleContext.class);
        tokenCache = mock(TokenCache.class);
        tokenNames = new HashSet<>();

        doReturn(DefType.APPLICATION).when(appDesc).getDefType();
        doReturn(auraContext).when(contextService).getCurrentContext();
        doReturn(appDesc).when(auraContext).getApplicationDescriptor();
        doReturn(app).when(definitionService).getDefinition(appDesc);
        doReturn(tokens).when(app).getTokenOverrides();
        doReturn(styleContext).when(auraContext).getStyleContext();
        doReturn(tokenCache).when(styleContext).getTokens();
        doReturn(tokenNames).when(tokenCache).getNames(tokens);

        target = new CssVariableWriter(definitionService, contextService);
    }


    @Test
    public void testNoTokenDefs() throws Exception {
        StringBuilder sb = new StringBuilder();
        target.write(sb);

        int expected = 0;
        int actual = sb.length();

        assertEquals("Because there was no token definitions. There should been 0 modifications to the Appenable", expected, actual);
    }

    @Test
    public void tokenIsAdded() throws Exception{
        DefDescriptor<TokensDef> tokensDef = mock(TokenDefDescriptor.class);
        tokens.add(tokensDef);
        tokenNames.addAll(ImmutableList.of("token1;", "token2", "token3"));

        Optional<Object> value1 = Optional.of((Object) "value1");
        Optional<Object> value2 = Optional.of((Object) "/* bad value ");
        Optional<Object> value3 = Optional.of((Object) "value3");

        doReturn(value1).when(tokenCache).getToken("token1;");
        doReturn(value2).when(tokenCache).getToken("token2");
        doReturn(value3).when(tokenCache).getToken("token3");

        StringBuilder sb = new StringBuilder();
        target.write(sb);

        String expected = ":root{ \n" +
                          "--lwc-token3: value3;\n" +
                          " } \n";
        String actual = sb.toString();

        assertEquals("The CSS variable structure is wrong", expected, actual);
    }


    interface ApplicationDefDescriptor extends DefDescriptor<ApplicationDef> {}
    interface TokenDefDescriptor extends DefDescriptor<TokensDef>{}

}
