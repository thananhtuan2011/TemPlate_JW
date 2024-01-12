import { Component, Input, OnInit } from '@angular/core';
import { Salary } from 'src/app/models/salary.model';

@Component({
  selector: 'app-m-salary',
  templateUrl: './m-salary.component.html',
  styleUrls: ['./m-salary.component.scss'],
  styles: [
    `:host ::ng-deep .p-accordion-content {
      padding:0;
  }
  
  :host ::ng-deep .m-salary {
      
  }
  
  :host ::ng-deep .m-salary-info {
      margin-top:8px;
      justify-content: space-between;
  }
  :host ::ng-deep .m-salary-group {
      padding:12px 0;
      background: #efefef;
      
  }
  :host ::ng-deep .m-salary-employee {
      padding:8px 0 8px 12px;      
  }
  :host ::ng-deep .p-accordion-tab-active .p-toggleable-content:not(.ng-animating) {
    overflow: hidden;
  }
  :host ::ng-deep .m-salary-group-header {
      display:flex;
      justify-content:center;
      font-weight:bold;
  }`
  ]
})
export class MSalaryComponent implements OnInit {
  @Input("lstSalary") lstSalary: Salary[] = [];
  @Input("colAllowances") colAllowances: any[] = [];
  @Input("getParams") getParams: any;
  @Input("styleClass") styleClass: string = "";
  constructor() { }

  ngOnInit(): void {
  }

}
