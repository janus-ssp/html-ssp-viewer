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
            url: apiEndpoint + "/" + set + "/entity?id=" + id,
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
                            attributeList = [];

                            // add the "default" attributes to the list
                            allAttributes.forEach(function(v) {
                                attributeList.push({attribute: v, enabled: false, custom: false});
                            });

                            if(data.attributes) {
                                data.attributes.forEach(function(v, k) {
                                    // add the attribute to the attributeList if it is not
                                    // not there, or enable it if it is there
                                    var idx = allAttributes.indexOf(v);
                                    if(-1 !== idx) {
                                        attributeList[idx].enabled = true;
                                    } else {
                                        attributeList.push({attribute: v, enabled: true, custom: true});
                                    }
                                });
                            }

                            // FIXME: sort attributes by "enabled" state, attribute name

                            data.jsonData = JSON.stringify(data);
                            data.identityProviders = idpData;
                            data.attributeList = attributeList;

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
                            data.serviceProviders = spData;
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

    $(document).on('click', '#metadataListTable a', function (event) {
        renderEntity($(this).data('set'), $(this).data('id'));
        event.preventDefault();
    });

    $(document).on('click', '#listIdPs', function (event) {
        renderMetadataList('saml20-idp-remote');
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#listSPs', function (event) {
        renderMetadataList('saml20-sp-remote');
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#basicButton', function (event) {
        $("form").hide();
        $("form#basicForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#aclButton', function (event) {
        $("form").hide();
        $("form#aclForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#arpButton', function (event) {
        $("form").hide();
        $("form#arpForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#advancedButton', function (event) {
        $("form").hide();
        $("form#advancedForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    function initPage() {
        renderMetadataList('saml20-idp-remote');
        $("ul.nav").children().first().addClass("active");
    }
    initPage();
});
