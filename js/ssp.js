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
                $("#metadataListTable").html($("#metadataListTemplate").render({set: set, entry: data}));
            }
        });
    }

    function renderEntryList(set, id) {
        $.oajax({
            url: apiEndpoint + "/" + set + "/" + id,
            jso_provider: "html-manage-ssp",
            jso_scopes: apiScope,
            jso_allowia: true,
            dataType: 'json',
            success: function (data) {
                $("#entityViewModal").html($("#entityViewModalTemplate").render({set: set, entry: data}));
                $("#entityViewModal").modal('show');
            }
        });
    }

    $(document).on('click', '#metadataListTable a', function() {
        renderEntryList($(this).data('set'), $(this).data('id'));
    });

    $(document).on('click', '#listIdPs', function() {
        renderMetadataList('saml20-idp-remote');
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    $(document).on('click', '#listSPs', function() {
        renderMetadataList('saml20-sp-remote');
        $("ul.nav").children().removeClass("active");
        $(this).parent().addClass("active");
    });

    function initPage() {
        renderMetadataList('saml20-idp-remote');
        $("ul.nav").children().first().addClass("active");
    }
    initPage();
});
