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
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { RoomTable } from 'src/app/models/room-table.model';
import { RoomTableService } from 'src/app/service/room-table.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-room-table-form',
    templateUrl: './room-table-form.component.html',
})
export class RoomTableFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    roomTableForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    dataDropdown: RoomTable[];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private router: Router,
        private readonly roomTableServices: RoomTableService,
    ) {
        this.roomTableForm = this.fb.group({
            id: 0,
            name: ['', [Validators.required]],
            code: ['', [Validators.required]],
            floorId: [0],
            position: [''],
            numberSeat: [''],
            description: [''],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.roomTableForm.setValue({
                name: this.formData.name,
                code: this.formData.code,
                floorId: this.formData.floorId,
                position: this.formData.numberOrdinal,
                numberSeat: this.formData.numberSeat,
                description: this.formData.description,
            });
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.roomTableForm.reset();
    }

    ngOnInit() {
    }

    getFloor(){
        this.roomTableServices.getListNoQuery().subscribe((res) => {
            this.dataDropdown =
                res.data.filter((item) => item.floorId === 0) || [];
        });
    }

    checkValidValidator(fieldName: string) {
        return ((this.roomTableForm.controls[fieldName]?.dirty ||
            this.roomTableForm.controls[fieldName]?.touched) &&
            this.roomTableForm.controls[fieldName]?.invalid) ||
            (this.isInvalidForm &&
                this.roomTableForm.controls[fieldName]?.invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.roomTableForm.controls[fieldNames[i]]?.dirty ||
                    this.roomTableForm.controls[fieldNames[i]]?.touched) &&
                    this.roomTableForm.controls[fieldNames[i]]?.invalid) ||
                (this.isInvalidForm &&
                    this.roomTableForm.controls[fieldNames[i]]?.invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getDetail(id) {
        this.roomTableServices.getDetail(id).subscribe(
            (res: any) => {
                this.roomTableForm.setValue({
                    id: res.id,
                    name: res?.name,
                    code: res?.code,
                    floorId: res?.floorId,
                    position: res?.position,
                    numberSeat: res?.numberSeat,
                    description: res?.description,
                });
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.roomTableForm.invalid) {
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
            AppUtil.cleanObject(this.roomTableForm.value),
        );
        newData.floorId = newData?.floorId || 0;
        if (this.isEdit) {
            this.roomTableServices
                .update(newData, this.roomTableForm.value.id)
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
            this.roomTableServices.create(newData).subscribe(
                (res: any) => {
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
                },
                (err) => {
                    // console.log('err', err);
                },
            );
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
