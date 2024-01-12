import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    Injector,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponentBase } from 'src/app/app-component-base';
import { AccountGroupSyncModel } from 'src/app/models/account-group-sync.model';
import { AccountGroupSyncService } from 'src/app/service/account-group-sync.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'add-account-group-sync',
    templateUrl: './add-account-group-sync.component.html',
    styles: [
        `
            :host ::ng-deep {
                .add-account-group-sync {
                    width: 50vw;
                }
            }
        `,
    ],
})
export class AddAccountGroupSyncComponent
    extends AppComponentBase
    implements OnInit
{
    @Output() addSuccessfull = new EventEmitter();

    display = false;
    formGroup: FormGroup;

    constructor(
        private _injector: Injector,
        private _formBuilder: FormBuilder,
        private _accountGroupSyncService: AccountGroupSyncService,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this.initFormGroup();
    }

    show() {
        this.formGroup.reset();
        this.display = true;
    }

    initFormGroup() {
        this.formGroup = this._formBuilder.group({
            code: this._formBuilder.control('', [Validators.required]),
            name: this._formBuilder.control('', [Validators.required]),
        });
    }

    onCancel() {
        this.display = false;
    }

    onAdd() {
        if (this.formGroup.valid) {
            const input = new AccountGroupSyncModel(
                this.formGroup.getRawValue(),
            );
            this._accountGroupSyncService.create(input).subscribe((_) => {
                this.display = false;
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
                this.addSuccessfull.emit();
            });
        } else {
            this.formGroup.markAllAsTouched();
        }
    }
}
