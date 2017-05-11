package ${package}.adapter;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;

import java.io.File;

/**
 * Provides location of Aura components
 */
@ServiceComponent
public class CustomComponentLocationAdapter extends ComponentLocationAdapter.Impl {
    public CustomComponentLocationAdapter() {
        super(new File(System.getProperty("custom.home"), "src/main/components"),
                null, "custom-components");
    }
}