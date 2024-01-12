import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TypeData } from '../models/common.model';
import { ContractType } from '../models/contract-type.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ContractFiles`;
let _prefixUpload = `${AppConstant.DEFAULT_URLS.API}/ReportDownload`;

@Injectable({
    providedIn: 'root',
})
export class ContractDeparmentService {
    constructor(private readonly http: HttpClient) {}

    getList(contractTypeId: number) {
        return this.http.get(`${_prefix}/list?contractTypeId=${contractTypeId}`).pipe(
            map((res) => {
                return res;
            }),
        );
    }
    
    public getListContractType(
        params: any,
    ): Observable<TypeData<ContractType>> {
        return this.http.get(`${_prefix}`, { params }).pipe(
            map((ContractType: TypeData<ContractType>) => {
                return ContractType;
            }),
        );
    }
    get(id: any) {
        return this.http.get(`${_prefix}/${id}`, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    create(input: any) {
        return this.http.post(_prefix, input).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    update(id, input: any) {
        return this.http.put(`${_prefix}/${id}`, input).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    delete(id: any) {
        return this.http.delete(`${_prefix}/${id}`, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    uploadFiles(formData): Observable<any> {
        return this.http.post(`${_prefixUpload}/upload-contract`, formData, {
            reportProgress: true,
            observe: 'events',
        });
    }

    getFolderPathDownload(linkFile: string): string {
        return `${environment.serverURL}/api/ReportDownload/download-contract-type?linkFile=${linkFile}`;
    }

    downloadContact(userId, contractId) {
        return this.http
            .get(
                `${environment.serverURL}/api/Users/contract-labor/${userId}?contractTypeId=${contractId}`,
                {},
            )
            .pipe(
                map((res) => {
                    return res;
                }),
            );
    }
}
