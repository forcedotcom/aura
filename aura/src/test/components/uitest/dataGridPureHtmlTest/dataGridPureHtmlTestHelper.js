({
    renderTrs: function(cmp){
        
        var tr, td, span, input;
        var amountToCreate = cmp.get("v.total");
        var body = cmp.get("tbody").getElement();
        for(var i = 1; i <= amountToCreate; i++){
            tr = document.createElement("tr")
            
            //InputCheckBox
            td = document.createElement("td");
            input = document.createElement("input");
            input.setAttribute("type", "checkbox")
            td.appendChild(input);
            tr.appendChild(td);
            
            //ID
            td = document.createElement("td");
            span = document.createElement("span");
            
            span.innerText = i;
            td.appendChild(span);
            tr.appendChild(td);
            
            //Subject
            td = document.createElement("td");
            span = document.createElement("span");
            
            span.innerText = "Foo "+i;
            td.appendChild(span);
            tr.appendChild(td);
            
            //Name
            td = document.createElement("td");
            span = document.createElement("span");
            
            span.innerText = "John Doe"
            td.appendChild(span);
            tr.appendChild(td);
            
            //Related to
            td = document.createElement("td");
            span = document.createElement("span");
            
            span.innerText = "Acme"
            td.appendChild(span);
            tr.appendChild(td);
            
            //Due date
            td = document.createElement("td");
            span = document.createElement("span");
            
            span.innerText = "2014-01-01"
            td.appendChild(span);
            tr.appendChild(td);
            
            body.appendChild(tr);
        }
        
        
        
        
        
    }
})