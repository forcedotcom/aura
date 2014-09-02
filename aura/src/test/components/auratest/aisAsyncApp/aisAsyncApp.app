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
<aura:application extends='aura:integrationServiceApp'>
    <!-- for app evt, handler in controller works -->
    <aura:handler event="handleEventTest:applicationEvent" action="{!c.handlerPressFromInject}"/>
    <aura:attribute name='msgFromEvent' type='String' default='empty'/>
    <!-- for cmp evt we can put controller into markup directly -->
    <script>
          function click2Handler__t(event) {
            document._click2HandlerCalled = true; 
            document.__click2Event=event;
          }
    </script>
    
</aura:application>