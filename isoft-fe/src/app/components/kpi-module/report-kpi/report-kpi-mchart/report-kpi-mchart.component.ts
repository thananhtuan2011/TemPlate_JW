import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-kpi-mchart',
  templateUrl: './report-kpi-mchart.component.html',
  styleUrls: ['./report-kpi-mchart.component.scss']
})
export class ReportKpiMchartComponent implements OnInit {
  @Input('data') data: any = {};
  itemChoiced: any = null;
  constructor() { }
  ngOnInit(): void {
   
  }
  labelOption =() =>{
    
  }
}
