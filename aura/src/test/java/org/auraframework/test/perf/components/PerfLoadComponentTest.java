package org.auraframework.test.perf.components;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.perf.core.ComponentPerfAbstractTestCase;

public final class PerfLoadComponentTest extends ComponentPerfAbstractTestCase {

    public PerfLoadComponentTest(String name, DefDescriptor<ComponentDef> desc) {
        super(name, desc);
    }

    @Override
    public void testRun() throws Exception {
        runWithPerfApp(descriptor);
    }
}
