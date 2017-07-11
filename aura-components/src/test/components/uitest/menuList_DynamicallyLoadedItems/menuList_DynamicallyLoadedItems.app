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
<aura:application description="Test case where the ui:menuList and the ui:actionMenuItem are in different components, so the code for the actionMenuItems can be lazy-loaded.">

  <!-- Useful to actually lazy-load the component, to reproduce the typical use case. -->
  <aura:attribute name="childCmp" type="Aura.Component[]" />
  <aura:attribute name="childCmpLoaded" type="Boolean" default="false" />

  <!-- So that the dynamic component gets created the first time, and updated the other times (so we make sure it works with subsequent updates too). -->
  <aura:handler name="menuExpand" event="ui:expand" action="{!c.onMenuExpand}" />

  <!-- The ui:menuList can't see changes in the dynamic component, therefore needs to be notified when there are some; this is the event for it. -->
  <aura:handler name="menuList_DynamicallyLoadedItemsUpdated" event="uitest:menuList_DynamicallyLoadedItemsUpdated" action="{!c.menuList_DynamicallyLoadedItemsUpdated}" />

  <ui:menu>
    <ui:menuTriggerLink aura:id="trigger" label="Open" class="trigger"/>
    <ui:menuList class="actionMenu" aura:id="actionMenu">
      <aura:if isTrue="{!v.childCmpLoaded}">
        {!v.childCmp}
        <aura:set attribute="else">
          <li>Downloading items code</li>
        </aura:set>
      </aura:if>
    </ui:menuList>
  </ui:menu>
</aura:application>
