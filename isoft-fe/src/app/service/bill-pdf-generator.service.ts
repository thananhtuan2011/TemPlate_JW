import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { DiscountTypeEnum } from '../utilities/app-enum';
import { PxkComponent } from '../components/sell-module/components/pxk/pxk.component';
import { PdfGeneratorService } from './pdf-generator.service';
import { PTCSS } from '../components/accounting-module/arise/prints/const_css';
import { BillService } from './bill.service';
import { PxkV1Component } from "../components/sell-module/components/pxk-v1/pxk-v1.component";
import { BaogiaComponent } from '../components/sell-module/components/baogia/baogia.component';
import { el } from 'date-fns/locale';
import { CustomerService } from './customer.service';

@Injectable({
    providedIn: 'root',
})
export class BillPdfGeneratorService {
    viewContainerRef: ViewContainerRef;
    products: any = [];
    bill: any = {};
    pdfBillData: any = {};

    constructor(
        private pdfGeneratorService: PdfGeneratorService,
        private billService: BillService,
        private customerService: CustomerService,

    ) { }

    setup(viewContainerRef: ViewContainerRef) {
        this.viewContainerRef = viewContainerRef;
        return this;
    }

    generatePdf() {
        // Init component
        const viewContainerRef = this.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(PxkComponent);

        // Prepare pdf data
        componentRef.instance.dataPrint = this.pdfBillData;
        setTimeout(() => {
            const body = componentRef.location.nativeElement.innerHTML;
            let htmlTemplate = `
                <!DOCTYPE html>
                <html>
                    <head>${PTCSS}</head>
                    <body>${body}</body>
                </html>`;

            this.pdfGeneratorService
                .generatePdfFromHtml({ content: htmlTemplate })
                .subscribe((pdfBlob: Blob) => {
                    const blobUrl = URL.createObjectURL(pdfBlob);
                    window.open(blobUrl, '_blank');
                });
            this.destroyComponent(componentRef);
        }, 1000);
    }

    prepareAndGenerateXK(billId: number) {
        this.billService.getBillPdf(billId).subscribe((res) => {
            const { bill, customer, goods } = res;
            console.log(JSON.stringify({ bill, customer, goods }));
            this.mappingPdfData({ bill, customer, goods });
            this.generatePdfXK();
        });
    }

    prepareAndGenerateBaoGia(customerId: number, customerQuoteId: number) {
        this.customerService.GetDataBaoGia(customerId, customerQuoteId).subscribe((res) => {
            const { bill, customer, goods } = res;
            console.log(JSON.stringify({ bill, customer, goods }));
            this.mappingPdfData({ bill, customer, goods });
            this.generatePdfBaoGia();
        });
    }

    generatePdfXK() {
        // Init component
        const viewContainerRef = this.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(PxkV1Component);

        // Prepare pdf data
        componentRef.instance.dataPrint = this.pdfBillData;
        setTimeout(() => {
            const body = componentRef.location.nativeElement.innerHTML;
            let htmlTemplate = `
                <!DOCTYPE html>
                <html>
                    <head>${PTCSS}</head>
                    <body>${body}</body>
                </html>`;

            this.pdfGeneratorService
                .generatePdfFromHtml({ content: htmlTemplate })
                .subscribe((pdfBlob: Blob) => {
                    const blobUrl = URL.createObjectURL(pdfBlob);
                    window.open(blobUrl, '_blank');
                });
            this.destroyComponent(componentRef);
        }, 1000);
    }

    generatePdfBaoGia() {
        // Init component
        const viewContainerRef = this.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(BaogiaComponent);
        // Prepare pdf data
        componentRef.instance.dataPrint = this.pdfBillData;
        setTimeout(() => {
            const body = componentRef.location.nativeElement.innerHTML;
            let htmlTemplate = `
                <!DOCTYPE html>
                <html>
                    <head>${PTCSS}</head>
                    <body>${body}</body>
                </html>`;

            this.pdfGeneratorService
                .generatePdfFromHtml({ content: htmlTemplate }, 'baogia')
                .subscribe((pdfBlob: Blob) => {
                    const blobUrl = URL.createObjectURL(pdfBlob);
                    window.open(blobUrl, '_blank');
                });
            this.destroyComponent(componentRef);
        }, 1000);
    }

    prepareAndGenerate(billId: number) {
        this.billService.getBillPdf(billId).subscribe((res) => {
            const { bill, customer, goods } = res;
            this.mappingPdfData({ bill, customer, goods });
            this.generatePdf();
        });
    }

    private mappingPdfData({ bill, customer, goods }) {
        this.products = goods;
        this.bill = bill;
        this.pdfBillData = {
            surchargeBill: this.surchargeAmount,
            discountPriceBill: this.discountAmount,
            taxBill: this.vatAmount,
            totalAmount: this.totalAmount,
            taxPercentage: this.bill?.vatRate,
            originalAmount: this.originalAmount,
            goods: this.products,
            bill: {
                ...this.bill,
                customerName: customer?.name,
                customerAddress: customer?.address,
                customerTaxCode: customer?.taxCode,
                phone: customer?.phone,
                debitCode: customer?.debit.code
            },
        };
    }

    destroyComponent(componentRef: ComponentRef<any>) {
        if (componentRef) {
            componentRef.destroy();
        }
    }

    calculateDiscountPrice(product: any) {
        // Percent discount
        if (product.discountType == DiscountTypeEnum.Percent) {
            return (product.unitPrice * product.discountPrice) / 100;
        }
        return product.discountPrice;
    }

    get originalAmount() {
        return this.products.reduce((sum: number, product: any) => {
            let priceIncludeDiscount =
                product.unitPrice - this.calculateDiscountPrice(product);
            if (priceIncludeDiscount < 0) {
                priceIncludeDiscount = 0;
            }
            return sum + product.quantity * priceIncludeDiscount;
        }, 0);
    }

    get totalAmount() {
        return (
            this.originalAmount +
            this.vatAmount -
            this.discountAmount +
            this.surchargeAmount
        );
    }

    calculateDiscountAmount(product: any) {
        let discountAmount = 0;
        if (product.discountType === 'percent') {
            // Discount based on specific percentage
            discountAmount =
                (product.billQuantity *
                    product.unitPrice *
                    product.discountPrice) /
                100;
        } else {
            // Discount based on Specific discount amount
            discountAmount = product.billQuantity * product.discountPrice;
        }
        return discountAmount;
    }

    get vatAmount() {
        let billVatRate = this.bill?.vatRate;

        if (billVatRate > 0) {
            let amount = this.originalAmount - this.discountAmount;
            return (amount * billVatRate) / 100;
        }

        return this.products.reduce((sum, product) => {
            let vatAmount = product.quantity * product.taxVat;
            return sum + vatAmount;
        }, 0);
    }

    get discountAmount() {
        if(this.bill === undefined || this.bill === null)
            return 0;
        const { discountType, discountPrice } = this.bill;
        let discountAmount = 0;
        if (discountType === 'percent') {
            // Discount based on specific percentage
            discountAmount = (this.originalAmount * discountPrice) / 100;
        } else {
            // Discount based on Specific discount amount
            discountAmount = discountPrice ?? 0;
        }
        return discountAmount;
    }

    // TODO
    get surchargeAmount() {
        return this.bill?.surcharge || 0;
    }
}
