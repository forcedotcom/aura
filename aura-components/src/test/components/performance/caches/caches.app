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
<aura:application access="global" useAppcache="false" controller="java://org.auraframework.components.performance.CacheController" >
    <aura:attribute name="cache" type="String" default="depsCache" />
    <aura:attribute name="key" type="String" />
    <aura:attribute name="count" type="Integer" default="100" />
    <aura:attribute name="data" type="Object[]" />
    <aura:method name="updateCache" action="c.updateCacheMethod" />
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <div class="controls">
        <span class="cachemenu">
            <ui:menu>
                <ui:menuTriggerLink aura:id="link">
                    Cache: {!v.cache}
                </ui:menuTriggerLink>
                <ui:menuList class="actionMenu" aura:id="actionMenu">
                    <ui:actionMenuItem label="depsCache" click="{!c.updateCache}" />
                    <ui:actionMenuItem label="defsCache" click="{!c.updateCache}" />
                    <ui:actionMenuItem label="altStringsCache" click="{!c.updateCache}" />
                    <ui:actionMenuItem label="stringsCache" click="{!c.updateCache}" />
                    <ui:actionMenuItem label="cssStringsCache" click="{!c.updateCache}" />
                </ui:menuList>
            </ui:menu>
        </span>
        <span class="search">
            <ui:inputText value="{!v.key}" />
            <ui:button aura:id="search" class="searchButton" press="{!c.search}">Search</ui:button>
        </span>
    </div>
    <div class="header">
        <span aura:id="cachename" class="cache">{!v.data.cache}</span>['<span aura:id="searchValue" class="searchValue">{!v.data.key}</span>']: size=<span aura:id="size">{!v.data.size}</span> found=<span aura:id="count" class="count">{!v.data.count}</span>
    </div>
    <div class="data">
        <table>
            <tr>
                <th>Key</th>
                <th>Value</th>
            </tr>
            <aura:iteration items="{!v.data.values}" var="item">
                <tr>
                    <td aura:id="key">{!item.key}</td>
                    <td aura:id="value">{!item.value}</td>
                </tr>
            </aura:iteration>
        </table>
    </div>
</aura:application>
