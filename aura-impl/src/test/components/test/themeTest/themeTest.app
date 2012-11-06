<!--

    Copyright (C) 2012 salesforce.com, inc.

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
<aura:application template="test:themeTestTemplate">

    <ui:message>In themeTest.app</ui:message>
    <div>
        <p>Testing P tag.</p>
        <br/>
        <span>This SPAN has style applied from the template.</span>
        <br/>
        <br/>

        <div class="templateRule">
            This DIV has style applied from the template.
        </div>
        <br/>

        <div class="color br" aura:id="box">
            This box is white in color, if your browser is not Firefox.
        </div>
        <br/>

        <ui:block class="color">
            This is a ui:block
        </ui:block>

        <br/>
        <br/>

    </div>

    <p>Many Divs:</p>
    <br/>
    <br/>
    <div>
        Div 1
        <div>
            Div 2
            <div>
                Div 3
                <div class="div4">
                    Div 4
                    <div class="div4 div5">
                        Div 5
                    </div>
                </div>
            </div>
        </div>
    </div>
</aura:application>
