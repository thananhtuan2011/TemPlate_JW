import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/projects`;

@Injectable({
    providedIn: 'root',
})
export class ProjectCodeService {
    constructor(private readonly http: HttpClient) {}

    getList() {
        return this.http.get(`${_prefix}/list`).pipe(
            map((res) => {
                return res;
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
}
