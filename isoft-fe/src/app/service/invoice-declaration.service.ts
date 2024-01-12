import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryModel } from '../models/inventory.model';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { TypeData } from '../models/common.model';
import { InvoiceDeclarationModel } from '../models/invoice-declaration.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/InvoiceDeclaration`;

@Injectable({
    providedIn: 'root',
})
export class InvoiceDeclarationService {
    constructor(private readonly httpClient: HttpClient) {}

    getInvoiceDeclarations(
        params,
    ): Observable<TypeData<InvoiceDeclarationModel>> {
        return this.httpClient.get(_prefix, { params }).pipe(
            map((res) => {
                return res as TypeData<InvoiceDeclarationModel>;
            }),
        );
    }

    addInvoiceDeclaration(request: InvoiceDeclarationModel): Observable<any> {
        return this.httpClient.post(_prefix, request).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    updateInvoiceDeclaration(request: any): Observable<any> {
        return this.httpClient.put(`${_prefix}/${request.id}`, request).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    deleteInvoiceDeclaration(id: number): Observable<any> {
        return this.httpClient.delete(`${_prefix}/${id}`).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    resetInvoiceDeclaration(id: number): Observable<any> {
        return this.httpClient.put(`${_prefix}/reset-invoice/${id}`, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    syncInvoiceWithLedger(id: number): Observable<any> {
        return this.httpClient.put(`${_prefix}/invoice/${id}`, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }
}
