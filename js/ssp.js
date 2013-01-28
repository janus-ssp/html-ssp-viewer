$(document).ready(function () {

    var apiScope = ["ssp"];

    jso_configure({
        "html-manage-ssp": {
            client_id: apiClientId,
            authorization: authorizeEndpoint
        }
    });
    jso_ensureTokens({
        "html-manage-ssp": apiScope
    });

    function renderMetadataList(set) {
        $.oajax({
            url: apiEndpoint + "/" + set + "/",
            jso_provider: "html-manage-ssp",
            jso_scopes: apiScope,
            jso_allowia: true,
            dataType: 'json',
            success: function (data) {
                $("#metadataListTable").html($("#metadataListTemplate").render({
                    set: set,
                    entry: data
                }));
            }
        });
    }

    function renderEntity(set, id) {
        $.oajax({
            url: apiEndpoint + "/" + set + "/" + id,
            jso_provider: "html-manage-ssp",
            jso_scopes: apiScope,
            jso_allowia: true,
            dataType: 'json',
            success: function (data) {
                if ("saml20-sp-remote" === set) {
                    // fetching a list of all IdPs
                    $.oajax({
                        url: apiEndpoint + "/saml20-idp-remote/",
                        jso_provider: "html-manage-ssp",
                        jso_scopes: apiScope,
                        jso_allowia: true,
                        dataType: 'json',
                        success: function (idpData) {
                            data.arp = [];
                            data.attributes.forEach(function(v, k) {
                                data.arp.push({attribute: v});
                            });
                            data.jsonData = JSON.stringify(data);
                            data.IdentityProviders = idpData;
                            
                            /*data.arp = [{
                                "attribute": "uid",
                                "on": false
                            }, {
                                "attribute": "displayName",
                                "on": true
                            }, {
                                "attribute": "eduPersonPrincipalName",
                                "on": false
                            }, {
                                "attribute": "eduPersonEntitlement",
                                "on": true
                            }, {
                                "attribute": "mail",
                                "on": true
                            }, {
                                "attribute": "eduPersonAffiliation",
                                "on": false
                            }];*/
                            $("#entityViewModal").html($("#entityViewServiceProviderModalTemplate").render({
                                set: set,
                                id: id,
                                entry: data
                            }));
                            $("#entityViewModal").modal('show');
                        }
                    });
                }
                if ("saml20-idp-remote" === set) {
                    // fetching a list of all SPs
                    $.oajax({
                        url: apiEndpoint + "/saml20-sp-remote/",
                        jso_provider: "html-manage-ssp",
                        jso_scopes: apiScope,
                        jso_allowia: true,
                        dataType: 'json',
                        success: function (spData) {
                            data.jsonData = JSON.stringify(data);
                            data.ServiceProviders = spData;
                            $("#entityViewModal").html($("#entityViewIdentityProviderModalTemplate").render({
                                set: set,
                                id: id,
                                entry: data
                            }));
                            $("#entityViewModal").modal('show');
                        }
                    });
                }
                // unsupported type, do nothing
            }
        });
    }

    // IDP ACL
    // 'IDPList' => array('https://idp1.wayf.dk', 'https://idp2.wayf.dk'),

    $(document).on('click', '#metadataListTable a', function () {
        renderEntity($(this).data('set'), $(this).data('id'));
    });

    $(document).on('click', '#listIdPs', function () {
        renderMetadataList('saml20-idp-remote');
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    $(document).on('click', '#listSPs', function () {
        renderMetadataList('saml20-sp-remote');
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    $(document).on('click', '#basicButton', function () {
        $("form").hide();
        $("form#basicForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    $(document).on('click', '#aclButton', function () {
        $("form").hide();
        $("form#aclForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    $(document).on('click', '#arpButton', function () {
        $("form").hide();
        $("form#arpForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    $(document).on('click', '#advancedButton', function () {
        $("form").hide();
        $("form#advancedForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    function initPage() {
        renderMetadataList('saml20-idp-remote');
        $("ul.nav").children().first().addClass("active");
    }
    initPage();
});
