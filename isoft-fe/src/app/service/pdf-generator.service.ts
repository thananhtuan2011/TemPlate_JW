import { Injectable } from '@angular/core';
import AppConstant from '../utilities/app-constants';
import { GeneratePdfOption } from '../models/generate-pdf-option';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PdfGeneratorService {
    baseUrl = `${AppConstant.DEFAULT_URLS.API}/pdf-generator`;

    constructor(private httpClient: HttpClient) {}

    generatePdfFromHtml(option: GeneratePdfOption, type : string = ""): Observable<Blob> {
        let url = `${this.baseUrl}/from-html?type=${type}`;
        return this.httpClient.post<Blob>(url, option, {
            responseType: 'blob' as 'json',
        });
    }
}
