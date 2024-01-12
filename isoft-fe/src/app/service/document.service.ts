import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Page, TypeData } from '../models/common.model';
import {
    Degree,
    Department,
    Document,
    Position,
    Target,
} from '../models/document.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Documents`;

@Injectable({
    providedIn: 'root',
})
export class DocumentService {
    _baseUrl = AppConstant.DEFAULT_URLS.API;
    constructor(private readonly httpClient: HttpClient) {}

    public getDocuments(params: any): Observable<TypeData<Document>> {
        return this.httpClient.get(_prefix, { params }).pipe(
            map((document: TypeData<Document>) => {
                return document;
            }),
        );
    }

    public getAllActiveDocument(): Observable<TypeData<Document>> {
        return this.httpClient.get(`${_prefix}/list`, {}).pipe(
            map((document: TypeData<Document>) => {
                return document;
            }),
        );
    }

    public getAllActiveDocumentV2(): Observable<TypeData<any>> {
        return this.httpClient
            .get(
                `${AppConstant.DEFAULT_URLS.API}/v2/document/by-current-user`,
                {},
            )
            .pipe(
                map((document: TypeData<any>) => {
                    return document;
                }),
            );
    }

    public getDocumentDetailV2(id: number): Observable<any> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/v2/document/${id}`, {})
            .pipe(
                map((document: any) => {
                    return document;
                }),
            );
    }

    public getDocumentDetail(id: number): Observable<Document> {
        return this.httpClient.get(`${_prefix}/${id}`, {}).pipe(
            map((document: Document) => {
                return document;
            }),
        );
    }

    public createDocument(document: Document): Observable<Document | null> {
        return this.httpClient.post(_prefix, document).pipe(
            map((document: Document) => {
                return document;
            }),
        );
    }

    public updateDocument(
        id: number,
        document: Document,
    ): Observable<Document> {
        return this.httpClient.put(`${_prefix}/${id}`, document).pipe(
            map((document: Document) => {
                return document;
            }),
        );
    }

    public deleteDocument(id: number): Observable<Document | null> {
        return this.httpClient.delete(`${_prefix}/${id}`, {}).pipe(
            map((document: Document) => {
                return document;
            }),
        );
    }

    public getPositionList(): Observable<TypeData<Position> | null> {
        return this.httpClient
            .get(`${this._baseUrl}/PositionDetails/list`, {})
            .pipe(
                map((res: TypeData<Position>) => {
                    return res;
                }),
            );
    }

    public getDepartmentList(): Observable<TypeData<Department> | null> {
        return this.httpClient
            .get(`${this._baseUrl}/Departments/list`, {})
            .pipe(
                map((res: TypeData<Department>) => {
                    return res;
                }),
            );
    }

    public getTargetList(): Observable<TypeData<Target> | null> {
        return this.httpClient.get(`${this._baseUrl}/Targets/list`, {}).pipe(
            map((res: TypeData<Target>) => {
                return res;
            }),
        );
    }

    public getDegreeList(): Observable<TypeData<Degree> | null> {
        return this.httpClient.get(`${this._baseUrl}/degrees/list`, {}).pipe(
            map((res: TypeData<Degree>) => {
                return res;
            }),
        );
    }
    public getCertificatesList(): Observable<TypeData<Degree> | null> {
        return this.httpClient.get(`${this._baseUrl}/Certificates`, {}).pipe(
            map((res: TypeData<Degree>) => {
                return res;
            }),
        );
    }
}
