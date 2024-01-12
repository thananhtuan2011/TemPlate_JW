import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractDepartmentComponent } from './contract-department.component';
import { CrudContractDepartmentComponent } from './crud-contract-department/crud-contract-department.component';
import { TableModule } from 'primeng/table';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ContractDeparmentService } from 'src/app/service/contract-department';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ContractDepartmentTypePipe } from './contract-department.pipe';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigService } from 'src/app/service/system-setting/app.config.service';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@NgModule({
    declarations: [
        ContractDepartmentComponent,
        CrudContractDepartmentComponent,
        ContractDepartmentTypePipe,
    ],
    imports: [
        TranslateModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        MessageModule,
        DynamicDialogModule,
        DropdownModule,
        InputMaskModule,
        InputNumberModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        DialogModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TableModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        ButtonModule,
        VirtualScrollerModule,
    ],
    providers: [
        ConfigService,
        MessageService,
        ConfirmationService,
        ContractDeparmentService,
        DialogService,
        ContractDepartmentTypePipe,
    ],
})
export class ContractDepartmentModule {}
