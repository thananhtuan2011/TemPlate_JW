import {Component, Input} from '@angular/core';
import {BillService} from "../../../../../service/bill.service";
import {CustomerContactHistoryService} from "../../../../../service/customer-contact-history.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-customer-notification',
    templateUrl: './customer-notification.component.html',
    styleUrls: ['./customer-notification.component.scss']
})
export class CustomerNotificationComponent {
    @Input() iconClass: string = 'pi pi-bell p-text-secondary';
    @Input() type: string = 'customer';
    messages: any[] = [];
    messageCount = 0;
    displayNotification: boolean = false;

    constructor(
        private billService: BillService,
        private router: Router,
        private readonly customerContactHistory: CustomerContactHistoryService
    ) {
    }

    ngOnInit(): void {
        this.getCountCustomerContact();
        this.getCustomerContactNotification();
    }

    getCustomerContactNotification(): void {
        this.customerContactHistory.getCustomerContactNotification().subscribe(res => {
            this.messages = res;
        })
    }

    getCountCustomerContact(): void {
        this.customerContactHistory.getCountCustomerContact().subscribe(res => {
            this.messageCount = res;
        })
    }

    onMove(): void {
        this.displayNotification = false;
        this.router.navigate(['/uikit/workflow']);
    }
}
