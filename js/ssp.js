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
                $("#metadataListTable").html($("#metadataListTemplate").render({ entry: data}));
                // if(data.totalResults > maxPageLength) {
                    // show pagination stuff
                //    var d = {numberList: []};
                 //   for(var i = 0; i < Math.ceil(data.totalResults / maxPageLength); i++) {
                  //      d.numberList.push({'pageNumber': i, activePage: Math.ceil(startIndex / maxPageLength)});
                   // }
                   // $("#groupListPagination").html($("#paginationTemplate").render(d));
                //}
            }
        });
    }

    function renderMemberList(groupId, startIndex) {
        $.oajax({
            url: apiEndpoint + "/people/@me/" + groupId + 
                "?startIndex=" + startIndex + 
                "&count=" + maxPageLength +
                "&sortBy=displayName",
            jso_provider: "html-manage-ssp",
            jso_scopes: apiScope,
            jso_allowia: true,
            dataType: 'json',
            success: function (data) {
                $("#memberListTable").html($("#memberListTemplate").render(data));
                if(data.totalResults > maxPageLength) {
                    // show pagination stuff
                    var d = {numberList: []};
                    for(var i = 0; i < Math.ceil(data.totalResults / maxPageLength); i++) {
                        d.numberList.push({'pageNumber': i, 'groupId': groupId, activePage: Math.ceil(startIndex / maxPageLength)});
                    }
                    $("#memberListPagination").html($("#paginationTemplate").render(d));
                } else {
                    $("#memberListPagination").empty();
                }
                $("#memberListModal").modal('show');
            }
        });
    }

    $(document).on('click', '#groupListTable a', function() {
        renderMemberList($(this).data('groupId'), 0);
    });

    $(document).on('click', '#groupListPagination a', function() {
        renderGroupList($(this).data('pageNumber')*maxPageLength);
    });

    $(document).on('click', '#memberListPagination a', function() {
        renderMemberList($(this).data('groupId'), $(this).data('pageNumber')*maxPageLength);
    });

    function initPage() {
        renderMetadataList('saml20-sp-remote');
    }
    initPage();
});
