<aura:application template="auraStorageTest:cryptoRegistrationTemplate" implements="performance:test">
    <!--  input attributes -->
    <aura:attribute name="adapterName" type="String" default="crypto" description="Aura Storage adapter name to test: memory, indexeddb, crypto, smartstore" />
    <aura:attribute name="maxSize" type="Integer" default="40960" description="Storage max size (bytes)" />
    <aura:attribute name="initialSize" type="Integer" default="0" description="Storage initial content size (bytes)" />

    <aura:attribute name="payloadSize" type="Integer" default="4096" description="Payload size to used in operations (bytes)" />
    <aura:attribute name="runs" type="Integer" default="1" description="Number of runs of the perf test" />
    <aura:attribute name="operationIterations" type="Integer" default="5" description="Number of times each operation is performed. For bulk iterations also defines the operands." />
    <aura:attribute name="operations" type="String[]" default="serialSet,serialGet,getAll,serialRemove,parallelSet,parallelGet,parallelRemove,bulkSetAll,bulkGetAll,bulkRemoveAll,clear" description="List of operations to perform. Refer to AuraStorage.js" />

    <aura:attribute name="displayLogs" type="Boolean" default="true" description="Whether to display a table of perf results. Use only for manual runs because the data gathering appears as a memory leak"/>

    <!-- import $A.PerfRunner -->
    <aura:import library="performance:perfLib" property="lib" />

    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <aura:handler event="aura:locationChange" action="{!c.locationChange}" />


    <auraStoragePerformanceTest:operations
        aura:id="operations"
        adapterName="{!v.adapterName}"
        maxSize="{!v.maxSize}"
        initialSize="{!v.initialSize}"
        payloadSize="{!v.payloadSize}"
        runs="{!v.runs}"
        operationIterations="{!v.operationIterations}"
        operations="{!v.operations}"
        displayLogs="{!v.displayLogs}"
    />
</aura:application>
