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
<aura:application>
    <aura:attribute type="String" name="component" default="aura:application" />
    <aura:attribute type="Boolean" name="clearPreloads" default="true"/>
    <p>
    To use this application, please specify the app/cmp on the request (?component=&lt;namespace&gt;:&lt;name&gt;)
    The descriptor must be for either an application or a component. You can also turn on or off the 'clearPreloads'
    flag, which controls whether the full set of preloads appears in the dependencies. By default, it is on, meaning
    that no preloads are shown.
    This application will show the full set of dependencies for any definition given. If there is an error processing
    the definition, then the top line will be highlighted as pink, and any definitions that could not be retrieved
    may also show up in the list.
    </p>
    <auradev:showDependencies component="{!v.component}" clearPreloads="{!v.clearPreloads}" />
</aura:application>
