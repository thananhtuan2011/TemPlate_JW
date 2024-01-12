import {
    Component,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { AssetsFixedService } from 'src/app/service/assets-fixed.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AssetsFixed242Service } from 'src/app/service/assets-fixed-242.service';
import { BaseAccountComponent } from 'src/app/shared/components/BaseAccountComponent';

@Component({
    selector: 'app-ccdc-tscd',
    templateUrl: './ccdc-tscd.component.html',
    styleUrls: ['./ccdc-tscd.component.scss'],
})
export class CcdcTscdComponent
    extends BaseAccountComponent
    implements OnInit, OnChanges
{
    values = Object.values;
    appConstant = AppConstant;
    appUtil = AppUtil;
    isErrorText = false;
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
    @Input('type') type: string = '';
    @Input('typeValue') typeValue: number = 0;
    @Output() onCancel = new EventEmitter();

    public totalRecords = 0;
    public totalPages = 0;
    first = 0;

    //table ccdc
    fixedAssets: any[] = [];
    fixedAssetsSelected: any[] = [];
    checkAllFixedAsset = false;

    pendingRequest: any;
    loading: boolean = false;

    constructor(
        private assetsFixedService: AssetsFixed242Service,
        private messageService: MessageService,
        private translateService: TranslateService,
        fb: FormBuilder,
        chartOfAccountService: ChartOfAccountService,
        renderer: Renderer2,
        injector: Injector,
    ) {
        super(fb, chartOfAccountService, renderer, injector);
        this.form = this.fb.group({
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
            creditCode: [''],
            creditDetailCodeFirst: [''],
            creditDetailCodeSecond: [''],
        });
    }

    ngOnInit(): void {
        this.getAllByDisplayInsert();
    }

    ngOnChanges() {
        this.getFixedAssets();
    }

    get formAccount() {
        return this.f;
    }

    onSaveAll() {
        this.fixedAssetsSelected = this.fixedAssets?.filter((x) => x.checked);
        if (this.fixedAssetsSelected.length === 0) {
            return;
        }
        this.assetsFixedService
            .updateAsstes(
                this.paramToGetLedgers?.isInternal,
                this.fixedAssetsSelected,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
                this.onCancel.emit({});
            });
    }

    //#region event credit debit code

    getFixedAssets(event?: any) {
        this.f.reset();
        this.isErrorText = false;
        this.checkAllFixedAsset = false;
        this.onCheckAllFixedAsset();
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;

        let params = {
            filterType: this.typeValue,
            filterMonth: this.paramToGetLedgers?.filterMonth,
            page: 0,
            isInternal: this.paramToGetLedgers?.isInternal,
            pageSize: 50,
        };
        this.pendingRequest = this.assetsFixedService
            .getListAssets242(params)
            .subscribe((response: any) => {
                this.fixedAssets = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    checkButtonSave(): boolean {
        return this.isCreditCodeHas || this.isDebitCodeHas;
    }

    onSaveAllAccount() {
        if (this.fixedAssetsSelected.length === 0) {
            return;
        }
        this.fixedAssetsSelected.forEach((fixedAsset) => {
            if (this.isDebitCodeHas) {
                fixedAsset.debitCode =
                    this.fc['debitCode']?.value?.code || fixedAsset.debitCode;
            }
            if (this.isDebitDetailCodeFirstHas) {
                fixedAsset.debitDetailCodeFirst =
                    this.fc['debitDetailCodeFirst'].value?.code ||
                    fixedAsset.debitDetailCodeFirst;
            }
            if (this.isDebitDetailCodeSecondHas) {
                fixedAsset.debitDetailCodeSecond =
                    this.fc['debitDetailCodeSecond']?.value?.code ||
                    fixedAsset.debitDetailCodeSecond;
            }
            if (this.isCreditCodeHas) {
                fixedAsset.creditCode =
                    this.fc['creditCode']?.value?.code || fixedAsset.creditCode;
            }
            if (this.isCreditDetailCodeFirstHas) {
                fixedAsset.creditDetailCodeFirst =
                    this.fc['creditDetailCodeFirst']?.value?.code ||
                    fixedAsset.creditDetailCodeFirst;
            }
            if (this.isCreditDetailCodeSecondHas) {
                fixedAsset.creditDetailCodeSecond =
                    this.fc['creditDetailCodeSecond']?.value?.code ||
                    fixedAsset.creditDetailCodeSecond;
            }
        });
    }

    onDeleteAllAccount() {
        if (this.fixedAssetsSelected.length === 0) {
            return;
        }
        const requestDataIds =
            this.fixedAssetsSelected?.reduce((arr, curr) => {
                arr.push(curr?.id);
                return arr;
            }, []) || [];
        console.log(this.fixedAssetsSelected);
        this.assetsFixedService
            .deleteAssets(requestDataIds)
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.delete',
                    ),
                });
                this.onCancel.emit({});
            });
    }

    onUpdateAccount(): void {
        const fixedAssetUpdates = this.fixedAssets.filter((fa) => fa.checked);
        if (!fixedAssetUpdates.length || !this.checkButtonSave()) {
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
                });
                return arr;
            }, []) || [];
        this.assetsFixedService.updateAsstesAccount(request).subscribe(
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

    removeValueEmpty(obj) {
        Object.keys(obj).forEach((key) => {
            if (obj[key] === '') {
                delete obj[key];
            }
        });
        return obj;
    }
}
