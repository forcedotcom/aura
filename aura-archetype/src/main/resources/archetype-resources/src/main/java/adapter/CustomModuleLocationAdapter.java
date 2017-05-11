package ${package}.adapter;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor.DefType;

import java.io.File;

/**
 * Provides location of Aura components
 */
@ServiceComponent
public class CustomModuleLocationAdapter extends ComponentLocationAdapter.Impl {
    public CustomModuleLocationAdapter() {
        super(new File(System.getProperty("custom.home"), "src/main/modules"),
                null, "custom-components");
    }

    @Override
    public DefType type() {
        return DefType.MODULE;
    }
}