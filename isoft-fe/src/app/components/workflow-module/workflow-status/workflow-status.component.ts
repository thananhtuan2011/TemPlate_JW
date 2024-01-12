import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Page, TypeData } from 'src/app/models/common.model';
import { WorkflowStatus } from 'src/app/models/workflow-status.model';
import { WorkflowStatusService } from 'src/app/service/workflow-status.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

export enum Action {
  Create = "Create",
  Edit = "Edit",
  Delete = "Delete",
}

export enum StateAction {
  Cancel = 'Cancel',
  Completed = 'Completed',
  Warring = 'Warring'
}

export interface PageWorkflowStatus extends Page {
  keyword?: string;
  type?: number;
}


@Component({
  selector: 'app-workflow-status',
  templateUrl: './workflow-status.component.html',
  styleUrls: ['./workflow-status.component.scss']
})

export class WorkflowStatusComponent implements OnInit {
  public appConstant = AppConstant;
  public getParams: PageWorkflowStatus = {
    page: 0,
    pageSize: 10,
    sortField: 'id',
    isSort: true,
    keyword: '',
    type: 1,
  };
  public totalRecords = 0;
  public totalPages = 0;
  loading: boolean = true;
  display: boolean = false;
  sortFields: any[] = [];
  sortTypes: any[] = [];
  pendingRequest: any;
  public listWorkflowStatus: WorkflowStatus[] = [];
  item?: WorkflowStatus;
  action = null;
  first = 0;
  isMobile = screen.width <= 1199;
  constructor(
    private workflowStatus: WorkflowStatusService,
    private readonly translateService: TranslateService,
    private messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    AppUtil.getCustomerStatusSortTypes(this.translateService).subscribe(
      (res) => {
        this.sortFields = res;
      },
    );
    AppUtil.getSortTypes(this.translateService).subscribe((res) => {
      this.sortTypes = res;
    });
  }
  getWorkflowStatus(): void {
    this.workflowStatus.getAllStatus(this.getParams)
      .subscribe((response: TypeData<WorkflowStatus>) => {
        AppUtil.scrollToTop();
        this.listWorkflowStatus = response.data;
        this.totalRecords = response.totalItems || 0;
        this.totalPages = response.totalItems / response.pageSize + 1;
        this.loading = false;
      });
  }
  setAction(action: Action, item?: WorkflowStatus): void {

    try {
      switch (action) {
        case Action.Delete:
          let message;
          this.translateService
            .get('question.delete_workflow_status')
            .subscribe((res) => {
              message = res;
            });
          this.confirmationService.confirm({
            message: message,
            accept: () => {
              this.workflowStatus
                .deleteStatus(item.id)
                .subscribe((response: any) => {
                  if (response.status == 200) {
                    this.messageService.add({
                      severity: 'success',
                      detail: 'Xóa thành công',
                    });
                    this.getWorkflowStatus()
                  } else {
                    this.messageService.add({
                      severity: 'error',
                      detail: response.message,
                    });
                  }
                });
            },
          });
          break;
        default:
          this.action = action;
          this.item = item;
          this.display = true;
      }
      // this.action = action;
      // this.item = item;
    } catch (error) {
      console.log(error)
    }
  }
  onChangeParam(field: string, value: any): void {
    this.getParams[field] = value;
    this.getWorkflowStatus()

  }
  onChangeSort(event, type) {
    if (type === 'sortType') {
      this.getParams.isSort = event.value;
    }
  }
  onSubmit(state: StateAction): void {
    switch (state) {
      case StateAction.Cancel:
        this.display = false;
        break;
      case StateAction.Completed:
        this.display = false;
        this.item = null;
        break;

      default:
        break;
    }
  }
}
