#!/bin/sh

rm -rf ext
mkdir -p ext/js
mkdir -p ext/bootstrap

# jQuery
curl -L -o ext/js/jquery.js http://code.jquery.com/jquery.min.js

# JSrender (JavaScript Template Rendering for jQuery)
curl -L -o ext/js/jsrender.js https://raw.github.com/BorisMoore/jsrender/master/jsrender.js

# Bootstrap
curl -L -o ext/bootstrap.zip http://twitter.github.io/bootstrap/assets/bootstrap.zip
(cd ext/ && unzip bootstrap.zip && rm bootstrap.zip)
