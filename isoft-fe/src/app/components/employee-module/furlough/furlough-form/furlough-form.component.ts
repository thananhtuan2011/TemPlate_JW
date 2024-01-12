import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FurloughService } from '../../../../service/furlough.service';
import { MessageService } from 'primeng/api';
import AppUtil from '../../../../utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import { FurloughModel } from '../../../../models/furlough.model';
import { AuthService } from '../../../../service/auth.service';

@Component({
    selector: 'app-furlough-form',
    templateUrl: './furlough-form.component.html',
    styleUrls: [],
})
export class FurloughFormComponent implements OnInit {
    @Input() display = false;
    @Input() formData;
    furloughForm!: FormGroup;
    @Output() onCancel = new EventEmitter();

    constructor(
        private readonly furloughService: FurloughService,
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly authService: AuthService,
    ) {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (this.formData?.id)
            this.furloughForm = new FormGroup({
                procedureNumber: new FormControl(this.formData.procedureNumber),
                fromDate: new FormControl(this.formData.fromdt),
                toDate: new FormControl(this.formData.todt),
                isLicensed: new FormControl(this.formData.isLicensed),
                reason: new FormControl(this.formData.reason),
                name: new FormControl(this.formData.name),
            });
        else
            this.furloughForm = new FormGroup({
                procedureNumber: new FormControl(null),
                fromDate: new FormControl(new Date()),
                toDate: new FormControl(null),
                isLicensed: new FormControl(true),
                reason: new FormControl(null),
                name: new FormControl(null),
            });
    }

    onDelete(): void {
        this.furloughService.deleteFurlough(this.formData?.id).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.delete',
                    ),
                });
                this.onCancel.emit({});
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onSave(): void {
        const request = {
            id: this.formData?.id || 0,
            procedureNumber: this.furloughForm.value.procedureNumber,
            name: this.furloughForm.value.name,
            fromdt: this.furloughForm.value.fromDate,
            todt: this.furloughForm.value.toDate,
            isLicensed: this.furloughForm.value.isLicensed,
            p_ProcedureStatusId: this.formData?.pProcedureStatusId || 0,
            p_ProcedureStatusName: this.formData?.pProcedureStatusName || '',
            userCreated: this.formData?.id
                ? this.formData?.userCreated
                : this.authService.user?.id,
            userUpdated:
                this.authService.user?.id || this.formData?.userUpdated,
            reason: this.furloughForm.value.reason,
        };
        if (this.formData?.id)
            this.furloughService
                .updateFurlough(request, this.formData.id)
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
        else
            this.furloughService.createFurlough(request).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.onCancel.emit({});
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
    }

    onForward(): void {}
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSave();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
            case 'F11':
                event.preventDefault();
                this.onDelete();
                break;
            case 'F10':
                event.preventDefault();
                this.onForward();
                break;
        }
    }
}
