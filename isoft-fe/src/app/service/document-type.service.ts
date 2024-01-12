import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { map } from 'rxjs/operators';
import { DocumentTypeModel } from '../models/document-type.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/DocumentType`;

@Injectable({
    providedIn: 'root',
})
export class DocumentTypeService {
    constructor(private readonly httpClient: HttpClient) {}
    public getPagingDocumentType(
        params: any,
    ): Observable<TypeData<DocumentTypeModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((docType: TypeData<DocumentTypeModel>) => {
                return docType;
            }),
        );
    }

    public getDocumentTypeDetail(id: number): Observable<DocumentTypeModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((docType: DocumentTypeModel) => {
                return docType;
            }),
        );
    }

    public createDocumentType(
        DocumentType: DocumentTypeModel,
    ): Observable<DocumentTypeModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, DocumentType).pipe(
            map((docType: DocumentTypeModel) => {
                return docType;
            }),
        );
    }

    public updateDocumentType(
        DocumentType: DocumentTypeModel,
        id: number,
    ): Observable<DocumentTypeModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, DocumentType).pipe(
            map((docType: DocumentTypeModel) => {
                return docType;
            }),
        );
    }

    public deleteDocumentType(
        id: number,
    ): Observable<DocumentTypeModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((docType: DocumentTypeModel) => {
                return docType;
            }),
        );
    }
}
