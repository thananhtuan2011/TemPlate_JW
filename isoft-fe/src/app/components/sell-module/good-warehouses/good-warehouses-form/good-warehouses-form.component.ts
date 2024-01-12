import {Component, EventEmitter, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/api';
import {AutoComplete} from 'primeng/autocomplete';
import {ChartOfAccountService} from 'src/app/service/chart-of-account.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import {environment} from 'src/environments/environment';
import {AccountType, AddAccountDetailType,} from '../../../accounting-module/account-v2/account.model';
import {GoodWarehouseService} from '../../../../service/good-warehouse.service';
import {
    AddEditAccountDetailsComponent
} from 'src/app/components/accounting-module/account-v2/dialogs/add-edit-account-details/add-edit-account-details.component';
import {
    AddEditAccountComponent
} from 'src/app/components/accounting-module/account-v2/dialogs/add-edit-account/add-edit-account.component';

@Component({
    selector: 'app-good-warehouses-form',
    templateUrl: './good-warehouses-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                p-inputnumber, .p-inputnumber {
                    height: 42px;
                }

                .p-inputtext,
                .p-dropdown {
                    min-height: 40px;
                }

                .p-calendar {
                    width: 100%;
                }
            }

            .style_prev_kit {
                display: inline-block;
                border: 0;
                width: 128px;
                height: 128px;
                position: relative;
                -webkit-transition: all 200ms ease-in;
                -webkit-transform: scale(1);
                -ms-transition: all 200ms ease-in;
                -ms-transform: scale(1);
                -moz-transition: all 200ms ease-in;
                -moz-transform: scale(1);
                transition: all 200ms ease-in;
                transform: scale(1);
            }

            .style_prev_kit:hover {
                box-shadow: 0 0 40px #000000;
                z-index: 999;
                -webkit-transition: all 200ms ease-in;
                -webkit-transform: scale(2);
                -ms-transition: all 200ms ease-in;
                -ms-transform: scale(2);
                -moz-transition: all 200ms ease-in;
                -moz-transform: scale(2);
                transition: all 200ms ease-in;
                transform: scale(2);
                cursor: pointer;
            }

            img {
                border-radius: 4px;
                border: 3px solid var(--primary-color);
            }

            img:hover {
                cursor: pointer;
            }
        `,
    ],
})
export class GoodWarehousesFormComponent implements OnInit {
    @ViewChild('addEditAccount', { static: false })
    addEditAccount: AddEditAccountComponent;
    @ViewChild('addEditAccountDetail', { static: false })
    addEditAccountDetail: AddEditAccountDetailsComponent;
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('formData') formData: any = {};
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input() isPriceList: boolean = false;

    @Input('types') types: any = {};
    @Output() onCancel = new EventEmitter();

    goodPositions: any = [];

    serverUrl = environment.serverURL;

    goodsForm: FormGroup = new FormGroup({});
    fileListStr: string[] = [];
    selectedImages: string[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    uploading: boolean = false;

    currentAccountType: AccountType = AccountType.HT;
    isQuantityExceeded: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly goodWarehouseService: GoodWarehouseService,
    ) {
        this.goodsForm = this.fb.group({
            id: [0],
            menuType: [''],
            priceList: [''],
            goodsType: [''],
            quantity: [0],
            // "position": [''],
            note: [''],
            status: [0],
            account: [''],
            accountName: [''],
            warehouse: '',
            warehouseName: [''],
            detail1: [''],
            detailName1: [''],
            detail2: '1',
            detailName2: [''],
            image1: [''],
            // "image5": [''],
            dateManufacture: [''],
            dateExpiration: [''],
            type: [''],
            order: [0],
            orginalVoucherNumber: [''],
            // "quantityInput": [0],
            positions: [''],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.goodsForm.reset();
        this.fileListStr = [];
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.goodsForm.controls[fieldName]?.dirty ||
            this.goodsForm.controls[fieldName]?.touched) &&
            this.goodsForm.controls[fieldName]?.invalid) ||
            (this.isInvalidForm && this.goodsForm.controls[fieldName]?.invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.goodsForm.controls[fieldNames[i]]?.dirty ||
                    this.goodsForm.controls[fieldNames[i]]?.touched) &&
                    this.goodsForm.controls[fieldNames[i]]?.invalid) ||
                (this.isInvalidForm &&
                    this.goodsForm.controls[fieldNames[i]]?.invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getDetail(id) {
        this.onReset();
        this.goodWarehouseService.getDetail(id).subscribe((res: any) => {
            this.goodsForm.setValue({
                ...res,
                dateExpiration:
                    res.dateExpiration != null
                        ? new Date(res.dateExpiration)
                        : null,
                dateManufacture:
                    res.dateManufacture != null
                        ? new Date(res.dateManufacture)
                        : null,
                priceList: [],
                positions: res.positions,
            });
            this.goodPositions = res.positions;
            this.setFileListStr();
            this.onChangeCreditDebit(
                { value: `${this.goodsForm.value.account}` },
                'debit',
                true,
            );
            this.onChangeCreditDebit(
                {
                    value: `${this.goodsForm.value.account}:${this.goodsForm.value.detail1}`,
                },
                'debit1',
                true,
            );
        });
    }

    setFileListStr() {
        if (this.goodsForm.value.image1) {
            this.fileListStr.push(this.goodsForm.value.image1);
        }
        if (this.goodsForm.value.image2) {
            this.fileListStr.push(this.goodsForm.value.image2);
        }
        if (this.goodsForm.value.image3) {
            this.fileListStr.push(this.goodsForm.value.image3);
        }
        if (this.goodsForm.value.image4) {
            this.fileListStr.push(this.goodsForm.value.image4);
        }
        if (this.goodsForm.value.image5) {
            this.fileListStr.push(this.goodsForm.value.image5);
        }
    }

    onSubmit() {
        // Validation sum quantity in detail > input quantity
        const quantitySum = (this.goodPositions || []).reduce(
            (accumulator, item) => {
                return accumulator + item.quantity;
            },
            0,
        );

        this.isQuantityExceeded =
            quantitySum > (this.goodsForm.value.quantity || 0);
        if (this.isQuantityExceeded) {
            return;
        }

        if (
            (this.debits1.length > 0 && !this.goodsForm.value.detail1) ||
            (this.debits2.length > 0 && !this.goodsForm.value.detail2)
        ) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again_account',
                ),
            });
            return;
        }

        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.goodsForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            this.isInvalidForm = true;
            this.isSubmitted = false;
            return;
        }

        this.goodsForm.controls['positions'].setValue(this.goodPositions);

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.goodsForm.value),
        );
        newData.floorId = newData?.floorId || 0;

        newData.dateManufacture = AppUtil.adjustDateOffset(
            newData.dateManufacture,
        );
        newData.dateExpiration = AppUtil.adjustDateOffset(
            newData.dateExpiration,
        );

        if (this.isEdit) {
            this.goodWarehouseService
                .update(newData, this.goodsForm.value.id)
                .subscribe((res: any) => {
                    this.onCancel.emit({});
                    this.messageService.add({
                        severity: 'success',
                        detail: this.appUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                });
        } else {
            this.goodWarehouseService.create(newData).subscribe((res: any) => {
                if (res.status !== 606) {
                    this.onCancel.emit({});
                    this.messageService.add({
                        severity: 'success',
                        detail: this.appUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                }
            });
        }
    }

    doAttachFile(event: any): void {
        if (
            this.fileListStr.length >= 5 ||
            event.target?.files.length > 5 ||
            event.target?.files.length + this.fileListStr.length > 5
        ) {
            this.messageService.add({
                severity: 'error',
                detail: this.appUtil.translate(
                    this.translateService,
                    'The number of uploads has exceeded the allowed amount',
                ),
            });
            return;
        }
        for (let i = 0; i < event.target?.files.length; i++) {
            console.log(event.target?.files[i]);
            this.uploading = true;
            const formData = new FormData();
            formData.append('file', event.target?.files[i]);
            this.goodWarehouseService
                .uploadFiles(formData)
                .subscribe((response: any) => {
                    if (
                        response.body &&
                        response.body.imageUrl &&
                        this.fileListStr.length < 5
                    ) {
                        this.fileListStr.push(response.body.imageUrl);
                    }
                    this.uploading = false;
                    console.log('index file', i);
                });
        }
    }

    onImageClick(id: any) {
        // remove or add class name style_prev_kit (css hover)
        let image = document.getElementById(id);
        let isUsingClass = image.classList.contains('style_prev_kit');
        if (isUsingClass) {
            image.classList.remove('style_prev_kit');
            image.classList.add('opacity-custom');
            this.selectedImages = [...this.selectedImages, id];
        } else {
            image.classList.add('style_prev_kit');
            image.classList.remove('opacity-custom');
            this.selectedImages = this.selectedImages.filter((x) => x !== id);
        }
    }

    onRemoveImages() {
        if (this.selectedImages.length > 0) {
            this.fileListStr = this.fileListStr.filter(
                (item) => !this.selectedImages.includes(item),
            );
            this.goodWarehouseService
                .deleteFiles(this.selectedImages)
                .subscribe((url: string) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: this.appUtil.translate(
                            this.translateService,
                            'success.delete',
                        ),
                    });
                });
            this.selectedImages = [];
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }

        newData.image1 =
            this.fileListStr.length > 0 && this.fileListStr[0]
                ? this.fileListStr[0]
                : '';
        newData.image2 =
            this.fileListStr.length > 0 && this.fileListStr[1]
                ? this.fileListStr[1]
                : '';
        newData.image3 =
            this.fileListStr.length > 0 && this.fileListStr[2]
                ? this.fileListStr[2]
                : '';
        newData.image4 =
            this.fileListStr.length > 0 && this.fileListStr[3]
                ? this.fileListStr[3]
                : '';
        newData.image5 =
            this.fileListStr.length > 0 && this.fileListStr[4]
                ? this.fileListStr[4]
                : '';
        console.log(this.debits1, this.debits1.length > 0 && newData.detail1);
        newData.detailName1 =
            this.debits1.length > 0 && newData.detail1
                ? this.debits1.find((x) => x.code === newData.detail1).name
                : '';
        newData.detailName2 =
            this.debits2.length > 0 && newData.detail2
                ? this.debits2.find((x) => x.code === newData.detail2).name
                : '';
        let warehouse = this.types.warehouse.find(
            (x) => x.code === newData.warehouse,
        );
        newData.warehouseName = warehouse ? warehouse.name : '';

        console.log(this.fileListStr);
        return newData;
    }

    // ------------------- Chart of account events ------------------
    filteredDebitNames: any[] = [];
    debits1: any[] = [];
    filteredDebit1Names: any[] = [];
    debits2: any[] = [];
    filteredDebit2Names: any[] = [];

    selectedDebit: any = {};
    selectedDebit1: any = {};
    selectedDebit2: any = {};

    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;

    getChartOfAccountDetails(accountCode, type, isInit = false) {
        if (type === 'debit2') {
            this.selectedDebit2 = this.getCreditDebitObject(
                accountCode,
                'debit2',
            );
            console.log('debit 2', this.selectedDebit2);
            if (this.selectedDebit2 && this.selectedDebit2.warehouseCode) {
                this.goodsForm.controls['warehouse'].setValue(
                    this.selectedDebit2.warehouseCode,
                );
            }
        }
        console.log(accountCode);
        this.chartOfAccountService
            .getDetail(accountCode)
            .subscribe((res: any) => {
                console.log(res.data);
                switch (type) {
                    case 'debit':
                        this.debits1 = res.data;
                        this.selectedDebit = this.getCreditDebitObject(
                            accountCode,
                            'debit',
                        );
                        if (
                            this.selectedDebit &&
                            this.selectedDebit.warehouseCode
                        ) {
                            this.goodsForm.controls['warehouse'].setValue(
                                this.selectedDebit.warehouseCode,
                            );
                        }
                        console.log('debit ', this.selectedDebit);
                        if (!isInit) this.onFocus(this.vcDebit1);
                        break;
                    case 'debit1':
                        this.debits2 = res.data;
                        this.selectedDebit1 = this.getCreditDebitObject(
                            accountCode,
                            'debit1',
                        );
                        if (
                            this.selectedDebit1 &&
                            this.selectedDebit1.warehouseCode
                        ) {
                            this.goodsForm.controls['warehouse'].setValue(
                                this.selectedDebit1.warehouseCode,
                            );
                        }
                        console.log('debit 1', this.selectedDebit1);
                        if (!isInit) this.onFocus(this.vcDebit2);
                        break;
                }
            });
    }

    onFocus(dataBinding) {
        setTimeout(() => {
            dataBinding.focusInput();
        }, 200);
    }

    getCreditDebitObject(code, type) {
        switch (type) {
            case 'debit':
                return this.types.chartOfAccount.find((x) => x.code === code);
            case 'debit1':
                return this.debits1.find((x) => x.code === code);
            case 'debit2':
                return this.debits2.find((x) => x.code === code);
        }
    }

    onDebitSelect(event) {
        if (event.includes('|')) {
            this.goodsForm.controls['account'].setValue(
                event.split('|')[0].trim(),
            );
            this.onChangeCreditDebit(
                { value: event.split('|')[0].trim() },
                'debit',
            );
        }
    }

    filterDebitName(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.types.chartOfAccount.length; i++) {
            if (
                this.types.chartOfAccount[i].code
                    .toLowerCase()
                    .includes(query.toLowerCase())
            ) {
                filtered.push(
                    `${this.types.chartOfAccount[i].code} | ${this.types.chartOfAccount[i].name}`,
                );
            }
        }
        this.filteredDebitNames = filtered;
    }

    onDebit1Select(event) {
        if (event.includes('|')) {
            this.goodsForm.controls['detail1'].setValue(
                event.split('|')[0].trim(),
            );
            this.onChangeCreditDebit(
                {
                    value: `${this.selectedDebit.code}:${event
                        .split('|')[0]
                        .trim()}`,
                },
                'debit1',
            );
        }
    }

    filterDebit1Name(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.debits1.length; i++) {
            if (
                this.debits1[i].code.toLowerCase().includes(query.toLowerCase())
            ) {
                filtered.push(
                    `${this.debits1[i].code} | ${this.debits1[i].name}`,
                );
            }
        }
        this.filteredDebit1Names = filtered;
    }

    onDebit2Select(event) {
        if (event.includes('|')) {
            this.goodsForm.controls['detail2'].setValue(
                event.split('|')[0].trim(),
            );
            this.onChangeCreditDebit(
                { value: event.split('|')[0].trim() },
                'debit2',
            );
        }
    }

    filterDebit2Name(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.debits2.length; i++) {
            if (
                this.debits2[i].code.toLowerCase().includes(query.toLowerCase())
            ) {
                filtered.push(
                    `${this.debits2[i].code} | ${this.debits2[i].name}`,
                );
            }
        }
        this.filteredDebit2Names = filtered;
    }

    onChangeCreditDebit(event, type, isInit?) {
        // case exist value
        if (event && event.value) {
            this.getChartOfAccountDetails(event.value, type, isInit);
        }
        // set default (reset form data)
        else {
            switch (type) {
                case 'debit':
                    this.setEmptyData('warehouse');
                    this.setEmptyData('account');
                    this.setEmptyData('detail1');
                    this.setEmptyData('detail2');
                    this.selectedDebit = {};
                    this.selectedDebit1 = {};
                    this.selectedDebit2 = {};
                    this.debits1 = [];
                    this.debits2 = [];
                    break;
                case 'debit1':
                    this.setEmptyData('detail1');
                    this.setEmptyData('detail2');
                    this.selectedDebit1 = {};
                    this.selectedDebit2 = {};
                    this.debits2 = [];
                    break;
                case 'debit2':
                    this.setEmptyData('detail2');
                    this.selectedDebit2 = {};
                    break;
            }
        }
    }

    setEmptyData(columnName) {
        this.goodsForm.controls[columnName].setValue('');
    }

    onAddEditAccountDetail(isDebit1?: boolean) {
        this.addEditAccountDetail.tabIndex = -1;
        this.addEditAccountDetail.show(
            AddAccountDetailType.CT1,
            isDebit1 ? this.selectedDebit : this.selectedDebit1,
        );
    }

    onAddEditAccountSuccess() {}

    onAddEditFirstChildAccountSuccess() {}
}
