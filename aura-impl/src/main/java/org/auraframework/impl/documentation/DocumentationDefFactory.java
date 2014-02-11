package org.auraframework.impl.documentation;

import org.auraframework.def.DocumentationDef;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.system.CacheableDefFactoryImpl;

public class DocumentationDefFactory extends CacheableDefFactoryImpl<DocumentationDef> {

    public DocumentationDefFactory(SourceFactory sourceFactory) {
        super(sourceFactory);
    }

}
