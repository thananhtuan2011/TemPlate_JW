import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { SalaryAdvanceRequestComponent } from './salary-advance-request/salary-advance-request.component';
import { SalaryAdvanceRequestFormComponent } from './salary-advance-request/components/salary-advance-request-form/salary-advance-request-form.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { DirectivesModule } from '../../shared/directives/directives.module';

@NgModule({
    declarations: [
        SalaryAdvanceRequestComponent,
        SalaryAdvanceRequestFormComponent,
       
    ],
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TranslateModule,
        CalendarModule,
        InputNumberModule,
        ReactiveFormsModule,
        DropdownModule,
        DirectivesModule,
    ],
})
export class EmployeeModule {}
