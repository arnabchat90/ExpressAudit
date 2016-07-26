/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/microsoft-ajax/microsoft.ajax.d.ts" />
/// <reference path="typings/sharepoint/sharepoint.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/knockout.mapping/knockout.mapping.d.ts" />
var main;
(function (main) {
    var Services = (function () {
        function Services() {
        }
        Services.prototype.AjaxGetCall = function (fullUrl) {
            var self = this;
            $.ajax({
                url: fullUrl,
                cache: false,
                success: function (data) { self.callbackFunction(data); },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("error :" + XMLHttpRequest.responseText);
                    alert('There was an error in performing this operation. ' + errorThrown);
                }
            });
        };
        Services.prototype.AjaxPostCall = function (fullUrl, dataObj) {
            var self = this;
            $.ajax({
                url: fullUrl,
                cache: false,
                data: dataObj,
                success: function (data) {
                    self.callbackFunction(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("error :" + XMLHttpRequest.responseText);
                    alert('There was an error in performing this operation. ' + errorThrown);
                }
            });
        };
        return Services;
    }());
    main.Services = Services;
    var EventDetails = (function () {
        function EventDetails(data) {
            var self = this;
            if (data != null) {
                self.Site_Id = ko.observable(data.Site_Id);
                self.Item_Id = ko.observable(data.Item_Id);
                self.Item_type = ko.observable(data.Item_type);
                self.User_Id = ko.observable(data.User_Id);
                self.Document_Location = ko.observable(data.Document_Location);
                self.Occurred__GMT_ = ko.observable(data.Occurred__GMT_);
                self.Event = ko.observable(data.Event);
                self.Custom_Event_Name = ko.observable(data.Custom_Event_Name);
                self.Event_Source = ko.observable(data.Event_Source);
                self.Source_Name = ko.observable(data.Source_Name);
                self.Event_Data = ko.observable(data.Event_Data);
                self.App_Id = ko.observable(data.App_Id);
            }
        }
        return EventDetails;
    }());
    main.EventDetails = EventDetails;
    var DataGrid = (function () {
        // allDataRows = new Array();
        function DataGrid(url, pageSize) {
            var self = this;
            self.eventMapping = {
                create: function (options) {
                    return new main.EventDetails(options.data);
                }
            };
            self.getDataURL = url;
            self.dataGridParams = {
                pageIndex: ko.observable(1),
                pageSize: ko.observable(pageSize),
                sortField: ko.observable(''),
                sortOrder: ko.observable('ASC'),
                totalRows: ko.observable(0),
                totalPages: ko.observable(0),
                requestedPage: ko.observable(0),
                pageSizeOptions: [5, 10, 20, 30, 50, 100]
            };
            self.DataRows = ko.observableArray();
            self.DataRowsFiltered = ko.computed(function () {
                return ko.utils.arrayFilter(self.DataRows(), function (rec) {
                    return ((self.search_Event().length == 0 || rec.Event.toLowerCase().indexOf(self.search_Event().toLowerCase()) > -1));
                });
            });
            self.SelectedPageSizeOption = ko.observable(pageSize);
            self.dataGridParams.requestedPage.subscribe(self.FlipPageDirect, self);
            self.SelectedPageSizeOption.subscribe(self.ChangePageSize, self);
            self.search_Event = ko.observable('');
        }
        DataGrid.prototype.GetData = function () {
            var self = this;
            var objService = new main.Services();
            objService.AjaxGetCall(self.getDataURL);
            objService.callbackFunction = function (data) {
                self.onGetDataDone(data);
            };
        };
        DataGrid.prototype.onGetDataDone = function (data) {
            var self = this;
            // self.DataRows(data.result);
            ko.mapping.fromJS(data, { result: self.eventMapping }, self.DataRows);
            self.DataRows(data.result);
            self.DataRowsFiltered = ko.computed(function () {
                return ko.utils.arrayFilter(self.DataRows(), function (rec) {
                    return ((self.search_Event().length == 0 || rec.Event.toLowerCase().indexOf(self.search_Event().toLowerCase()) > -1));
                });
            });
            self.dataGridParams.totalRows(data.totalCount);
            var totalPages = Math.ceil(self.dataGridParams.totalRows() / self.dataGridParams.totalPages());
            self.dataGridParams.totalPages(totalPages);
            self.dataGridParams.requestedPage(self.dataGridParams.pageIndex());
        };
        DataGrid.prototype.FlipPage = function (newPageNo) {
            var self = this;
            if (parseInt(newPageNo) > 0 && parseInt(newPageNo) <= self.dataGridParams.totalPages()) {
                self.dataGridParams.pageIndex(parseInt(newPageNo));
                self.GetData();
            }
        };
        DataGrid.prototype.FlipPageDirect = function (newValue) {
            var self = this;
            var ri = self.dataGridParams.requestedPage();
            if (ri == 0) {
                self.dataGridParams.pageIndex(ri);
                return;
            }
            if (ri > 0 && ri <= self.dataGridParams.totalPages()) {
                self.dataGridParams.pageIndex(ri);
                self.GetData();
                return;
            }
            self.dataGridParams.requestedPage(self.dataGridParams.pageIndex());
        };
        DataGrid.prototype.ChangePageSize = function () {
            var self = this;
            if (self.dataGridParams.pageSize() != self.SelectedPageSizeOption()) {
                self.dataGridParams.pageSize(self.SelectedPageSizeOption());
                self.dataGridParams.requestedPage(1);
                self.GetData();
            }
        };
        DataGrid.prototype.Sort = function (col) {
            var self = this;
            if (self.dataGridParams.sortField() === col) {
                if (self.dataGridParams.sortOrder() === 'ASC') {
                    self.dataGridParams.sortOrder('DESC');
                }
                else {
                    self.dataGridParams.sortOrder('ASC');
                }
            }
            else {
                self.dataGridParams.sortOrder('ASC');
                self.dataGridParams.sortField(col);
            }
            self.GetData();
        };
        return DataGrid;
    }());
    main.DataGrid = DataGrid;
})(main || (main = {}));
//# sourceMappingURL=expressAudit.js.map