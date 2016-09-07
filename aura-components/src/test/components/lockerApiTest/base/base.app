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
<aura:application extensible="true" abstract="true" template="lockerApiTest:template">

    <aura:import library="lockerApiTest:utils" property="utils"/>

    <aura:attribute name="secureAPI" type="String"/>
    <aura:attribute name="systemAPI" type="String"/>
    <aura:attribute name="report" type="Object"/>

    <div aura:id="report">
        <h1>{!v.secureAPI} vs {!v.systemAPI} Compatibility Table</h1>
        <div class="columns">
            <div>
                <p>
                    Checks the <b>System API</b> against the test plan:
                    <ul>
                        <li>Is the test plan covering the full System API?</li>
                        <li>Are there any changes in the System API?</li>
                    </ul>
                </p>
                <p>
                    Checks the <b>Locker API</b> against the test plan:
                    <ul>
                        <li>How much of the System API is supported?</li>
                        <li>Is anyting broken in the Locker API?</li>
                    </ul>
                </p>
            </div>
            <div>
                <p>
                   These are the types of tests:
                    <ul>
                        <li><b>Type</b>: The JS type of the property or method.</li>
                        <li><b>Empty</b>: The result when we expect nothing returned.</li>
                        <li><b>Opaque</b>: The result when we target an opaque element (not accessible).</li>
                        <li><b>Hiddden</b>: The result when we target an element behing an opaque element.</li>
                    </ul>
                </p>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th rowspan="2">Method</th>
                    <th colspan="3">Test Plan (expected)</th>
                    <th colspan="2">Browser API (actual)</th>
                    <th colspan="3">Locker API (actual)</th>
                </tr>
                <tr>
                    <th>Type</th><th>Empty</th><th>Opaque</th>
                    <th>Type</th><th>Empty</th>
                    <th>Type</th><th>Empty</th><th>Opaque</th>
                </tr>
            </thead>
            <tbody>
                <aura:iteration items="{!v.report.protos}" var="proto">
                    <tr>
                        <td colspan="9" class="proto">Proto {!proto.name} (extends {!proto.proto})</td>
                    </tr>
                    <aura:iteration items="{!proto.props}" var="prop">
                        <tr>
                            <td>{!prop.name}</td>

                            <td>{!prop.plan.type}</td>
                            <td>{!prop.plan.empty.value}</td>
                            <td>{!prop.plan.opaque.value}</td>

                            <!-- ENSURE OUR TEST PLAN MEETS SYSTEM (to monitor browser API change) -->
                            <td class="{!prop.system.type.status}">
                                {!prop.system.type.value}
                            </td>
                            <td class="{!prop.system.empty.status}">
                                {!prop.system.empty.value}
                            </td>

                            <!-- ENSURE LOCKER MEETS PLANS (to monitor support) -->
                            <td class="{!prop.locker.type.status}">
                                {!prop.locker.type.value}
                            </td>
                            <td class="{!prop.locker.empty.status}">
                                {!prop.locker.empty.value}
                            </td>
                            <td class="{!prop.locker.opaque.status}">
                                {!prop.locker.opaque.value}
                            </td>
                        </tr>
                    </aura:iteration>
                </aura:iteration>
            </tbody>
        </table>

        <!-- This is where any components used by tests are placed -->
        <div aura:id="test">
            {!v.body}
        </div>
    </div>

</aura:application>