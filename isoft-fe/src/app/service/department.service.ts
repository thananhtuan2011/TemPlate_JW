import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Department } from '../models/department.model';

export interface PageFilterDepartment extends Page {
    branch?: any;
    branchId?: number;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Departments`;

@Injectable({
    providedIn: 'root',
})
export class DepartmentService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListDepartment(params: any): Observable<TypeData<Department>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Department: TypeData<Department>) => {
                return Department;
            }),
        );
    }

    public getList(): Observable<TypeData<Department>> {
        return this.httpClient.get(`${_prefix}/list`, {}).pipe(
            map((Department: TypeData<Department>) => {
                return Department;
            }),
        );
    }

    public getAllDepartment(params?: any): Observable<TypeData<Department>> {
        return this.httpClient.get(`${_prefix}/list`, { params }).pipe(
            map((Department: TypeData<Department>) => {
                return Department;
            }),
        );
    }

    public getDepartmentDetail(id: number): Observable<Department> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Department: Department) => {
                return Department;
            }),
        );
    }

    public createDepartment(
        Department: Department,
    ): Observable<Department | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Department).pipe(
            map((Department: Department) => {
                return Department;
            }),
        );
    }

    public updateDepartment(
        Department: Department,
        id: number,
    ): Observable<Department> {
        console.log(Department);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Department).pipe(
            map((Department: Department) => {
                return Department;
            }),
        );
    }

    public deleteDepartment(id: number): Observable<Department | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Department: Department) => {
                return Department;
            }),
        );
    }

    uploadFiles(formData): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/uploadImage`, formData, {
                reportProgress: true,
                observe: 'events',
            })
            .pipe(catchError(this.errorMgmt));
    }

    deleteFiles(paths): Observable<any> {
        let data = [];
        for (let i = 0; i < paths.length; i++) {
            data.push({ imageUrl: paths[i] });
        }
        const url: string = `${_prefix}/deleteImages`;
        return this.httpClient.post(url, data).pipe(
            map((imageUrl: string) => {
                return imageUrl;
            }),
        );
    }

    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    getExcelReport(param: PageFilterDepartment): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Department`;

        return this.httpClient.get(url).pipe(
            map((data: { dt: string }) => {
                return data;
            }),
        );
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    importExcel(formData): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/import-Department`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    public getAllDepartmentForTask(): Observable<TypeData<Department>> {
        return this.httpClient
            .get(`${_prefix}/get-list-department-for-task`)
            .pipe(
                map((Department: TypeData<Department>) => {
                    return Department;
                }),
            );
    }
}
