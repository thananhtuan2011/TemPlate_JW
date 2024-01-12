import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/service/auth.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'PT',
    templateUrl: './PT.component.html',
})
export class PTComponent implements OnInit {
    public appUtil = AppUtil;
    public currentUser: User | undefined;

    constructor(private authService: AuthService) {}

    @Input() company: Company;
    @Input() total: number;
    @Input() dataPrint: any;
    @Input() creditCodes = [];
    dateStr = '';
    order = '';
    orginalDescription = '';

    ngOnInit(): void {
        this.currentUser = this.authService.user;
        let newDate = new Date(this.dataPrint.orginalBookDate);
        const day =
            newDate.getDate() < 10
                ? '0' + newDate.getDate()
                : '' + newDate.getDate();
        const month =
            newDate.getMonth() + 1 < 10
                ? '0' + (newDate.getMonth() + 1)
                : '' + (newDate.getMonth() + 1);
        this.dateStr = `Ngày ${day} tháng ${month} năm ${newDate.getFullYear()}`;
        this.order = this.dataPrint.orginalVoucherNumber.split('/')[0];
        this.creditCodes.forEach((ele: any) => {
            if (this.orginalDescription.indexOf(ele.orginalDescription) < 0)
                this.orginalDescription =
                    this.orginalDescription + '; ' + ele.orginalDescription;
        });
    }
}
