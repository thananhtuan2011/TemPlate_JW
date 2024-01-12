import {
    Component,
    EventEmitter,
    Injector,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import AppConstant from '../../../../../utilities/app-constants';
import AppUtil from '../../../../../utilities/app-util';
import { ChartOfAccountService } from '../../../../../service/chart-of-account.service';
import { AssetsFixedService } from '../../../../../service/assets-fixed.service';
import { TranslateService } from '@ngx-translate/core';
import { AssetsFixed242Service } from '../../../../../service/assets-fixed-242.service';
import { DatePipe } from '@angular/common';
import { BaseAccountComponent } from 'src/app/shared/components/BaseAccountComponent';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-ccdc',
    templateUrl: './ccdc.component.html',
    styleUrls: ['ccdc.component.scss'],
})
export class CcdcComponent extends BaseAccountComponent implements OnInit {
    @ViewChild('debitCodeTmp') debitCodeTmp: AutoComplete;
    @ViewChild('debitDetailCodeFirstTmp') debitDetailCodeFirstTmp: AutoComplete;
    @ViewChild('debitDetailCodeSecondTmp')
    debitDetailCodeSecondTmp: AutoComplete;
    @ViewChild('creditCodeTmp') creditCodeTmp: AutoComplete;
    @ViewChild('creditDetailCodeFirstTmp')
    creditDetailCodeFirstTmp: AutoComplete;
    @ViewChild('creditDetailCodeSecondTmp')
    creditDetailCodeSecondTmp: AutoComplete;

    @Input('paramToGetLedgers') paramToGetLedgers: any = {};
    @Output() onCancel = new EventEmitter();
    appConstant = AppConstant;
    appUtil = AppUtil;
    items: MenuItem[] = [
        { label: 'CCDC trong kho' },
        { label: 'CCDC đang sử dụng' },
    ];

    activeIndex = 0;
    isErrorText = false;

    totalRecords = 0;
    totalPages = 0;
    first = 0;
    fixedAssets: any[] = [];
    fixedAssets242: any[] = [];
    loading: boolean = false;
    checkAllFixedAsset = false;
    checkAllFixedAsset242 = false;
    isAutoAddDetail = false;

    values = Object.values;

    constructor(
        private assetsFixedService: AssetsFixedService,
        private assetsFixed242Service: AssetsFixed242Service,
        private messageService: MessageService,
        private translateService: TranslateService,
        fb: FormBuilder,
        chartOfAccountService: ChartOfAccountService,
        renderer: Renderer2,
        injector: Injector,
    ) {
        super(fb, chartOfAccountService, renderer, injector);
    }

    get formAccount() {
        return this.f;
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
            creditCode: [''],
            creditDetailCodeFirst: [''],
            creditDetailCodeSecond: [''],
        });
        this.getAllByDisplayInsert();
    }

    getFixedAssets(event?: any): void {
        this.formAccount.reset();
        this.isErrorText = false;
        this.checkAllFixedAsset = false;
        this.onCheckAllFixedAsset();
        this.checkAllFixedAsset242 = false;
        this.onCheckAllFixedAsset242();
        if (this.activeIndex) {
            this.getFixedAssets242();
        } else {
            this.loading = true;
            let params = {
                filterType: 4,
                filterMonth: this.paramToGetLedgers?.filterMonth,
                page: 0,
                isInternal: this.paramToGetLedgers?.isInternal,
                pageSize: 50,
            };
            this.assetsFixedService
                .getListAssets(params)
                .subscribe((response: any) => {
                    this.fixedAssets =
                        response.data?.reduce((arr, curr) => {
                            arr.push({
                                ...curr,
                                usedQuantity: curr.usedQuantity
                                    ? curr.usedQuantity
                                    : curr.quantity,
                                usedDate: curr.usedDate
                                    ? new DatePipe('en-us').transform(
                                          new Date(curr.usedDate),
                                          'dd/MM/yyyy',
                                      )
                                    : '',
                            });
                            return arr;
                        }, []) || [];
                    this.totalRecords = response.totalItems || 0;
                    this.totalPages =
                        response.totalItems / response.pageSize + 1;
                    this.loading = false;
                });
        }
    }

    getFixedAssets242(event?: any): void {
        this.loading = true;
        let params = {
            filterType: 4,
            filterMonth: this.paramToGetLedgers?.filterMonth,
            isInternal: this.paramToGetLedgers?.isInternal,
            page: 0,
            pageSize: 50,
        };
        this.assetsFixed242Service
            .getListAssets242(params)
            .subscribe((response: any) => {
                this.fixedAssets242 = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    onSaveAll(): void {
        if (this.activeIndex === 0) {
            const payload = (
                this.fixedAssets.filter((fa) => fa.checked) || []
            )?.reduce((arr, curr) => {
                arr.push({
                    ...curr,
                    usedDate: AppUtil.convertStringToDate(curr.usedDate),
                });
                return arr;
            }, []);
            this.assetsFixedService
                .addFixedAsset242FromFixedAsset(
                    this.paramToGetLedgers?.isInternal,
                    payload,
                )
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.activeIndex = 1;
                        this.getFixedAssets();
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
        } else {
            const payload = (
                this.fixedAssets242.filter((fa) => fa.checked) || []
            )?.reduce((arr, curr) => {
                arr.push({
                    ...curr,
                    debitCode:
                        this.fc['debitCode']?.value?.code || curr.debitCode,
                    debitDetailCodeFirst:
                        this.fc['debitDetailCodeFirst'].value?.code ||
                        curr.debitDetailCodeFirst,
                    debitDetailCodeSecond:
                        this.fc['debitDetailCodeSecond']?.value?.code ||
                        curr.debitDetailCodeSecond,
                    creditCode:
                        this.fc['creditCode']?.value?.code || curr.creditCode,
                    creditDetailCodeFirst:
                        this.fc['creditDetailCodeFirst']?.value?.code ||
                        curr.creditDetailCodeFirst,
                    creditDetailCodeSecond:
                        this.fc['creditDetailCodeSecond']?.value?.code ||
                        curr.creditDetailCodeSecond,
                });
                return arr;
            }, []);
            if (payload.length == 0) {
                this.messageService.add({
                    severity: 'warn',
                    detail: AppUtil.translate(
                        this.translateService,
                        'warning.select_data_need_update',
                    ),
                });
                return;
            }

            this.assetsFixed242Service
                .updateAsstes(this.paramToGetLedgers?.isInternal, payload)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.onCancel.emit({});
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: err.msg,
                        });
                    },
                );
        }
    }

    checkButtonSave(): boolean {
        const fixedAssetUpdates = (
            this.activeIndex ? this.fixedAssets242 : this.fixedAssets
        ).filter((fa) => fa.checked);
        return (
            (this.isCreditCodeHas || this.isDebitCodeHas) &&
            fixedAssetUpdates.length > 0
        );
    }

    onUpdateAccount(): void {
        const fixedAssetUpdates = (
            this.activeIndex ? this.fixedAssets242 : this.fixedAssets
        ).filter((fa) => fa.checked);
        if (!fixedAssetUpdates.length) {
            this.isErrorText = true;
            return;
        }
        this.isErrorText = false;
        const request =
            fixedAssetUpdates?.reduce((arr, curr) => {
                arr.push({
                    ...curr,
                    debitCode:
                        this.fc['debitCode']?.value?.code || curr.debitCode,
                    debitDetailCodeFirst:
                        this.fc['debitDetailCodeFirst'].value?.code ||
                        curr.debitDetailCodeFirst,
                    debitDetailCodeSecond:
                        this.fc['debitDetailCodeSecond']?.value?.code ||
                        curr.debitDetailCodeSecond,
                    creditCode:
                        this.fc['creditCode']?.value?.code || curr.creditCode,
                    creditDetailCodeFirst:
                        this.fc['creditDetailCodeFirst']?.value?.code ||
                        curr.creditDetailCodeFirst,
                    creditDetailCodeSecond:
                        this.fc['creditDetailCodeSecond']?.value?.code ||
                        curr.creditDetailCodeSecond,
                    usedDate: AppUtil.convertStringToDate(curr.usedDate),
                });
                return arr;
            }, []) || [];
        let api: any = this.assetsFixedService.updateAsstesAccount(
            request,
            this.isAutoAddDetail,
        );
        if (this.activeIndex) {
            api = this.assetsFixed242Service.updateAsstesAccount(
                request,
                this.isAutoAddDetail,
            );
        }
        api.subscribe(
            (res) => {
                this.getFixedAssets();
            },
            (err) => {},
        );
    }

    onCheckAllFixedAsset(): void {
        this.fixedAssets = this.fixedAssets.map((item) => {
            return {
                ...item,
                checked: this.checkAllFixedAsset,
            };
        });
    }

    onCheckAllFixedAsset242(): void {
        this.fixedAssets242 = this.fixedAssets242.map((item) => {
            return {
                ...item,
                checked: this.checkAllFixedAsset242,
            };
        });
    }

    onKeyDownUsedDate(event, item: any): void {
        let data = item?.usedDate;
        if (isNaN(Number(event.key))) data.replace(event.key, '');
        else {
            data = data.replace('/', '');
            data = data.replace('/', '');
            if (data?.length === 3)
                item.usedDate = `${data.substring(0, 2)}/${data.substring(2)}`;
            if (data?.length > 3)
                item.usedDate = `${data.substring(0, 2)}/${data.substring(
                    2,
                    4,
                )}/${data.substring(4)}`;
        }
    }
}
