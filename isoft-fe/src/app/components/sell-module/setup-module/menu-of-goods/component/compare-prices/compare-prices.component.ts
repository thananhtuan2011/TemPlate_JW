import {
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from 'src/app/app-component-base';
import { AccountType } from 'src/app/components/accounting-module/account-v2/account.model';
import { AccountGroupDetailModel } from 'src/app/models/account-group.model';
import { AccountGroupService } from 'src/app/service/account-group.service';
import { CategoryService } from 'src/app/service/category.service';
import { GoodsService } from 'src/app/service/goods.service';
import { IsConfirmationService } from 'src/app/shared/is-confirmation/is-comfirmation.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-compare-prices',
    templateUrl: './compare-prices.component.html',
    styles: [
        `
            :host ::ng-deep {
                p-inputNumber {
                    height: 40px;
                    width: 100%;
                }
            }
        `,
    ],
})
export class ComparePricesComponent
    extends AppComponentBase
    implements OnInit, OnChanges
{
    @Input() listSeleted: any;
    @Output() onSubmit = new EventEmitter();
    title = 'label.update_price_list';
    display = false;
    formGroup: FormGroup;
    accountTypes = AccountType;
    listUpAndDown = [
        { value: 1, name: 'Tăng' },
        { value: 0, name: 'Gỉam' },
        { value: 2, name: 'Không' },
    ];
    listPercentOrPrice = [
        { value: 0, name: '% (Phần trăm) ' },
        { value: 1, name: 'Tiền mặt' },
    ];

    listOther = [];

    listPrice: any[] = [
        { code: 0, name: 'Giá bán' },
        { code: 1, name: 'Giá vốn' },
        { code: 2, name: 'Giảm giá' },
        { code: 4, name: 'Giá vốn nhập' },
    ];
    listPriceTo: any[] = [
        { code: 0, name: 'Giá bán' },
        { code: 1, name: 'Giá vốn' },
        { code: 2, name: 'Giảm giá' },
    ];
    appConstant = AppConstant;

    get isPercents(): boolean {
        return this.formGroup.get('typeMoney').value == 0;
    }
    get isPrice(): boolean {
        return this.formGroup.get('typeMoney').value == 1;
    }

    get valid(): boolean {
        if (this.formGroup && this.formGroup.valid) {
            return true;
        }
        return false;
    }

    constructor(
        private _fb: FormBuilder,
        private _accountGroupService: AccountGroupService,
        private _isConfirmationService: IsConfirmationService,
        private _injector: Injector,
        private goodsService: GoodsService,
        private categoryService: CategoryService,
        private _host: ElementRef,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this.initFormGroup();
        this.getCategories();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const selected = [];
        for (let item of this.listSeleted) {
            selected.push(item.id);
        }
        console.log(selected);
    }

    initFormGroup() {
        this.formGroup = this._fb.group({
            type: [0],
            typeMoney: [0],
            percent: [0],
            cash: [0],
            priceFrom: [''],
            priceTo: [''],
            priceList: [''],
        });
    }

    show(data?: AccountGroupDetailModel) {
        this.initFormGroup();
        this.display = true;
    }

    onCancel() {
        this.display = false;
    }

    submit() {
        const selected = [];
        for (let item of this.listSeleted) {
            selected.push(item.id);
        }
        if (this.formGroup.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            return;
        }
        const newData = this.formGroup.getRawValue();
        newData.listId = selected.length > 0 ? selected : [];
        this.goodsService.updatePriceList(newData).subscribe(
            (res) => {
                this.onCancel();
                this.messageService.add({
                    severity: 'success',
                    detail: 'Cập nhật thành công',
                });
                this.goodsService.setStateCallApi(true);
                this.onSubmit.emit();
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: err?.msg || '',
                });
                return;
            },
        );
    }

    getCategories() {
        this.categoryService.getAll().subscribe((res) => {
            this.listOther = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.PRICE_LIST,
            );
        });
    }
}
