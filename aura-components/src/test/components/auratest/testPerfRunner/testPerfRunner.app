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
<aura:attribute name="scope" type="String"/>
	<div class="viewport">
		<header>
			<span class="icon-rocket"></span>
			<span class="title">
				<aura:if isTrue="{!v.scope == 'perf'}">
					<span class="perf">Perf </span>
				</aura:if>
				<span>Test Runner</span>
			</span>
		</header>
		<section class="center">
    		<auratest:testPerfRunnerContainer aura:id="container" scope="{!v.scope}" aura:load="lazy"/>
    	</section>
    	<footer>
    		<span class="status-bar"></span>
    	</footer>
    </div>
</aura:application>
