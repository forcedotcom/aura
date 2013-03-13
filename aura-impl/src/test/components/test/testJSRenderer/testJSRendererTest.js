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
({
    /**
     * Verify the basic structure of Javascript Renderers.
     * The render, rerender and unrender functions are objects on the RendererDef at the client side.
     * @hierarchy Aura.Components.Renderer
     * @priority medium
     * @userStory a07B0000000Ekdr
     */
    testRendererDefProperties:{
        test:function(cmp){
            //Access the Renderer Def of test:testJSRenderer
            aura.test.assertNotNull(cmp.getDef().getRendererDef());
            var rendererDef = cmp.getDef().getRendererDef();
            //Make sure what you actually accessed was a RendererDef
            aura.test.assertEquals('RendererDef',rendererDef.auraType,"Was expecting to find a rendererDef object.");
            //Verify that the render object is initialized on the RendererDef
            aura.test.assertNotNull(rendererDef.renderMethod, "Render object not found on the renderer def of this componentDef.");
            //Verify that the rerender object is initialized on the RendererDef
            aura.test.assertNotNull(rendererDef.rerenderMethod, "ReRender object not found on the renderer def of this componentDef.");
        }
    }
})
