import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-general-statistics-info',
    templateUrl: './general-statistics-info.component.html',
})
export class GeneralStatisticsInfoComponent implements OnInit, OnChanges {
    @Input('statis') statis: any = {};
    isMobile = screen.width <= 1199;
    lst;
    constructor(private router: Router) {}
    ngOnChanges(changes: SimpleChanges): void {
        this.lst = this.statis.listChildren;
    }

    ngOnInit(): void {}
    navigateEmployee(id) {
        this.router.navigate(['uikit/employee'], { queryParams: { age: id } });
    }
}
