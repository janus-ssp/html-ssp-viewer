# Introduction
This application makes it possible to vieuw simpleSAMLphp configuration in 
JSON format.

# Installation
In order to install the required dependencies you need to run
[Bower](http://bower.io/).

    $ bower install
    
### Steps to make a non systemwide bower install 
Follow these steps when bower is not installed and you do not have root access on the system.

- Download and extract node.js from: http://nodejs.org/download/
- Add the bin directory from the extracted node.js to your PATH-environment-variable
- Change directory to the bin directory from the extracted node.js
- type: npm install -g bower

From this point the bower-command can be used.


# Configuration
Copy the `config/config.js.default` to `config/config.js` and modify it 
accordingly.

Make sure you place (or create a symlink to) the `saml20-idp-remote.json` 
and `saml20-sp-remote.json` files in the same directory as `index.html`.
