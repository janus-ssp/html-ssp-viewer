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

    function renderMetadataList(set, searchQuery) {
        if (searchQuery) {
            var requestUri = apiEndpoint + "/" + set + "/?searchQuery=" + searchQuery;
        } else {
            var requestUri = apiEndpoint + "/" + set + "/";
        }
        $.oajax({
            url: requestUri,
            jso_provider: "html-manage-ssp",
            jso_scopes: apiScope,
            jso_allowia: true,
            dataType: 'json',
            success: function (data) {

                // sort the entries by name
                data.sort(function(a, b) {
                    if(a.name && b.name) {
                        return (a.name === b.name) ? 0 : (a.name < b.name) ? -1 : 1;
                    }
                    if(a.name && !b.name) {
                        return (a.name === b.entityid) ? 0 : (a.entityid < b.entityid) ? -1 : 1;
                    }
                    if(!a.name && b.name) {
                        return (a.entityid === b.name) ? 0 : (a.entityid < b.name) ? -1 : 1;
                    }
                    return (a.entityid === b.entityid) ? 0 : (a.entityid < b.entityid) ? -1 : 1;
                });

                $("#metadataListTable").html($("#metadataListTemplate").render({
                    set: set,
                    entry: data,
                    searchQuery: searchQuery
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

                            nameIDs = [];
                            supportedNameIDFormats.forEach(function(v) {
                                if (data.NameIDFormat === v) {
                                    nameIDs.push({nameid: v, enabled: true});
                                } else {
                                    nameIDs.push({nameid: v, enabled: false});
                                }
                            });

                            idpList = [];
                            // add all IdPs to the list
                            idpData.forEach(function(v) {
                                idpList.push({entityid: v.entityid, name: v.name, enabled: false});
                            });

                            if(data.IDPList) {
                                idpList.forEach(function(v, k) {
                                    if(-1 !== data.IDPList.indexOf(v.entityid)) {
                                        idpList[k].enabled = true;
                                    }
                                });
                            }

                            // sort the IdPs by name
                            idpList.sort(function(a, b) {
                                if(a.enabled && !b.enabled) {
                                    return -1;
                                }
                                if(!a.enabled && b.enabled) {
                                    return 1;
                                }

                                if(a.name && b.name) {
                                    return (a.name === b.name) ? 0 : (a.name < b.name) ? -1 : 1;
                                }
                                if(a.name && !b.name) {
                                    return (a.name === b.entityid) ? 0 : (a.entityid < b.entityid) ? -1 : 1;
                                }
                                if(!a.name && b.name) {
                                    return (a.entityid === b.name) ? 0 : (a.entityid < b.name) ? -1 : 1;
                                }
                                return (a.entityid === b.entityid) ? 0 : (a.entityid < b.entityid) ? -1 : 1;
                            });

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

                            // sort by enabledness and then alphabetically
                            attributeList.sort(function(a, b) {
                                if(a.enabled && !b.enabled) {
                                    return -1;
                                }
                                if(!a.enabled && b.enabled) {
                                    return 1;
                                }
                                return (a.attribute === b.attribute) ? 0 : (a.attribute < b.attribute) ? -1 : 1;
                            });

                            // alert(JSON.stringify(idpList));
                            data.jsonData = JSON.stringify(data, null, 4);
                            data.identityProviders = idpList;
                            data.attributeList = attributeList;
                            data.nameIDs = nameIDs;

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

                            spList = [];
                            // add all SPs to the list
                            spData.forEach(function(v) {
                                if(-1 === v.IDPList.indexOf(id)) {
                                    spList.push({entityid: v.entityid, name: v.name, enabled: false});
                                } else {
                                    spList.push({entityid: v.entityid, name: v.name, enabled: true});
                                }
                            });

                            // sort the SPs by name
                            spList.sort(function(a, b) {
                                if(a.enabled && !b.enabled) {
                                    return -1;
                                }
                                if(!a.enabled && b.enabled) {
                                    return 1;
                                }

                                if(a.name && b.name) {
                                    return (a.name === b.name) ? 0 : (a.name < b.name) ? -1 : 1;
                                }
                                if(a.name && !b.name) {
                                    return (a.name === b.entityid) ? 0 : (a.entityid < b.entityid) ? -1 : 1;
                                }
                                if(!a.name && b.name) {
                                    return (a.entityid === b.name) ? 0 : (a.entityid < b.name) ? -1 : 1;
                                }
                                return (a.entityid === b.entityid) ? 0 : (a.entityid < b.entityid) ? -1 : 1;
                            });

                            data.jsonData = JSON.stringify(data, null, 4);
                            data.serviceProviders = spList;
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

    $(document).on('click', '#searchButton', function (event) {
        renderMetadataList($(this).data('set'), $('#searchTerm').val());
        event.preventDefault();
    });

    $(document).on('click', '#basicButton', function (event) {
        $("form.entryForm").hide();
        $("form#basicForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#aclButton', function (event) {
        $("form.entryForm").hide();
        $("form#aclForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#arpButton', function (event) {
        $("form.entryForm").hide();
        $("form#arpForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#advancedButton', function (event) {
        $("form.entryForm").hide();
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
