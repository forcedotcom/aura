/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.component.auradev;

import java.io.File;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.*;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;

@Model
public class LintModel {
	List<Map<String,String>> errors = new ArrayList<Map<String, String>>();
	String message;

	public LintModel() throws Exception{
		DefinitionService definitionService = Aura.getDefinitionService();
		ContextService contextService = Aura.getContextService();


		String name = (String)Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes().getValue("name");

		if(name !=null && !name.isEmpty()){
			Set<DefDescriptor<?>> descriptors = definitionService.find(new DescriptorFilter("markup://"+name));
			if(descriptors.size() > 0){
				for (DefDescriptor<?> descriptor : descriptors) {

					DefType type = descriptor.getDefType();
					switch (type) {
					case COMPONENT:
					case APPLICATION:
					case INTERFACE:

						try{
							Definition definition = descriptor.getDef();

							if(definition instanceof RootDefinition){

								List<DefDescriptor<?>> deps = ((RootDefinition) definition).getBundle();
								JavascriptValidator jsv = new JavascriptValidator(); 
								for (DefDescriptor<?> dep : deps) {
									if(dep.getPrefix().equals(DefDescriptor.JAVASCRIPT_PREFIX)){


										Source<?> source = contextService.getCurrentContext().getDefRegistry().getSource(dep);
										if(source != null && source.exists()){
											String code = source.getContents();
											code += ";";
											String fileUrl = source.getUrl();
											fileUrl = fileUrl.substring(fileUrl.lastIndexOf(File.separatorChar));
											List<JavascriptProcessingError> ret = jsv.validate(fileUrl, code, false, false);
											Map<String, String> m;
											for (JavascriptProcessingError error : ret) {
												m = new TreeMap<String, String>();
												String comp = descriptor.getNamespace()+":"+descriptor.getName();
												m.put("CompName", comp);
												m.put("ErrorMessage", error.toString());
												errors.add(m);
											}
										}
									}
								}
							}
						}
						catch(Exception e){
							Map<String, String> m = new TreeMap<String, String>();
							m.put("CompName", descriptor.getQualifiedName());
							m.put("ErrorMessage", "Exception while loading Definition: "+e.getMessage());
							errors.add(m);
						}

						break;
					default: // not including other types in scan
					}
				}

				if(errors.size() == 0){
					message = "Congrats, no linting issue found!";
				}
			}
			else{
				message = "Nothing found using given  Descriptor Filter (via 'name' attribute). Check for typo and try again!";				
			}
		}
	}

	@AuraEnabled
	public List<Map<String, String>> getErrors(){
		return errors;
	}

	@AuraEnabled
	public String getMessage(){

		return message;
	}

}
