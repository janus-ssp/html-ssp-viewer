$(document).ready(function () {

    var idpData;
    var spData;
    var logData;

    function renderIdPList() {
        idpData.sort(sortEntities);
        $("#metadataListTable").html($("#metadataListTemplate").render({
            set: "saml20-idp-remote",
            entry: idpData,
            logs: logData
        }));
    }

    function renderSPList() {
        spData.sort(sortEntities);
        $("#metadataListTable").html($("#metadataListTemplate").render({
            set: "saml20-sp-remote",
            entry: spData,
            logs: logData
        }));
    }

    function fetchMetadata() {
        $.when($.ajax("saml20-idp-remote.json"), $.ajax("saml20-sp-remote.json"), $.ajax("entityLog.json")).then(function (idpCallback, spCallback, logCallback) {
            idpData = idpCallback[0];
            spData = spCallback[0];
            logData = logCallback[0];

            renderIdPList();
        }, function (error) {
            alert("ERROR");
        });
    }

    function sortAttributes(a, b) {
        if (a.enabled && !b.enabled) {
            return -1;
        }
        if (!a.enabled && b.enabled) {
            return 1;
        }
        return (a.attribute === b.attribute) ? 0 : (a.attribute < b.attribute) ? -1 : 1;
    }
    
    function sortEntities(a, b) {
        if (a.enabled && !b.enabled) {
            return -1;
        }
        if (!a.enabled && b.enabled) {
            return 1;
        }
        if (a.state && b.state && "prodaccepted" === a.state && "testaccepted" === b.state) {
            return -1;
        }
        if (a.state && b.state && "prodaccepted" === b.state && "testaccepted" === a.state) {
            return 1;
        }
        if (a.name && a.name.en && b.name && b.name.en) {
            return (a.name.en.toLowerCase() === b.name.en.toLowerCase()) ? 0 : (a.name.en.toLowerCase() < b.name.en.toLowerCase()) ? -1 : 1;
        }
        if (a.name && a.name.en && (!b.name || !b.name.en)) {
            return (a.name.en.toLowerCase() === b.entityid.toLowerCase()) ? 0 : (a.entityid.toLowerCase() < b.entityid.toLowerCase()) ? -1 : 1;
        }
        if ((!a.name || !a.name.en) && b.name && b.name.en) {
            return (a.entityid.toLowerCase() === b.name.en.toLowerCase()) ? 0 : (a.entityid.toLowerCase() < b.name.en.toLowerCase()) ? -1 : 1;
        }
        return (a.entityid.toLowerCase() === b.entityid.toLowerCase()) ? 0 : (a.entityid.toLowerCase() < b.entityid.toLowerCase()) ? -1 : 1;
    }

    fetchMetadata();

    function renderEntity(set, id) {
        if ("saml20-sp-remote" === set) {

            entry = spData[id];
            nameIDs = [];
            supportedNameIDFormats.forEach(function (v) {
                if (entry.NameIDFormat === v) {
                    nameIDs.push({
                        nameid: v,
                        enabled: true
                    });
                } else {
                    nameIDs.push({
                        nameid: v,
                        enabled: false
                    });
                }
            });

            idpList = [];
            // add all IdPs to the list
            idpData.forEach(function (v) {
                idpList.push({
                    entityid: v.entityid,
                    name: v.name,
                    state: v.state,
                    enabled: false,
                    consentdisable: (entry['consent.disable'] || (v['consent.disable'] && -1 !== v['consent.disable'].indexOf(entry.entityid))) ? true : false
                });
            });

            if (entry.IDPList) {
                idpList.forEach(function (v, k) {
                    if (-1 !== entry.IDPList.indexOf(v.entityid)) {
                        idpList[k].enabled = true;
                    }
                });
            }
            
            // sort the IdPs by name
            idpList.sort(sortEntities);

            attributeList = [];
            // add the "default" attributes to the list
            allAttributes.forEach(function (v) {
                attributeList.push({
                    attribute: v,
                    enabled: false,
                    custom: false
                });
            });

            if (entry.attributes) {
                entry.attributes.forEach(function (v, k) {
                    // add the attribute to the attributeList if it is not
                    // not there, or enable it if it is there
                    var idx = allAttributes.indexOf(v);
                    if (-1 !== idx) {
                        attributeList[idx].enabled = true;
                    } else {
                        attributeList.push({
                            attribute: v,
                            enabled: true,
                            custom: true
                        });
                    }
                });
            }

            // sort by enabledness and then alphabetically
            attributeList.sort(sortAttributes);

            // alert(JSON.stringify(idpList));
            entry.jsonData = JSON.stringify(entry, null, 4);
            entry.identityProviders = idpList;
            entry.attributeList = attributeList;
            entry.nameIDs = nameIDs;

            $("#entityViewModal").html($("#entityViewServiceProviderModalTemplate").render({
                set: set,
                id: id,
                entry: entry,
                logs: (logData[set][spData[id].entityid]) ? logData[set][spData[id].entityid] : []
            }));
            $("#entityViewModal").modal('show');
        }
        if ("saml20-idp-remote" === set) {
            // fetching a list of all SPs
            entry = idpData[id];

            spList = [];
            // add all SPs to the list
            spData.forEach(function (v) {
                if (-1 === v.IDPList.indexOf(entry.entityid)) {
                    spList.push({
                        entityid: v.entityid,
                        name: v.name,
                        state: v.state,
                        consentdisable: v['consent.disable'],
                        enabled: false
                    });
                } else {
                    spList.push({
                        entityid: v.entityid,
                        name: v.name,
                        consentdisable: v['consent.disable'],
                        state: v.state,
                        enabled: true
                    });
                }
            });

            // sort the SPs by name
            spList.sort(sortEntities);

            entry.jsonData = JSON.stringify(entry, null, 4);
            entry.serviceProviders = spList;

            $("#entityViewModal").html($("#entityViewIdentityProviderModalTemplate").render({
                set: set,
                id: id,
                entry: entry,
                logs: (logData[set][idpData[id].entityid]) ? logData[set][idpData[id].entityid] : []
            }));
            $("#entityViewModal").modal('show');

        }
        // unsupported type, do nothing

    }

    $(document).on('click', '#metadataListTable a', function (event) {
        renderEntity($(this).data('set'), $(this).data('id'));
        event.preventDefault();
    });

    $(document).on('click', '#listIdPs', function (event) {
        renderIdPList();
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#listSPs', function (event) {
        renderSPList();
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#basicButton', function (event) {
        $("form.entryForm").hide();
        $("form#basicForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

    $(document).on('click', '#samlButton', function (event) {
        $("form.entryForm").hide();
        $("form#samlForm").show();
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

    $(document).on('click', '#conextButton', function (event) {
        $("form.entryForm").hide();
        $("form#conextForm").show();
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

    $(document).on('click', '#logButton', function (event) {
        $("form.entryForm").hide();
        $("form#logForm").show();
        $("ul.entitynav").children().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });

});
