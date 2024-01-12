import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IResponse, Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import {
    Bill,
    ChangeStatusResult,
    NotificationCountResult,
    NotificationResult,
} from '../models/cashier.model';
import { NewestBillNumberModel } from '../models/newest-bill-number';

export interface PageFilterBill extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Bills`;
let notificationsUrl = `${AppConstant.DEFAULT_URLS.API}/BillTrackings`;

@Injectable({
    providedIn: 'root',
})
export class BillService {
    constructor(private readonly httpClient: HttpClient) {}

    public createBill(Bill: Bill): Observable<Bill | null> {
        const url: string = `${_prefix}/create`;
        return this.httpClient.post(url, Bill).pipe(
            map((Bill: Bill) => {
                return Bill;
            }),
        );
    }

    public updateBill(Bill: Bill, id: number): Observable<Bill> {
        console.log(Bill);
        const url: string = `${_prefix}/update`;
        return this.httpClient.put(url, Bill).pipe(
            map((Bill: Bill) => {
                return Bill;
            }),
        );
    }

    public updateBillSurcharge(bill: Bill, id: number) {
        const url: string = `${_prefix}/update-surcharge/${bill.id}?surcharge=${bill.surcharge}`;
        return this.httpClient.get(url).pipe(
            map((Bill: Bill) => {
                return Bill;
            }),
        );
    }

    getBillDetail(id: number): Observable<TypeData<Bill>> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url).pipe(
            map((bill: TypeData<Bill>) => {
                return bill;
            }),
        );
    }

    receivedBill(billId: number, userId: number): Observable<TypeData<Bill>> {
        const url: string = `${_prefix}/reveivedBill/${billId}?userId=${userId}`;
        return this.httpClient.put(url, {}).pipe(
            map((bill: TypeData<Bill>) => {
                return bill;
            }),
        );
    }

    completeBill(billId: number, bill: Bill): Observable<TypeData<Bill>> {
        const url: string = `${_prefix}/complete/${billId}`;
        return this.httpClient.put(url, bill).pipe(
            map((bill: TypeData<Bill>) => {
                return bill;
            }),
        );
    }

    public getBillIdNewest(): Observable<number> {
        let url: string = `${_prefix}/GetBillIdNewest`;
        return this.httpClient.get(url).pipe(
            map((id: number) => {
                return id;
            }),
        );
    }

    public async getBillIdNewestByType(
        billType: string,
    ): Promise<NewestBillNumberModel> {
        let url: string = `${_prefix}/GetBillIdNewest/${billType}`;
        const response = await this.httpClient
            .get<IResponse<NewestBillNumberModel>>(url)
            .toPromise();
        return response.data;
    }

    // notification api
    getNotificationCount(): Observable<NotificationCountResult> {
        const url = `${notificationsUrl}/notificationcount`;
        return this.httpClient
            .get<NotificationCountResult>(url)
            .pipe(catchError(BillService.handleError));
    }

    getNotificationMessage(): Observable<Array<NotificationResult>> {
        const url = `${notificationsUrl}/notificationresult`;
        return this.httpClient
            .get<Array<NotificationResult>>(url)
            .pipe(catchError(BillService.handleError));
    }

    // notification to staff api
    getNotificationToStaffCount(
        params = null,
    ): Observable<NotificationCountResult> {
        const url = `${notificationsUrl}/notificationtostaffcount`;
        return this.httpClient
            .get<NotificationCountResult>(url, { params })
            .pipe(catchError(BillService.handleError));
    }

    getNotificationToStaffMessage(
        params = null,
    ): Observable<Array<NotificationResult>> {
        const url = `${notificationsUrl}/notificationtostaffresult`;
        return this.httpClient
            .get<Array<NotificationResult>>(url, { params })
            .pipe(catchError(BillService.handleError));
    }

    getNotificationDetail(id: number): Observable<NotificationResult> {
        const url = `${notificationsUrl}/notification/${id}`;
        return this.httpClient
            .get<NotificationResult>(url)
            .pipe(catchError(BillService.handleError));
    }

    changeStatus(
        billTracking: ChangeStatusResult,
    ): Observable<NotificationResult> {
        const url = `${notificationsUrl}/changestatus`;
        return this.httpClient.put(url, billTracking).pipe(
            map((billTracking: NotificationResult) => {
                return billTracking;
            }),
        );
    }

    changePriority(id: number): Observable<NotificationResult> {
        const url = `${notificationsUrl}/changePriority?Id=${id}`;
        return this.httpClient.get(url).pipe(
            map((billTracking: NotificationResult) => {
                return billTracking;
            }),
        );
    }

    public deleteNotification(
        id: number,
    ): Observable<NotificationResult | null> {
        const url: string = `${notificationsUrl}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((billTracking: NotificationResult) => {
                return billTracking;
            }),
        );
    }

    deleteNotifications(): Observable<{}> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${notificationsUrl}/deletenotifications`;
        return this.httpClient
            .delete(url, { headers: headers })
            .pipe(catchError(BillService.handleError));
    }

    deleteNotificationsWork(): Observable<{}> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${notificationsUrl}/deletenotifications-work`;
        return this.httpClient
            .delete(url, { headers: headers })
            .pipe(catchError(BillService.handleError));
    }

    private static handleError(err) {
        let errorMessage: string;
        if (err.error instanceof ErrorEvent) {
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
        }
        console.error(err);
        return throwError(errorMessage);
    }

    readMessage(id: number) {
        const url = `${notificationsUrl}/ReadMessage?id=${id}`;
        return this.httpClient
            .get(url)
            .pipe(catchError(BillService.handleError));
    }

    createInvoice(id: number): Observable<any> {
        const url = `${_prefix}/bill-customer-invoice/${id}`;
        return this.httpClient
            .put(url, {})
            .pipe(catchError(BillService.handleError));
    }
    copyBill(id: number): Observable<any> {
        const url: string = `${_prefix}/bill-copy/${id}`;
        return this.httpClient.get(url).pipe(
            map((bill: any) => {
                return bill;
            }),
        );
    }
    cancelBill(billId: number, userId: number): Observable<TypeData<Bill>> {
        const url: string = `${_prefix}/cancel-bill/${billId}?userId=${userId}`;
        return this.httpClient.put(url, {}).pipe(
            map((bill: TypeData<Bill>) => {
                return bill;
            }),
        );
    }

    changeBillNumberByType(
        billId: number,
        billPrefix: string,
    ): Observable<any> {
        const url: string = `${_prefix}/get-next-bill-number`;
        return this.httpClient
            .get(url, { params: { billPrefix, excludeIds: [billId || 0] } })
            .pipe(
                map((response: IResponse<any>) => {
                    return response.data;
                }),
            );
    }

    importBill(file: FormData, type: number): any {
        const url: string = `${_prefix}/import-bill?type=${type}`;
        return this.httpClient.post(url, file).pipe(
            map((response: any) => {
                return response.data;
            }),
        );
    }

    public GetLedgerFromBillId(billId: number) {
        let url: string = `${_prefix}/ledger-from-bill?billId=${billId}`;
        return this.httpClient.get(url).pipe(
            map((response: any) => {
                return response.data;
            }),
        );
    }

    public getBillPdf(billId: number) {
        let url: string = `${_prefix}/get-bill-pdf/${billId}`;
        return this.httpClient.get(url).pipe(
            map((response: any) => {
                return response.data;
            }),
        );
    }
}
