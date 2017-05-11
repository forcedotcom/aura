package ${package}.adapter;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.springframework.context.annotation.Primary;

import test.org.auraframework.impl.adapter.ConfigAdapterImpl;

@ServiceComponent
@Primary
public class CustomConfigAdapter extends ConfigAdapterImpl {

    @Override
    public String getCSRFToken() {
        return "${artifactId}";
    }
}