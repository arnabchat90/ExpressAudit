/// <reference path="jquery-1.9.1.js" />
'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

function initializePage()
{
    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {
        getUserName();
        $("#progress").hide();
    });

    $("#uploadBtn").click(function () {
        var data = new FormData();
        jQuery.each(jQuery('#uploadControl')[0].files, function (i, file) {
            data.append('file-' + i, file);
        });
        jQuery.support.cors = true;
       // alert(data);
        $.ajax({
            url: 'https://exceltojsonwebapi.azurewebsites.net/api/upload',
            crossDomain : true,
            type: 'POST',
            //xhr: function () {
            //    var myXhr = $.ajaxSettings.xhr();
            //    if (myXhr.upload) {
            //        myXhr.upload.addEventListener('progress', progressHandlingFunction, false);
            //    }
            //    return myXhr;
            //},
            success: completeHandler,
            error: errorHandler,
            data: data,
            cache: false,
            contentType: false,
            processData : false
        });
    });

    function progressHandlingFunction(e) {
        if (e.lengthComputable) {
            $('#progress').show();
            $('progress').attr({ value: e.loaded, max: e.total });
        }
    }

    function completeHandler() {
        alert("Successfully uploaded");
    }

    function errorHandler(x, status, error) {
        alert("Status code = " + status);
        alert("Http Post request failed " + error);
    }

    // This function prepares, loads, and then executes a SharePoint query to get the current users information
    function getUserName() {
        context.load(user);
        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
    }

    // This function is executed if the above call is successful
    // It replaces the contents of the 'message' element with the user name
    function onGetUserNameSuccess() {
        $('#message').text('Hello ' + user.get_title());
    }

    // This function is executed if the above call fails
    function onGetUserNameFail(sender, args) {
        alert('Failed to get user name. Error:' + args.get_message());
    }
}
