import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Customer } from 'src/app/models/customer.model';
import { RoomTable } from 'src/app/models/room-table.model';
import { CategoryService } from 'src/app/service/category.service';
import { CustomerService } from 'src/app/service/customer.service';
import { RoomTableService } from 'src/app/service/room-table.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-menu-of-goods-form',
    templateUrl: './menu-of-goods-form.component.html',
})
export class MenuOfGoodsFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('types') types: any = {};
    @Output() onCancel = new EventEmitter();
    title: string = '';

    categoryForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private router: Router,
        private categoryService: CategoryService,
        private customerService: CustomerService,
    ) {
        this.categoryForm = this.fb.group({
            id: 0,
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            nameEnglish: [''],
            nameKorea: [''],
            type: ['', [Validators.required]],
            note: [''],
            customers: [[]],
            isShowWeb: [false],
        });
    }

    customers: Customer[] = [];
    getCustomers(keyword: string = '', customerId: [] = []) {
        this.customerService
            .getAllCustomer(keyword, 0, customerId)
            .subscribe((res: any) => {
                this.customers = res.data;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {}

    onChangeDefaultPriceList() {
        this.categoryForm.controls['type'].setValue(
            AppConstant.CATEGORY_TYPE.PRICE_LIST,
        );
    }

    onReset() {
        this.isInvalidForm = false;
        this.categoryForm.reset();
    }

    ngOnInit() {
        this.getCustomers();
    }

    checkValidValidator(fieldName: string) {
        return ((this.categoryForm.controls[fieldName]?.dirty ||
            this.categoryForm.controls[fieldName]?.touched) &&
            this.categoryForm.controls[fieldName]?.invalid) ||
            (this.isInvalidForm &&
                this.categoryForm.controls[fieldName]?.invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.categoryForm.controls[fieldNames[i]]?.dirty ||
                    this.categoryForm.controls[fieldNames[i]]?.touched) &&
                    this.categoryForm.controls[fieldNames[i]]?.invalid) ||
                (this.isInvalidForm &&
                    this.categoryForm.controls[fieldNames[i]]?.invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getDetail(id) {
        this.categoryService.getDetail(id).subscribe((res: any) => {
            this.categoryForm.setValue({
                id: res.id,
                code: res.code,
                name: res.name,
                nameEnglish: res.nameEnglish,
                nameKorea: res.nameKorea,
                type: res.type,
                note: res.note || '',
                customers: res.customers || [],
                isShowWeb: res.isShowWeb || false,
            });
            this.onChangeCategory({ value: res.type });
            this.getCustomers('', res.customers);
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.categoryForm.invalid) {
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

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.categoryForm.value),
        );
        if (this.isEdit) {
            this.categoryService
                .update(newData, this.categoryForm.value.id)
                .subscribe((res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Cập nhật thành công',
                        });
                    }
                });
        } else {
            this.categoryService.create(newData).subscribe((res: any) => {
                if (res?.code === 400) {
                    this.messageService.add({
                        severity: 'error',
                        detail: res?.msg || '',
                    });
                    return;
                } else {
                    this.onCancel.emit({});
                    this.messageService.add({
                        severity: 'success',
                        detail: 'Thêm mới thành công',
                    });
                }
            });
        }
    }

    onBack() {
        this.router.navigate([`/uikit/setup/room-table`]).then();
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.type = parseInt(newData.type) || 0;
        return newData;
    }

    isShowCustomer = false;
    onChangeCategory(event) {
        this.isShowCustomer = event.value === 4;
        if (event.value !== 4) {
            this.categoryForm.controls['customers'].setValue([]);
        }
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (!this.display) return;
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }

    onCustomerFilter($event: any) {
        this.getCustomers($event.filter);
    }
}
