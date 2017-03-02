<!--

    Copyright (C) 2013 salesforce.com, inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<aura:application access="GLOBAL">
    <h1>A very expensive app to load</h1>
    <p>
        This app is expensive because it creates a TON of components. Primarily those components are the building blocks of an application, divs, inputs, etc. 
        The idea is to get a feel for the performance of the primary components of Aura and figure out how to optimize the heck out of them.
    </p>
    <br/>    
    <b>Time to load and render the expensive app</b>
    <div aura:id="load"></div>
    
    <br/>
    <b>Total amount of components on the page</b>
    <div aura:id="count"></div>
    <ui:button press="{!c.updateCount}" label="Update"/>

    <br/><br/>
    <b>Time to Unrender</b>
    <div aura:id="unrender">n/a</div>

    <br/><br/>
    <b>Time to Render</b>
    <div aura:id="render">n/a</div>

    <br/><br/>
    <b>Time for Raw Operation</b>
    <div aura:id="raw">n/a</div>

    <br/><br/>

    <ui:inputCheckbox aura:id="record" label="Record Profiles" /><br/>
    <ui:button press="{!c.onRender}" label="Render"/>    
    <ui:button press="{!c.onUnrender}" label="Unrender"/>    
    <ui:button press="{!c.onRaw}" label="Raw"/>    


    <br/>
    <div aura:id="appendTo"></div>
    <br/><br/>
</aura:application>