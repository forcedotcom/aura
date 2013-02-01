package org.auraframework.component.ui;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl.Builder;
import org.auraframework.instance.AttributeSet;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@Model
public class DataTableModel {
	private List<String> headerValues;
	private List<ComponentDefRef> itemTemplate;

	@SuppressWarnings("unchecked")
	public DataTableModel() throws QuickFixException {
		// grab all the attributes
		AttributeSet attrs = Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes();
		headerValues = (List<String>) attrs.getValue("headerValues");
		itemTemplate = loadItemTemplate();
	}
	
	private List<ComponentDefRef> loadItemTemplate() throws QuickFixException {
        ComponentDefRefBuilder rowBody = new Builder();
        List<ComponentDefRef> columnCmps = Lists.<ComponentDefRef>newArrayList();
        
		for (String column : headerValues) {
            ComponentDefRefBuilder outputField = new ComponentDefRefImpl.Builder();
            outputField.setDescriptor("force:outputField");
            outputField.setAttribute("value", new PropertyReferenceImpl(String.format("row.%s", column), null));
            
            ComponentDefRefBuilder cell = new ComponentDefRefImpl.Builder();
            cell.setDescriptor("aura:html");
            cell.setAttribute("tag", "td");
            cell.setAttribute("body", Lists.newArrayList(outputField.build()));
            
            columnCmps.add(cell.build());
        }
        
        rowBody.setDescriptor("aura:html");
        rowBody.setAttribute("tag", "tr");
        rowBody.setAttribute("body", columnCmps);
        
        return Lists.newArrayList(rowBody.build());
	}

	@AuraEnabled
	public List<ComponentDefRef> getItemTemplate() {
		return itemTemplate;
	}
}
