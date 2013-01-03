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
                $("#metadataListTable").html($("#metadataListTemplate").render({ set: set, entry: data}));
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
                $("#entryListTable").html($("#entryListTemplate").render(data));
                $("#entryListModal").modal('show');
            }
        });
    }

    $(document).on('click', '#metadataListTable a', function() {
        renderEntryList($(this).data('set'), $(this).data('id'));
    });

    function initPage() {
        renderMetadataList('saml20-idp-remote');
    }
    initPage();
});
