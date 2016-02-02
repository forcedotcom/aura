<aura:application template="auraStorageTest:cryptoRegistrationTemplate" implements="performance:test">
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />
    <aura:import library="auraStorageTest:storageTestLib" property="lib" />
    <aura:import library="performance:perfLib" property="lib" />

    <aura:attribute name="adapterName" type="String" default="crypto" description="Aura Storage Adapter name to use: smartstore, memory, indexeddb" />
    <aura:attribute name="adapterSize" type="Integer" default="4" description="Aura Storage Adapter max size (KB)" />
    <aura:attribute name="adapterInitialSize" type="Integer" default="0" description="Initial store content size (KB)" />

    <aura:attribute name="opsIterations" type="Integer" default="5" description="Number of iterations of each operation before moving to the next operation" />
    <aura:attribute name="iterations" type="Integer" default="1" description="Number of iterations of the list of operations" />
    <aura:attribute name="perfList" type="Object" description="List of objects representing each log line of perf measurements"/>
    <aura:attribute name="doPut" type="Boolean" default="true" description="Whether to run a put operation in this test." />
    <aura:attribute name="doGet" type="Boolean" default="true" description="Whether to run a get operation in this test." />
    <aura:attribute name="doRemove" type="Boolean" default="true" description="Whether to run a remove operation in this test."/>
    <aura:attribute name="doGetAll" type="Boolean" default="true" description="Whether to run a getAll operation in this test."/>
    <aura:attribute name="doClear" type="Boolean" default="true" description="Whether to run a clear operation in this test."/>
    <aura:attribute name="payload" type="String" default="0kb" description="Payload size to be used in operations: 0kb, 1kb, 2kb" />
    <aura:attribute name="displayLogs" type="Boolean" default="true" description="Whether to display a table of perf results. This requires setting metrics service to not clear transactions after each transaction ends, which may appear as memory leaks."/>

    <aura:dependency resource="markup://auraStorageTest:persistentStorage" type="APPLICATION"/>
    <!-- Perf doesn't need this, but it's nice to have when dev'ing -->
    <div class="logs">
        <div class="log">
            <p><b>Logs (check the display logs box to see results here)</b></p>
            <table>
                <tr>
                    <td>Adapter Name</td>
                    <td>Payload</td>
                    <td>Op</td>
                    <td>#</td>
                    <td>Avg Time (ms)</td>
                    <td>EPT95 Time (ms)</td>
                    <td>Max Time (ms)</td>
                    <td>Total (ms)</td>
                    <!-- <td>Transaction Duration (ms)</td> -->
                    <td>Store Size (kB)</td>
                </tr>
                <aura:iteration aura:id="iteration" items="{!v.perfList}" var="item">
                <tr>
                    <td><ui:outputText value="{!item.adapterName}" visible="true"/></td>
                    <td><ui:outputText value="{!item.payload}" visible="true"/></td>
                    <td><ui:outputText value="{!item.operation}" visible="true"/></td>
                    <td><ui:outputText value="{!item.count}" visible="true"/></td>
                    <td><ui:outputText value="{!item.average}" visible="true"/></td>
                    <td><ui:outputText value="{!item.ept95}" visible="true"/></td>
                    <td><ui:outputText value="{!item.max}" visible="true"/></td>
                    <!--<td><ui:outputText value="{!item.sumOfMarks}" visible="true"/></td>-->
                    <td><ui:outputText value="{!item.total}" visible="true"/></td>
                    <td><ui:outputText value="{!item.storeSize}" visible="true"/></td>
                </tr>
              </aura:iteration>
            </table>
        </div>
    </div>
</aura:application>
