<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink Name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />
    <link href="../Content/bootstrap.css" rel="stylesheet" />
    <link href="../Content/Main.css" rel="stylesheet" />
    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
    <script src="../Scripts/jquery-1.9.1.js"></script>
    <script src="../Scripts/bootstrap.js"></script>
    <script src="../Scripts/knockout-3.4.0.js"></script>
    <script src="../Scripts/knockout.mapping-latest.js"></script>
    <script src="../Scripts/expressAudit.js"></script>
    <script type="text/javascript">
        RemotePartLoaded = 0;
        $('<iframe src="https://exceltojsonwebapi.azurewebsites.net" style="display:none" onload="javascript:RemotePartLoaded=1;"></iframe>').appendTo('body');
        function ExecuteOrDelayUntilRemotePartyLoaded(func) {
            if (RemotePartLoaded === 1) {
                func();
            }
            else {
                console.log("not loaded");
                setTimeout(function () { ExecuteOrDelayUntilRemotePartyLoaded(func); }, 1000);
            }
        }
    </script>

</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Xpress Audit
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    
    <div>
        <p id="message">
            <!-- The following content will be replaced with the user name when you run the app - see App.js -->
            initializing...
        </p>
        <form enctype="multipart/form-data">
            <fieldset id="uploadDiv" style="margin-bottom:30px;">
               <legend> Upload updated audit log reports:</legend>
                    <input type="file" id="uploadControl" /><br />
                    <input type="button" id="uploadBtn" value="Upload" />
                    <progress id="progress"></progress>
            </fieldset>
        </form>
    </div>
    <div id="XPRAuditGrid_Filter">
        Event <u>contains</u>:
        <input data-bind="value: search_Event, valueUpdate: 'afterkeydown'" style="width: 80px" />
        <br />
    </div>
    <div id="XPRAuditGrid">
        <table class="table table-striped table-hover" style="font-family: segoe ui; font-size: 10px;">
            <thead>
                <tr class="success">
                    <th><a href="#" onclick="XPRAudit.DashBoard.Grid.Sort('Occurred__GMT_')" class="sortCol">Occurred (GMT)</a></th>
                    <th><a href="#" onclick="XPRAudit.DashBoard.Grid.Sort('Event')" class="sortCol">Event</a></th>
                    <th>User</th>
                    <th>Event Data</th>
                </tr>
            </thead>
            <tbody data-bind="foreach: XPRAudit.DashBoard.Grid.DataRowsFiltered">
                <tr>
                    <td data-bind="text: Occurred__GMT_"></td>
                    <td data-bind="text: Event"></td>
                    <td data-bind="text: User_Id"></td>
                    <td data-bind="text: Event_Data"></td>
                </tr>
            </tbody>
        </table>
        <div class="pagerWrap">
            <ul class="grdLinePager">
                <li class="liBgFirst"><a href="#" onclick="RIT.eW.Dashboard.StudentDataGrid.FlipPage(1)"></a></li>
                <li class="liBgPrev"><a href="#" data-bind="click: function () { XPRAudit.DashBoard.Grid.FlipPage(XPRAudit.DashBoard.Grid.dataGridParams.pageIndex() - 1) }"></a></li>
                <li class="liBgCur">
                    <input data-bind="value: XPRAudit.DashBoard.Grid.dataGridParams.requestedPage" type="text" />
                    <span>of total</span>
                    <span data-bind="text: XPRAudit.DashBoard.Grid.dataGridParams.totalPages()"></span>
                    <span>pages</span>
                </li>
                <li class="liBGNext"><a href="#" data-bind="click: function () { XPRAudit.DashBoard.Grid.FlipPage(XPRAudit.DashBoard.Grid.dataGridParams.pageIndex() + 1) }"></a></li>
                <li class="liBGLast"><a href="#" data-bind="click: function () { XPRAudit.DashBoard.Grid.FlipPage(XPRAudit.DashBoard.Grid.dataGridParams.totalPages()) }"></a></li>
            </ul>
            <div class="pagerNumWrap">
                <span># of rows in page </span>
                <select data-bind="options: XPRAudit.DashBoard.Grid.dataGridParams.pageSizeOptions, value: XPRAudit.DashBoard.Grid.SelectedPageSizeOption "></select>
            </div>
            <!--this is for demo only. unhide it in style to view -->
            <ul class="grdPager" data-bind="foreach: new Array(XPRAudit.DashBoard.Grid.dataGridParams.totalPages())" style="display: none">
                <li><a href='#' data-bind="click: function () { XPRAudit.DashBoard.Grid.FlipPage($index() + 1) }, text: ($index() + 1), style: { color: ($index() + 1) == XPRAudit.DashBoard.Grid.dataGridParams.pageIndex() ? 'black' : 'blue' } "></a></li>
            </ul>
        </div>
    </div>
    <script type="text/javascript">
        //$(document).ready(function () {
        var XPRAudit = XPRAudit || {};
        XPRAudit.DashBoard = XPRAudit.DashBoard || {};
        XPRAudit.DashBoard.Grid = new main.DataGrid('https://exceltojsonwebapi.azurewebsites.net/api/getexceljson', 5);
        XPRAudit.DashBoard.init = function () {
            XPRAudit.DashBoard.Grid.GetData();
            ko.applyBindings(XPRAudit.DashBoard.Grid.DataRows, $("#XPRAuditGrid")[0]);
            ko.applyBindings(XPRAudit.DashBoard.Grid, $("#XPRAuditGrid_Filter")[0])
        }
        XPRAudit.DashBoard.init();
        //});
    </script>
</asp:Content>


