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
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseFloorsService } from '../../../../../service/warehouse-floors.service';
import { TypeData } from '../../../../../models/common.model';
import { WarehousePositionsService } from '../../../../../service/warehouse-positions.service';

@Component({
    selector: 'app-good-warehouse-floors-form',
    templateUrl: './good-warehouse-floors-form.component.html',
    styles: [``],
})
export class GoodWarehouseFloorsFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    floorsForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    positions: any[];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private warehouseFloorsService: WarehouseFloorsService,
        private router: Router,
        private route: ActivatedRoute,
        private warehousePositionsService: WarehousePositionsService,
    ) {
        this.floorsForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            positionIds: ['', [Validators.required]],
            note: [''],
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
            this.floorsForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                note: this.formData.note,
                positionIds: this.formData.positionIds,
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
        this.floorsForm.reset();
    }

    ngOnInit() {
        this.getPosition();
    }

    getPosition(): void {
        this.warehousePositionsService
            .getWareHousePositions()
            .subscribe((response: TypeData<any>) => {
                this.positions = response.data;
            });
    }

    checkValidValidator(fieldName: string) {
        return ((this.floorsForm.controls[fieldName].dirty ||
            this.floorsForm.controls[fieldName].touched) &&
            this.floorsForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.floorsForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.floorsForm.controls[fieldNames[i]].dirty ||
                    this.floorsForm.controls[fieldNames[i]].touched) &&
                    this.floorsForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.floorsForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.floorsForm.invalid) {
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
            AppUtil.cleanObject(this.floorsForm.value),
        );
        // this.onCancel.emit({});
        if (this.isEdit) {
            this.warehouseFloorsService
                .updateWareHouseFloors(newData, this.floorsForm.value.id)
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
            this.warehouseFloorsService
                .createFloors(newData)
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
