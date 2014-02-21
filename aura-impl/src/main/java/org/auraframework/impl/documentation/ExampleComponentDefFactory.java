package org.auraframework.impl.documentation;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefFactoryImpl;
import org.auraframework.system.DefFactory;
import org.auraframework.throwable.quickfix.QuickFixException;

public class ExampleComponentDefFactory extends DefFactoryImpl<ComponentDef> implements DefFactory<ComponentDef> {

    @Override
    public ComponentDef getDef(DefDescriptor<ComponentDef> descriptor) throws QuickFixException {
        checkPrefix(descriptor);

        return null;
    }

    private void checkPrefix(DefDescriptor<ComponentDef> descriptor) {
        if (descriptor.getPrefix() != DefDescriptor.EXAMPLE_PREFIX) {
            throw new UnsupportedOperationException(String.format(
                    "%s only supports prefix %s, but found prefix %s", this.getClass().getName(), DefDescriptor.EXAMPLE_PREFIX, descriptor.getPrefix()));
        }
    }
}
