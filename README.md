# simpleSAMLphp Management Client

## Introduction
This application makes it possible to manage simpleSAMLphp metadata.

## Installation
This application depends on the following components:

* jQuery
* JSrender (JavaScript Template Rendering for jQuery)
* JSO (JavaScript OAuth 2 client)
* Bootstrap CSS 

It can easily be installed by running the following script:

    $ sh docs/install_dependencies.sh

This will download the latest version of those components and everything will
immediately work.

## Configuration
You need to configure the application to point to your OAuth server. This can
be done by copying `config/config.js.default` to `config/config.js` and 
modifying the `config.js` file to suit your situation.

This is the default configuration:

    var apiClientId = 'html-manage-ssp';
    var authorizeEndpoint = 'http://localhost/php-oauth/authorize.php';
    var apiEndpoint = 'http://localhost/php-ssp-api/api.php';

For example, for your situation it may need to be this:

    var apiClientId = 'html-manage-ssp';
    var authorizeEndpoint = 'https://www.example.org/php-oauth/authorize.php';
    var apiEndpoint = 'https://www.example.org/php-ssp-api/api.php';

## Client Registration
Also, make sure that this client is registered in your OAuth server. The following
information will be relevant:

<table>
  <tr>
    <th>Identifier</th><td>html-manage-ssp</td>
  </tr>
  <tr>
    <th>Name</th><td>Manage simpleSAMLphp Metadata</td>
  </tr>
  <tr>
    <th>Description</th><td>Application to manage the simpleSAMLphp metadata registrations.</td>
  </tr>
  <tr>
    <th>Profile</th><td>User-agent-based Application</td>
  </tr>
  <tr>
    <th>Secret</th><td><em>NONE</em></td>
  </tr>
  <tr>
    <th>Redirect URI</th><td>https://www.example.org/html-manage-ssp/index.html</td>
  </tr>
</table>

That should be all!
