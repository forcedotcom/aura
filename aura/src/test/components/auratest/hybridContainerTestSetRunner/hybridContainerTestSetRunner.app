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
<!--
This app is configure to set the scope of the testSetRunnerC to hybrid container, 
which makes it load only tests that are in the hybridContainerTest namespace.
An alternative implementation could simply reuse the existing testSetRunner 
and dynamically set the scope based on a query string parameter,but this approach
isolate our runner for any container specific work we may need to do
-->
<aura:application securityProvider="java://org.auraframework.components.security.SecurityProviderAlwaysAllows">
<auratest:testSetRunnerC aura:load="lazy" scope="hybrid_container">
</auratest:testSetRunnerC>
</aura:application>
