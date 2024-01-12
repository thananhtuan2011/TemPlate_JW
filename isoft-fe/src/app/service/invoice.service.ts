import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryModel } from '../models/inventory.model';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { TypeData } from '../models/common.model';
import { InvoiceDeclarationModel } from '../models/invoice-declaration.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Invoices`;

@Injectable({
    providedIn: 'root',
})
export class InvoiceService {
    constructor(private readonly httpClient: HttpClient) {}

    getEndPoint(): Observable<any> {
        return this.httpClient.get(`${_prefix}/end-point`).pipe(
            map((res) => {
                return res;
            }),
        );
    }
}
