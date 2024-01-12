import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { BranchService } from 'src/app/service/branch.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../../../../../service/warehouse.service';
import { WarehouseShelvesService } from '../../../../../service/warehouse-shelves.service';
import { TypeData } from '../../../../../models/common.model';
import { Branch } from '../../../../../models/branch.model';
import { WarehouseFloorsService } from '../../../../../service/warehouse-floors.service';

@Component({
    selector: 'app-good-warehouse-shelves-form',
    templateUrl: './good-warehouse-shelves-form.component.html',
    styles: [``],
})
export class GoodWarehouseShelvesFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    shelvesForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    floors: any = [];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private warehouseShelvesService: WarehouseShelvesService,
        private router: Router,
        private route: ActivatedRoute,
        private warehouseFloorsService: WarehouseFloorsService,
    ) {
        this.shelvesForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            note: [''],
            orderHorizontal: ['', [Validators.required]],
            orderVertical: ['', [Validators.required]],
            floorIds: ['', [Validators.required]],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_branch',
            );
            this.shelvesForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                note: this.formData.note,
                orderHorizontal: this.formData.orderHorizontal,
                orderVertical: this.formData.orderVertical,
                floorIds: this.formData.floorIds,
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_branch',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.shelvesForm.reset();
    }

    ngOnInit() {
        this.getFloors();
    }

    getFloors(): void {
        this.warehouseFloorsService
            .getWareHouseFloors()
            .subscribe((response: TypeData<any>) => {
                this.floors = response.data;
            });
    }

    checkValidValidator(fieldName: string) {
        return ((this.shelvesForm.controls[fieldName].dirty ||
            this.shelvesForm.controls[fieldName].touched) &&
            this.shelvesForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.shelvesForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.shelvesForm.controls[fieldNames[i]].dirty ||
                    this.shelvesForm.controls[fieldNames[i]].touched) &&
                    this.shelvesForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.shelvesForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.shelvesForm.invalid) {
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
            AppUtil.cleanObject(this.shelvesForm.value),
        );
        // this.onCancel.emit({});
        if (this.isEdit) {
            this.warehouseShelvesService
                .updateWareHouseShelves(newData, this.shelvesForm.value.id)
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
            this.warehouseShelvesService
                .createShelves(newData)
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
                            detail: 'Thêm mới thành công',
                        });
                    }
                });
        }
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
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
}
