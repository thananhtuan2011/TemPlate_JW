import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import {
    PageFilterBranch,
    BranchService,
} from 'src/app/service/branch.service';
import { Branch } from 'src/app/models/branch.model';
import { Router } from '@angular/router';
import { DecideService } from 'src/app/service/decide.service';
import { BranchFormComponent } from '../../employee-module/branch/components/branch-form/branch-form.component';
import { WarehouseFloorsService } from '../../../service/warehouse-floors.service';

@Component({
    templateUrl: './good-warehouse-floors.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [
        `
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }
        `,
    ],
})
export class GoodWarehouseFloorsComponent implements OnInit {
    get floors(): any[] {
        return this._floors;
    }

    set floors(value: any[]) {
        this._floors = value;
    }

    public appConstant = AppConstant;
    @ViewChild('branchForm') branchFormComponent:
        | BranchFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public params: PageFilterBranch = {
        page: 1,
        pageSize: 10,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    private _floors: any[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    constructor(
        private messageService: MessageService,
        private readonly branchService: BranchService,
        private readonly decideService: DecideService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly warehouseFloorsService: WarehouseFloorsService,
        private router: Router,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getFloors();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.params.isSort = event.value;
        }
        this.getFloors();
    }

    getFloors(event?: any, isExport: boolean = false): void {
        if (event) {
            this.params.page = event.first / event.rows + 1;
            this.params.pageSize = event.rows;
        }

        this.pendingRequest = this.warehouseFloorsService
            .getWareHouseFloorsPaging(this.params)
            .subscribe((response: TypeData<Branch>) => {
                AppUtil.scrollToTop();
                this._floors = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(id) {
        this.warehouseFloorsService
            .getWareHouseFloorsDetail(id)
            .subscribe((response: any) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAddBranch() {
        this.isEdit = false;
        this.showDialog();
    }

    onDelete(decideId) {
        let message;
        let header;
        this.translateService
            .get('question.delete_content')
            .subscribe((res) => {
                message = res;
            });
        this.translateService
            .get('question.confirm_header')
            .subscribe((res) => {
                header = res;
            });
        this.confirmationService.confirm({
            header: header,
            message: message,
            accept: () => {
                this.warehouseFloorsService
                    .deleteFloors(decideId)
                    .subscribe((response: any) => {
                        this.getFloors();
                    });
            },
        });
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.branchService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.branchFormComponent.onReset();
        this.display = true;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddBranch();
                break;
        }
    }
}
