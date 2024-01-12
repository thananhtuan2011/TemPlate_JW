import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { WorkflowStatus } from 'src/app/models/workflow-status.model';
import AppUtil from 'src/app/utilities/app-util';
import { Action, StateAction } from '../workflow-status.component';
import { WorkflowStatusService } from 'src/app/service/workflow-status.service';

@Component({
  selector: 'app-workflow-status-form',
  templateUrl: './workflow-status-form.component.html',
  styleUrls: ['./workflow-status-form.component.scss'],
  styles: [
    `
        :host ::ng-deep {
            .p-inputtext {
                height: 40px;
            }

            .p-colorpicker-preview {
                opacity: 1;
                height: 40px;
                width: 40px;
                border: 1px solid #ced4da;
                border-radius: 0 5px 5px 0;
            }

            .boder-radius {
                border-radius: 5px 0 0 5px;
            }
        }
    `,
  ],
})
export class WorkflowStatusFormComponent implements OnInit {
  public appConstant = AppComponent;
  public appUtil = AppUtil;
  @Input('action') action: Action;
  @Input('display') display: boolean = false;
  @Input('item') item?: WorkflowStatus
  @Output() onSubmit = new EventEmitter<StateAction>();
  workflowStatusForm: FormGroup = new FormGroup({});
  constructor(
    private fb: FormBuilder,
    private workflowStatusService: WorkflowStatusService,
  ) {
    this.workflowStatusForm = this.fb.group({
      name: ['', [Validators.required]],
      color: ['', [Validators.required]],
    })
  }
  ngOnInit(): void {
    if (this.item) {
      this.workflowStatusForm.setValue({
        name: this.item.name,
        color: this.item.color
      })
    }
  }
  onCancel(): void {
    this.onSubmit.emit(StateAction.Cancel)
  }
  onSave(): void {
    switch (this.action) {
      case Action.Create:
        try {
          let status: WorkflowStatus = {
            name: this.workflowStatusForm.value.name,
            color: this.workflowStatusForm.value.color,
            type: 1,
          }
          this.workflowStatusService.createStatus(status).subscribe(() => {
            this.onSubmit.emit(StateAction.Completed)
          })
        } catch (error) {
          console.log(error)
        }
        break;
      case Action.Edit:
        try {
          let status: WorkflowStatus = { ...this.item }
          status.name = this.workflowStatusForm.value.name;
          status.color = this.workflowStatusForm.value.color;
          this.workflowStatusService.updateStatus(status).subscribe(() => {
            this.onSubmit.emit(StateAction.Completed)
          })
        } catch (error) {
          console.log(error)
        }
        break;
      default:
        this.onSubmit.emit(StateAction.Cancel)
        break;
    }
  }
}
