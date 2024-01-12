import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import AppUtil from '../../../utilities/app-util';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { PrintSettingService } from '../../../service/print-setting.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-printer-parameters',
    templateUrl: './printer-parameters.component.html',
})
export class PrinterParametersComponent implements OnInit {
    printerForm: FormGroup;
    record = {};

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private translateService: TranslateService,
        private printSettingService: PrintSettingService,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.record = this.activatedRoute.snapshot.data.data;
        this.printerForm = this.fb.group({
            height: [null, Validators.required],
            width: [null, Validators.required],
            qrCode: this.fb.group({
                height: [null, Validators.required],
                width: [null, Validators.required],
                size: [null, Validators.required],
                marginLeft: [null, Validators.required],
                marginRight: [null, Validators.required],
                marginTop: [null, Validators.required],
                marginBottom: [null, Validators.required],
            }),
            barcode: this.fb.group({
                height: [null, Validators.required],
                width: [null, Validators.required],
                size: [null, Validators.required],
                marginLeft: [null, Validators.required],
                marginRight: [null, Validators.required],
                marginTop: [null, Validators.required],
                marginBottom: [null, Validators.required],
            }),
        });
        if (this.record) {
            this.printerForm.patchValue(this.record);
        }
    }

    inValid(name: string): boolean {
        return (
            this.field(name).invalid &&
            (this.field(name).dirty || this.field(name).touched)
        );
    }

    field(name: string) {
        return this.printerForm.get(name);
    }

    submitForm() {
        this.printSettingService
            .update({
                ...this.record,
                ...this.printerForm.value,
            })
            .pipe(
                catchError((err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.1',
                        ),
                    });
                    return throwError(err);
                }),
            )
            .subscribe(() => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            });
    }
}
