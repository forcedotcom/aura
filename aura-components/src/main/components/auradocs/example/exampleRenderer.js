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
({
    render : function ExampleRenderer(cmp){
        var attributes = cmp.getAttributes();
        var desc = new DefDescriptor(attributes.getRawValue("descriptor"));
        var ret = this.superRender();
        var url = "/"+desc.getNamespace()+"/"+desc.getName()+".cmp";
        var locationBar = cmp.find("locationBar").getElement();
        locationBar.value = url;
        var frame = cmp.find("frame").getElement();
        var cachebuster = Math.random() * 100000;
        var app = $A.getContext().getApp();
        frame.src = url + "?aura.cb="+cachebuster + "&aura.mode=" + $A.getContext().getMode() + (app?"&aura.app="+app:"");



        return ret;
    }
})
