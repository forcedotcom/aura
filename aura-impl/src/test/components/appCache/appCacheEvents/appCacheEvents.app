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
<aura:application useAppcache="true" render="client"  preload="appCache" securityProvider="java://org.auraframework.java.securityProvider.LaxSecurityProvider" >
    <div>This should appear after the appcache has been populated.</div>
</aura:application>
<!-- This app is used by appCacheEventsTest.js to test AppCache events and should not be used by any other tests to
     avoid messing up the test by caching the manifest before the test begins! -->