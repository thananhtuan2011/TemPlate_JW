import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, SelectItem } from 'primeng/api';
import { RoomTable } from 'src/app/models/room-table.model';
import {
    PageFilterRoomTable,
    RoomTableService,
} from 'src/app/service/room-table.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-desk-table',
    templateUrl: './desk-table.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-dataview .p-dataview-footer {
                    margin-top: 0.5rem;
                }

                .p-paginator {
                    margin: 0;
                    background-color: inherit;
                }

                .card-table {
                    min-height: 80vh !important;
                }

                .p-paginator {
                    padding: 0 !important;
                }

                .p-orderlist .p-orderlist-header,
                .p-orderlist .p-orderlist-filter-container {
                    display: none;
                }

                .p-tabview .p-tabview-panels {
                    padding: 0;
                }

                .product-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .product-description {
                    margin: 0 0 1rem 0;
                }

                .product-category-icon {
                    vertical-align: middle;
                    margin-right: 0.5rem;
                }

                .product-category {
                    font-weight: 600;
                    vertical-align: middle;
                }

                .product-list-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    width: 100%;

                    img {
                        width: 150px;
                        box-shadow:
                            0 3px 6px rgba(0, 0, 0, 0.16),
                            0 3px 6px rgba(0, 0, 0, 0.23);
                        margin-right: 2rem;
                    }

                    .product-list-detail {
                        flex: 1 1 0;
                    }

                    .p-rating {
                        margin: 0 0 0.5rem 0;
                    }

                    .product-price {
                        font-size: 1.5rem;
                        font-weight: 600;
                        align-self: flex-end;
                    }

                    .product-list-action {
                        display: flex;
                        flex-direction: column;
                    }

                    .p-button {
                        margin-bottom: 0.5rem;
                    }
                }

                .product-grid-item {
                    margin: 0.5em;
                    border: 1px solid #dee2e6;

                    .product-grid-item-top,
                    .product-grid-item-bottom {
                        display: flex;
                    }

                    img {
                        width: 75%;
                        box-shadow:
                            0 3px 6px rgba(0, 0, 0, 0.16),
                            0 3px 6px rgba(0, 0, 0, 0.23);
                        margin: 0.5rem 0;
                    }

                    .product-grid-item-content {
                        text-align: center;
                    }

                    .product-price {
                        font-size: 1.5rem;
                        font-weight: 600;
                    }
                }
            }

            .status-instock {
                text-align: right;
                font-weight: bold;
                color: green;
            }

            .status-outofstock {
                text-align: right;
                font-weight: bold;
                color: red;
            }

            .status-lowstock {
                text-align: right;
                font-weight: bold;
                color: orange;
            }

            .card {
                padding: 1rem;
                padding-bottom: 0;
                box-shadow:
                    0 2px 1px -1px rgba(0, 0, 0, 0.2),
                    0 1px 1px 0 rgba(0, 0, 0, 0.14),
                    0 1px 3px 0 rgba(0, 0, 0, 0.12) !important;
                border-radius: 4px !important;
            }

            @media screen and (max-width: 576px) {
                :host ::ng-deep .product-list-item {
                    flex-direction: column;
                    align-items: center;

                    img {
                        width: 75%;
                        margin: 2rem 0;
                    }

                    .product-list-detail {
                        text-align: center;
                    }

                    .product-price {
                        align-self: center;
                    }

                    .product-list-action {
                        display: flex;
                        flex-direction: column;
                    }

                    .product-list-action {
                        margin-top: 2rem;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                    }
                }
            }
        `,
    ],
})
export class DeskTableComponent implements OnInit {
    @Input('floorTabs') floorTabs: any[] = [];
    @Input('isSeller') isSeller: boolean = false;

    @Output('addBill') addBill = new EventEmitter();
    selectedFloorId: number = 0;

    first = 0;

    public deskFloors: RoomTable[] = [];
    pendingRequest: any;
    loading: boolean = false;

    public getParams: PageFilterRoomTable = {
        page: 1,
        pageSize: 8,
        sortField: 'id',
        isSort: true,
        floorId: 0,
        isFloor: 'true',
        searchText: '',
    };

    sortOptions: SelectItem[];

    sortOrder: number;

    sortField: string;

    public totalRecords = 0;
    public totalPages = 0;

    constructor(
        private roomTableService: RoomTableService,
        private messageService: MessageService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.sortOptions = [
            { label: 'Price High to Low', value: '!price' },
            { label: 'Price Low to High', value: 'price' },
        ];
        this.selectedFloorId = this.floorTabs[0]?.id ?? 0;
        this.getRoomTable();

    }

    onChangeFloorTab(event) {
        this.selectedFloorId = this.floorTabs[event.index].id;
        this.getRoomTable();
    }

    onSortChange(event) {
        let value = event.value;

        if (value.indexOf('!') === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
        }
    }

    getRoomTable(event?: any): void {
        console.log('on get room table');
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        let params = Object.assign({}, this.getParams);
        if (event) {
            params.page = event.first / event.rows + 1;
            params.pageSize = event.rows;
        }
        params.isFloor = 'false';
        if (this.selectedFloorId) params.floorId = this.selectedFloorId;
        this.pendingRequest = this.roomTableService
            .getList(params)
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                console.log(response);
                this.deskFloors = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    onSelectDesk(desk) {
        if (!desk.isChoose) {
            desk.deskName = this.deskFloors.find((x) => x.id === desk.id).name;
            console.log('desk ', desk);
            // check exist desk selected
            if (desk.isChoose) {
                this.messageService.add({
                    severity: 'info',
                    detail: AppUtil.translate(
                        this.translateService,
                        'Bàn đã được chọn',
                    ),
                });
            }
            // create new bill temp

            // active tab bill
            this.addBill.emit(desk);
        }
    }

    displayEditDesc = false;
    selectedDesc: any = {};
    onEditDesc(desk) {
        console.log('on change edit desc', desk);
        this.selectedDesc = desk;
        this.displayEditDesc = true;
        // show dialog edit desc
    }

    onSuccessEditDesc() {
        console.log(this.selectedDesc);
        this.roomTableService
            .update(this.selectedDesc, this.selectedDesc.id)
            .subscribe((res) => {
                console.log(res);
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            });
        this.displayEditDesc = false;
    }
}
