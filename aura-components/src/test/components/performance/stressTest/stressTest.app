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
<aura:application>
    <h1>Component Creation Stress Test</h1>
    <p>
        Clicking the button creates 50,000 aura:html components, and 50,000 aura:text components.
        It then logs to the console the time it took to create all these components.
    </p>
    <p>
        <ui:inputCheckbox aura:id="profileCheckbox" label="Record Profile"/>
    </p>
	<ui:button press="{!c.run}" label="Run Performance Test"/>
</aura:application>