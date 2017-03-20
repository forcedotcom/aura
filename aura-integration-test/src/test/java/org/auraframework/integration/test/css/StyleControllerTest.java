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
package org.auraframework.integration.test.css;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.controller.StyleController;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.junit.Test;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;

/**
 * Basic tests for {@link StyleController}.
 * <p>
 * More tests in test/components/dynamicStylingTest
 */
public class StyleControllerTest extends StyleTestCase {
    private static final String ACTION = "java://org.auraframework.impl.controller.StyleController/ACTION$applyTokens";

    @Inject
    private InstanceService instanceService;

    /** test basic usage */
    @Test
    public void testApplyTokens() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(".THIS{margin: 10px; color: t(color);}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format(".%s {color:green}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    /** at-rules with tokens inside should be included if applicable */
    @Test
    public void testTokenInsideMediaQuery() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(
                "@media screen {.THIS{margin: 10px; color: t(color);}} .THIS {color: red}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format("@media screen {\n  .%s {color:green}\n}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    /** at rules without tokens inside should not be included */
    @Test
    public void testNoTokenInsideMediaQuery() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(
                "@media screen {.THIS{margin: 10px;}} .THIS {color:t(color)}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format(".%s {color:green}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    /** at-rules using a token directly should be included if applicable */
    @Test
    public void testMediaQueryUsingTokenDirectly() throws Exception {
        addNsTokens(tokens().token("query", "all and (min-width:300px)"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("query", "screen"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(
                "@media t(query) {.THIS{color:red}}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format("@media screen {\n  .%s {color:red}\n}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    /** at-rules not using a token anywhere should not be included */
    @Test
    public void testMediaQueryNotUsingTokenDirectlyNorInside() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(
                "@media screen {.THIS{color:red}} .THIS{color: t(color);}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format(".%s {color:green}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    @Test
    public void testTokenInsideConditional() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(
                "@if(OTHER) {.THIS{margin: 10px; color: t(color);}} .THIS {color: red}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format(".%s {color:green}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    @Test
    public void testNoTokenInsideConditional() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(
                "@if(OTHER) {.THIS{margin: 10px}} .THIS {color: t(color)}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format(".%s {color:green}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    /** if a var is an alias, references to the aliased var should be included */
    @Test
    public void testCrossReference() throws Exception {
        // color2 points to color1
        addNsTokens(tokens().token("color1", "red").token("color2", "{!color1}").token("color3", "yellow"));

        // token overrides color1
        DefDescriptor<TokensDef> toApply = addSeparateTokens(tokens().token("color1", "green"));

        DefDescriptor<ApplicationDef> appDesc = addContextApp("<aura:application/>");
        // style points to color2, it should be included because color1 is overridden
        DefDescriptor<StyleDef> style = addContextAppBundleStyle(".THIS{color: t(color2); background: t(color3);}");

        Action action = runAction(appDesc, toApply.getDescriptorName());
        assertEquals("errors:" + action.getErrors(), State.SUCCESS, action.getState());

        String expected = String.format(".%s {color:green}\n", 
        		definitionService.getDefinition(style).getClassName());
        assertEquals(expected, action.getReturnValue());
    }

    private Action runAction(DefDescriptor<ApplicationDef> appDesc, String descriptor) throws Exception {
        // restart the context with the new app
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        AuraContext ctx = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
        ctx.setApplicationDescriptor(appDesc);
        definitionService.updateLoaded(appDesc);

        Map<String, Object> params = new HashMap<>();
        params.put("descriptors", Lists.newArrayList(descriptor));
        params.put("extraStyles", ImmutableList.<String>of());
        Action action = instanceService.getInstance(ACTION, ActionDef.class, params);
        action.run();
        return action;
    }
}
