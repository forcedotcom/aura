<aura:application template="auraStorageTest:cryptoRegistrationTemplate" implements="performance:test">
    <!--  input attributes -->
    <aura:attribute name="adapterName" type="String" default="crypto" description="Aura Storage adapter name to test: memory, indexeddb, crypto, smartstore" />
    <aura:attribute name="maxSize" type="Integer" default="40960" description="Storage max size (bytes)" />
    <aura:attribute name="initialSize" type="Integer" default="0" description="Storage initial content size (bytes)" />

    <aura:attribute name="payloadSize" type="Integer" default="4096" description="Payload size to used in operations (bytes)" />
    <aura:attribute name="runs" type="Integer" default="1" description="Number of runs of the perf test" />
    <aura:attribute name="operationIterations" type="Integer" default="5" description="Number of times each operation is performed" />
    <aura:attribute name="operations" type="String[]" default="set,get,getAll,remove,clear" description="List of operations to perform. Refer to AuraStorage.js" />

    <aura:attribute name="displayLogs" type="Boolean" default="true" description="Whether to display a table of perf results. Use only for manual runs because the data gathering appears as a memory leak"/>


    <!-- import $A.PerfRunner -->
    <aura:import library="performance:perfLib" property="lib" />

    <!-- reusable storage perf logic -->
    <aura:import library="auraStoragePerformanceTest:library" property="storage" />


    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />

    <!--  private vars -->
    <aura:attribute name="status" access="private" type="String" default="Not started" description="The status of the test"/>
    <aura:attribute name="logs" access="private" type="Object" description="Log lines from perf measurements"/>


    <div>Status: <b>{!v.status}</b></div>
    <!-- Display of results, for manual runs  (set v.displayLogs to true) -->
    <div class="logs">
        <div class="log">
            <table>
                <tr>
                    <th>Adapter Name</th>
                    <th>Payload (b)</th>
                    <th>Op</th>
                    <th>#</th>
                    <th>Avg Time (ms)</th>
                    <th>EPT95 Time (ms)</th>
                    <th>Max Time (ms)</th>
                    <th>Total (ms)</th>
                    <th>Store Size (kB)</th>
                </tr>
                <aura:iteration aura:id="iteration" items="{!v.logs}" var="item">
                <tr>
                    <td><ui:outputText value="{!item.adapterName}" visible="true"/></td>
                    <td><ui:outputText value="{!item.payloadSize}" visible="true"/></td>
                    <td><ui:outputText value="{!item.operation}" visible="true"/></td>
                    <td><ui:outputText value="{!item.count}" visible="true"/></td>
                    <td><ui:outputText value="{!item.average}" visible="true"/></td>
                    <td><ui:outputText value="{!item.ept95}" visible="true"/></td>
                    <td><ui:outputText value="{!item.max}" visible="true"/></td>
                    <td><ui:outputText value="{!item.total}" visible="true"/></td>
                    <td><ui:outputText value="{!item.storeSize}" visible="true"/></td>
                </tr>
              </aura:iteration>
            </table>
        </div>
    </div>
</aura:application>
