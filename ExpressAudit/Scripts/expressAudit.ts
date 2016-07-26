/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/microsoft-ajax/microsoft.ajax.d.ts" />
/// <reference path="typings/sharepoint/sharepoint.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/knockout.mapping/knockout.mapping.d.ts" />


module main {
    export class Services {
        //self: main.Services;
        //self = this;
        public callbackFunction: (data: any) => void;
        AjaxGetCall(fullUrl: string): void {
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

        }
        AjaxPostCall(fullUrl: string, dataObj: any): void {
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
        }
    }
    export class EventDetails {
        Site_Id: KnockoutObservable<string>;
        Item_Id: KnockoutObservable<string>;
        Item_type: KnockoutObservable<string>;
        User_Id: KnockoutObservable<string>;
        Document_Location: KnockoutObservable<string>;
        Occurred__GMT_: KnockoutObservable<string>;
        Event: KnockoutObservable<string>;
        Custom_Event_Name: KnockoutObservable<string>;
        Event_Source: KnockoutObservable<string>;
        Source_Name: KnockoutObservable<string>;
        Event_Data: KnockoutObservable<string>;
        App_Id: KnockoutObservable<string>;

        constructor(data: any) {
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

    }
    interface GridParams {
        pageIndex: KnockoutObservable<number>;
        pageSize: KnockoutObservable<number>;
        sortField: KnockoutObservable<string>;
        sortOrder: KnockoutObservable<string>;
        totalRows: KnockoutObservable<number>;
        totalPages: KnockoutObservable<number>;
        requestedPage: KnockoutObservable<number>;
        pageSizeOptions: number[];
    }
    export class DataGrid {
        getDataURL: string;
        // GridParams: {};
        DataRows: KnockoutObservableArray<{}>;
        SelectedPageSizeOption: KnockoutObservable<number>;
        dataGridParams: GridParams;
        search_Event: KnockoutObservable<string>;
        eventMapping: {};
        DataRowsFiltered: KnockoutComputed<{}[]>;
        // allDataRows = new Array();
        constructor(url: string, pageSize: number) {
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
                return ko.utils.arrayFilter(self.DataRows(), function (rec : any) {
                    return (
                        (self.search_Event().length == 0 || rec.Event.toLowerCase().indexOf(self.search_Event().toLowerCase()) > -1)
                    )
                });
            });
            self.SelectedPageSizeOption = ko.observable(pageSize);
            self.dataGridParams.requestedPage.subscribe(self.FlipPageDirect, self);
            self.SelectedPageSizeOption.subscribe(self.ChangePageSize, self);
            self.search_Event = ko.observable('');
           
        }
        GetData(): void {
            var self = this;
            var objService = new main.Services();
            objService.AjaxGetCall(self.getDataURL);
            objService.callbackFunction = (data) => {
                self.onGetDataDone(data);
            };
        }
        onGetDataDone(data: any): void {
            var self = this;
           // self.DataRows(data.result);
            ko.mapping.fromJS(data, { result: self.eventMapping }, self.DataRows);
            self.DataRows(data.result);
            self.DataRowsFiltered = ko.computed(function () {
                return ko.utils.arrayFilter(self.DataRows(), function (rec: any) {
                    return (
                        (self.search_Event().length == 0 || rec.Event.toLowerCase().indexOf(self.search_Event().toLowerCase()) > -1)
                    )
                });
            });
            self.dataGridParams.totalRows(data.totalCount);
            var totalPages = Math.ceil(self.dataGridParams.totalRows() / self.dataGridParams.totalPages());
            self.dataGridParams.totalPages(totalPages);
            self.dataGridParams.requestedPage(self.dataGridParams.pageIndex());
           
        }
        
        FlipPage(newPageNo: string): void {
            var self = this;
            if (parseInt(newPageNo) > 0 && parseInt(newPageNo) <= self.dataGridParams.totalPages()) {
                self.dataGridParams.pageIndex(parseInt(newPageNo));
                self.GetData();
            }
        }
        FlipPageDirect(newValue: any): void {
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
        }
        ChangePageSize(): void {
            var self = this;
            if (self.dataGridParams.pageSize() != self.SelectedPageSizeOption()) {
                self.dataGridParams.pageSize(self.SelectedPageSizeOption());
                self.dataGridParams.requestedPage(1);
                self.GetData();
            }
        }
        Sort(col: string): void {
            var self = this;
            if (self.dataGridParams.sortField() === col) {
                if (self.dataGridParams.sortOrder() === 'ASC') {
                    self.dataGridParams.sortOrder('DESC');
                } else {
                    self.dataGridParams.sortOrder('ASC');
                }
            } else {
                self.dataGridParams.sortOrder('ASC');
                self.dataGridParams.sortField(col);
            }
            self.GetData();
        }

    }
    
}