import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import AppConstant from '../utilities/app-constants';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor(private readonly httpClient: HttpClient) {}
    _prefix = `${AppConstant.DEFAULT_URLS.API}/File`;
    
    async uploadMedia(file: any, folderName?: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderName', folderName);
        return this.httpClient
            .post(this._prefix, formData)
            .pipe(
                map((response: any) => {
                    return response.url;
                }),
            )
            .toPromise();
    }
}
