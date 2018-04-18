/* global _ */
/* exported createTable */

var templateSource =
  "\
  <table>\
    <thead>\
      <tr>\
        <th>Group</th>\
        <th>Test</th>\
        <th>Locker OFF</th>\
        <th>Locker ON</th>\
        <th>Fastest</th>\
      </tr>\
    </thead>\
    <tbody>\
\
      <% plan.forEach(function(test) { %>\
\
        <tr>\
          <td><%= test.group %></td>\
          <td><%= test.name %></td>\
          <td><%= test.bench0 %></td>\
          <td><%= test.bench1 %></td>\
          <td><%= test.compare %></td>\
        </tr>\
\
      <% }) %>\
\
    </tbody>\
  </table>\
";

function makeURL(parts) {
  // We just don't support this feature on some browsers.
  if (typeof URL === undefined) {
    return;
  }
  var url = new URL(document.location);
  for (var name in parts) {
    if (parts[name]) {
      url.searchParams.set(name, parts[name]);
    } else {
      url.searchParams.delete(name);
    }
  }
  return url.pathname + url.search;
}

var templateImports = {
  makeURL: makeURL
};

var templateCompiled = _.template(templateSource, { imports: templateImports });

function createTable(plan) {
  return templateCompiled({ plan: plan });
}
