/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.tools.definition;

import java.io.*;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.*;

public class RegistrySerializer {
    private String[] namespaces;
    private String outputFile;

    private List<String> templateThemes = Lists.newArrayList();

    public RegistrySerializer(String outputFile, String[] namespaces) {
        this.outputFile = outputFile;
        this.namespaces = namespaces;
    }

    public void write(OutputStream out) throws QuickFixException, IOException{
        ObjectOutputStream objectOut = null;
        try{
            objectOut = new ObjectOutputStream(out);
            objectOut.writeObject(getRegistries(namespaces));

        }finally{
            out.close();
        }
    }

    private DefRegistry<?>[] getRegistries(String[] nsset) throws QuickFixException{
        List<DefRegistry<?>> ret = Lists.newArrayList();

        for(String namespace : nsset){
            ret.addAll(getRegistries(namespace));
        }

        return ret.toArray(new DefRegistry<?>[0]);
    }

    private List<DefRegistry<?>> getRegistries(String namespace) throws QuickFixException{
        DefinitionService defService = Aura.getDefinitionService();

        return Lists.<DefRegistry<?>>newArrayList(
                createRegistry(defService.getDefDescriptor(String.format("%s:*", namespace), ApplicationDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("%s:*", namespace), LayoutsDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("%s:*", namespace), InterfaceDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("%s:*", namespace), EventDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("%s:*", namespace), ComponentDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("js://%s.*", namespace), ControllerDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("js://%s.*", namespace), HelperDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("js://%s.*", namespace), ProviderDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("js://%s.*", namespace), RendererDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("js://%s.*", namespace), TestSuiteDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("css://%s.*", namespace), ThemeDef.class)),
                createRegistry(defService.getDefDescriptor(String.format("templateCss://%s.*", namespace), ThemeDef.class))
        );
    }

    @SuppressWarnings("unchecked")
    private <T extends Definition> DefRegistry<T> createRegistry(DefDescriptor<T> matcher) throws QuickFixException{
        DefinitionService defService = Aura.getDefinitionService();
        Map<DefDescriptor<T>, T> defs = Maps.newHashMap();
        Map<DefDescriptor<T>, Source<T>> sources = Maps.newHashMap();
        for(DefDescriptor<T> desc : defService.find(matcher)){
            T def = null;
            switch(desc.getDefType()){
                case COMPONENT:
                    def = desc.getDef();
                    Object componentDef = def;
                    ComponentDef cd = (ComponentDef)componentDef;
                    DefDescriptor<ThemeDef> themeDesc = cd.getThemeDescriptor();
                    if(themeDesc != null && "templateCss".equalsIgnoreCase(themeDesc.getPrefix())){
                        templateThemes.add(String.format("%s:%s", themeDesc.getNamespace(), themeDesc.getName()));
                    }
                    break;
                case STYLE:
                    if(matcher.getPrefix().equalsIgnoreCase("css")){
                        if(templateThemes.contains(String.format("%s:%s", desc.getNamespace(), desc.getName()))){
                            break;
                        }
                    }else if(matcher.getPrefix().equalsIgnoreCase("templateCss")){
                        if(!templateThemes.contains(String.format("%s:%s", desc.getNamespace(), desc.getName()))){
                            break;
                        }else{
                            Object o = defService.getDefDescriptor(desc, "templateCSS", ThemeDef.class);
                            desc = (DefDescriptor<T>)o;
                        }
                    }
                default:
                    def = desc.getDef();
                    break;
            }

            Source<T> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(desc);
            if(source != null){
                //FIXME - should use jar loader sources.put(desc, new StringSource<T>(desc, source.getContents(), source.getSystemId(), source.getFormat()));
            }

            if(def != null){
                defs.put(desc, def);
            }
        }

        EnumSet<DefType> types = EnumSet.of(matcher.getDefType());
        return new StaticDefRegistryImpl<T>(types, Sets.newHashSet(matcher.getPrefix()), Sets.newHashSet(matcher.getNamespace()), defs, sources);
    }

    public void execute() throws IOException, QuickFixException {
        try{
            if(outputFile == null || namespaces == null || namespaces.length == 0){
                throw new AuraRuntimeException("outputFile and namespaces are required");
            }
            File file = new File(outputFile);

            if(!file.getParentFile().exists()){
                file.getParentFile().mkdirs();
            }
            file.createNewFile();
            Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED);
            FileOutputStream out = new FileOutputStream(file);
            write(out);
        }finally{
            Aura.getContextService().endContext();
        }
    }

    public static void main(String[] args) {
        String outputFile = args[0];
        String[] namespaces = new String[args.length -1];
        for(int i=1;i<args.length;i++){
            namespaces[i-1] = args[i];
        }
        try{
            new RegistrySerializer(outputFile, namespaces).execute();
        }catch(Throwable t){
            throw new AuraRuntimeException(t);
        }
    }
}
