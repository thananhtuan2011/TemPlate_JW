import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { MenuOfGoodsFormComponent } from './component/menu-of-goods-form/menu-of-goods-form.component';
import {
    CategoryService,
    PageFilterCategory,
} from 'src/app/service/category.service';
import { Category } from 'src/app/models/category.model';
import { AddPriceListComponent } from './component/add-price-list/add-price-list.component';
import { ComparePricesComponent } from './component/compare-prices/compare-prices.component';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-menu-of-goods',
    templateUrl: './menu-of-goods.component.html',
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
            :host ::ng-deep .p-button {
                height: 40px;
            }
            :host ::ng-deep .flex-show-web {
                display: flex;
                justify-content: center;
            }
        `,
    ],
})
export class MenuOfGoodsComponent implements OnInit {
    appUtil = AppUtil;
    @ViewChild('categoryForm') categoryForm: MenuOfGoodsFormComponent;
    @ViewChild('addPriceListComponent', { static: false })
    addPriceListComponent: AddPriceListComponent;
    @ViewChild('addCompareComponent', { static: false })
    addCompareComponent: ComparePricesComponent;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterCategory = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        type: 0,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public categories: Category[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    types: any = {};

    constructor(
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly categoryService: CategoryService,
        private router: Router,
        private messageService: MessageService,
    ) {}

    ngOnInit() {
        this.appUtil
            .getRoomTableSortTypes(this.translateService)
            .subscribe((res) => {
                this.sortFields = res;
            });
        this.appUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.types = this.appUtil.getCategoryTypes();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getCategories();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getCategories();
    }

    getCategories(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.categoryService
            .getPaging(this.getParams)
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                this.categories = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(id) {
        this.isEdit = true;
        this.categoryForm.getDetail(id);
        this.display = true;
    }

    onAddCategory() {
        this.isEdit = false;
        this.categoryForm.onReset();
        this.display = true;
    }

    onConfirmDelete(item: any) {
        if (item.type == 4) {
            this.categoryService
                .checkExistInGoodsAsync(item.code)
                .subscribe((res) => {
                    if (!res) {
                        this.onDelete(item.id);
                    } else {
                        let message;
                        this.translateService
                            .get('question.delete_category_content_price_list')
                            .subscribe((res) => {
                                message = res;
                            });

                        this.confirmationService.confirm({
                            message: message,
                            key: 'categoryExistInGoodsTmp',
                        });
                    }
                });
        } else {
            this.onDelete(item.id);
        }
    }

    private onDelete(id) {
        let message;
        this.translateService
            .get('question.delete_category_content')
            .subscribe((res) => {
                message = res;
            });

        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.categoryService
                    .deleteCategory(id)
                    .subscribe((response: any) => {
                        this.getCategories();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    getCategoryTypeName(value: number) {
        let category = this.types.category.find((x) => x.value === value);
        return category ? category.label : '';
    }

    addPriceList() {
        this.addPriceListComponent.show();
    }
    addComparePrices() {
        this.addCompareComponent.show();
    }
    comparePriceList() {
        this.router.navigateByUrl('compare-price-list');
    }
    onChangeShowWeb(data: any) {
        this.categoryService.update(data, data.id).subscribe();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddCategory();
                break;
        }
    }

    import(evt) {
        const objProps = [
            'code', //
            'name', //
            'type', //
            'note', //
        ];
        const target: DataTransfer = <DataTransfer>evt.target;
        if (target.files.length !== 1)
            throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            let dataImport = [];
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            /* save data */
            const datas = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                blankrows: false,
                range: 6,
            }) as any;

            if (datas && datas?.length > 0) {
                datas.forEach((element) => {
                    const objItem = {};
                    objProps.forEach((item, index) => {
                        objItem[item] = element[index + 1];
                    });
                    dataImport.push(objItem);
                });
            }
            this.categoryService.import(dataImport).subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
            });
        };
        reader.readAsBinaryString(target.files[0]);
        (document.getElementById('fileInput') as HTMLInputElement).value = null;
    }
    exportExcel() {
        this.categoryService
            .export(this.getParams.type || 0)
            .subscribe((res) => {
                this.openDownloadFile(res.data, `excel`);
            });
    }
    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.categoryService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {}
    }
}
