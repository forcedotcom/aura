#!/bin/bash
set -e
set -x

RETAB_SCRIPT=$(mktemp /tmp/retab.ex.XXXXX)
trap "rm $RETAB_SCRIPT" exit
cat > $RETAB_SCRIPT <<EOF
:set tabstop=4 softtabstop=4 expandtab
:set ts=4 et
:retab
:wq
EOF

for ext in .java header.txt .js .cmp .evt .app .intf .xml 
do
  # strip trailing whitespace
  sed -i .bak -e 's/[ 	]*$//' $(find . -name \*${ext})
  git st
  rm -f $(find . -name \*${ext}.bak)

  # use vim to rewrite tabs "smartly"
  for file in $(find . -name \*${ext})
  do
    chmod +w ${file}
    ex -S $RETAB_SCRIPT ${file}
  done
  git st
done

# patch up files that only changed the terminal line ending
git checkout -- $(for file in $(git st | awk '/modified: / { print $NF }' )
  do
    git diff --cached $file | awk "BEGIN { nl = 0; pluses = 0; minuses = 0; }
      /^\\\\/ { nl++; }
      /^\+[^\+]/ { pluses++; }
      /^-[^-]/ { minuses++; }
      END { if (nl == 1 && pluses == 1 && minuses == 1) { print \"$file\" } };"
  done)

# Strip empty comments
for file in $(find . -name \*.java)
do
  awk 'BEGIN { hold = 0; incomment=""; }
     /^ *\/\*/   { hold = 1; incomment = $0; }
     /^ *\*[^\/].*$/ { if (incomment != "") { print incomment; }
                       incomment = "";
                       hold = 0;
                     }
     /^.*\*\//   { hold = (incomment != "")
                   if (match($0, "^ *\*/") == 1) {
                     hold = (incomment != "");
                   } else {
                     hold = 0;
                     if (incomment != "") { print incomment; }
                   }
                   incomment = "";
                 }
     { if (!hold) { hold = (incomment != ""); }
       if (!hold) { print; } hold = 0;}' $file > $file.bak
  mv -f $file.bak $file
done

# Repeated cleans to fix up goldfiles
mvn clean install || true
mvn install || true
mvn install || true
mvn install || true
mvn install || true
mvn install
