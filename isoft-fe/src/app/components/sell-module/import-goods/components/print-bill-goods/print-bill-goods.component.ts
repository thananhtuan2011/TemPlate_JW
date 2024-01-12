import { Component, Input, OnInit } from '@angular/core';
import { StyleCustom } from '../../PTCSS';
import * as moment from 'moment/moment';
import AppConstant from '../../../../../utilities/app-constants';
import { ProductModel } from '../../../../../models/cashier.model';
import { Goods } from '../../../../../models/goods.model';
import appUtil from '../../../../../utilities/app-util';

@Component({
    selector: 'app-print-bill-goods',
    template: '',
})
export class PrintBillGoodsComponent implements OnInit {
    @Input() customers: any[];
    @Input() selectedBillTab: any;
    @Input() company: any;

    constructor() {}

    ngOnInit(): void {}

    onPrint(billTab) {
        setTimeout(() => {
            const cssFile = StyleCustom;
            if (window) {
                let products = '';
                const dateNow = moment().format('DD/MM/YYYY hh:mm:ss');
                let i = 0;
                billTab.data.products.forEach((product) => {
                    i = i + 1;
                    products +=
                        '    \t\t\t\t\t\t\t<tr>\n' +
                        "    \t\t\t\t\t\t\t\t<td colspan = '3'>" +
                        i +
                        '. ' +
                        this.getAccountCode(product) +
                        ' - ' +
                        this.getAccountName(product) +
                        '</td>\n' +
                        '    \t\t\t\t\t\t\t</tr>\n' +
                        '    \t\t\t\t\t\t\t<tr>\n' +
                        "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                        product.billQuantity +
                        ' x ' +
                        ' </td>\n' +
                        "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                        this.formatMoney(
                            this.getDiscountMoney(
                                product,
                                product.discountPrice,
                            ),
                        ) +
                        ' = ' +
                        ' </td>\n' +
                        "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                        this.formatMoney(
                            product.billQuantity *
                                this.getDiscountMoney(
                                    product,
                                    product.discountPrice,
                                ),
                        ) +
                        ' </td>\n' +
                        '    \t\t\t\t\t\t\t</tr>\n' +
                        '    \t\t\t\t\t\t\t<tr>\n' +
                        // "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" + this.formatMoney(product.realPrice) + "đ</td>\n" +

                        // "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" + this.formatMoney(product.discountPrice) + ((product.discountType === 'percent') ? '%' : 'đ') +  "</td>\n" +
                        // "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" + this.formatMoney(product.quantity * product.unitPrice) + "đ</td>\n" +
                        '    \t\t\t\t\t\t\t</tr>\n' +
                        '                                <tr>\n';
                    if (product.discountPrice > 0) {
                        products +=
                            '    \t\t\t\t\t\t\t<tr>\n' +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: left;' colspan = '2'> KM </td>\n" +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: right;'> " +
                            this.formatMoney(product.discountPrice) +
                            (product.discountType === 'percent' ? '%' : 'đ') +
                            '</td>\n' +
                            '    \t\t\t\t\t\t\t</tr>\n';
                    }
                });
                if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,' +
                            'location=no,status=no,titlebar=no',
                    );
                    popup.window.focus();
                    popup.document.write(
                        '<!DOCTYPE html><html><head>  ' +
                            `${cssFile} ` +
                            '</head><body onload="window.print()"><div class="reward-body">' +
                            '<div class="container">\n' +
                            '    <div class="row">\n' +
                            '        <div class="col-xs-12">\n' +
                            '    \t\t<div class="invoice-title">\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 24px; padding: 2px;'><strong>" +
                            this.company.name +
                            '</strong></p></div>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 20px; padding: 2px;'><strong>Hóa đơn thanh toán</strong></p></div>\n" +
                            "    \t\t\t<div style='text-align: right;'><p style='font-size: 16px;'>Số phiếu: " +
                            billTab.data.billNumber +
                            '</p></div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t<hr>\n' +
                            '    \t\t<div class="row">\n' +
                            '    \t\t\t<div class="col-xs-6">\n' +
                            '    \t\t\t\t<address>\n' +
                            '    \t\t\t\tTên bàn: <span>' +
                            billTab.floorName +
                            '<span></span> / <span>' +
                            billTab.deskName +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\tTên KH: <span>' +
                            this.getCustomerName(billTab.data.customerId) +
                            '</span><br />\n' +
                            '    \t\t\tSL: <span>' +
                            billTab.data.customerNumber +
                            '</span>KH<br />\n' +
                            "    \t\t\t<span style='font-size: 12px;'>" +
                            dateNow +
                            '</span><br />\n' +
                            '    \t\t</div>\n' +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '    \n' +
                            '    <div class="row">\n' +
                            '    \t<div class="col-md-12">\n' +
                            '    \t\t<div class="panel panel-default">\n' +
                            '    \t\t\t<div class="panel-heading">\n' +
                            '    \t\t\t\t<h4 class="panel-title">Chi tiết biên nhận</h4>\n' +
                            '    \t\t\t<div class="panel-body">\n' +
                            '    \t\t\t\t<div class="table-responsive">' +
                            '    \t\t\t\t\t<table class="table table-condensed">' +
                            '    \t\t\t\t\t\t<tbody>\n' +
                            '    \t\t\t\t\t\t\t<!-- foreach ($order->lineItems as $line) or some such thing here -->\n' +
                            products +
                            '    \t\t\t\t\t\t</tbody>\n' +
                            '    \t\t\t\t\t</table>\n' +
                            '    \t\t\t\t</div>\n' +
                            '    \t\t\t</div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t\t\tGiảm trên tổng hóa đơn: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.discountPrice,
                            ) +
                            (this.selectedBillTab.data.discountType ===
                            'percent'
                                ? '%'
                                : 'đ') +
                            '.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tTổng tiền: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tBằng chữ: <span>' +
                            appUtil.formatCurrencyVNDString(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền khách đưa: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.amountReceivedByCus,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền trả lại khách: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.amountReceivedByCus -
                                    this.getDiscountBillMoney() || 0,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tGhi chú: <span>' +
                            (this.selectedBillTab.data.note || '') +
                            '.</span>' +
                            ' <br /><br /><br /><br />\n' +
                            '    \t\t<hr>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'>Cảm ơn Quý khách và hẹn gặp lại!!!</p></div><br />\n" +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'><strong>Pass Wifi: " +
                            appUtil.getStorage(AppConstant.WIFI) +
                            '</strong></p></div>\n' +
                            "<div style='page-break-before:always'></div>" +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '</div>' +
                            '</div></html>',
                    );
                    popup.onbeforeunload = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                        return '.\n';
                    };
                    popup.onabort = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                    };
                    popup.document.close();
                    // this.dataPrint = null;
                } else {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=800,height=600',
                    );
                    popup.document.open();
                    popup.document.write(
                        '<!DOCTYPE html><html><head>  ' +
                            `${cssFile} ` +
                            '</head><body onload="window.print()"><div class="reward-body">' +
                            '<div class="container">\n' +
                            '    <div class="row">\n' +
                            '        <div class="col-xs-12">\n' +
                            '    \t\t<div class="invoice-title">\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 24px; padding: 2px;'><strong>" +
                            this.company.name +
                            '</strong></p></div>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 20px; padding: 2px;'><strong>Hóa đơn thanh toán</strong></p></div>\n" +
                            "    \t\t\t<div style='text-align: right;'><p style='font-size: 16px;'>Số phiếu: " +
                            billTab.data.billNumber +
                            '</p></div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t<hr>\n' +
                            '    \t\t<div class="row">\n' +
                            '    \t\t\t<div class="col-xs-6">\n' +
                            '    \t\t\t\t<address>\n' +
                            '    \t\t\t\tTên bàn: <span>' +
                            billTab.floorName +
                            '<span></span> / <span>' +
                            billTab.deskName +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\tTên KH: <span>' +
                            this.getCustomerName(billTab.data.customerId) +
                            '</span><br />\n' +
                            '    \t\t\tSL: <span>' +
                            billTab.data.customerNumber +
                            '</span>KH<br />\n' +
                            "    \t\t\t<span style='font-size: 12px;'>" +
                            dateNow +
                            '</span><br />\n' +
                            '    \t\t</div>\n' +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '    \n' +
                            '    <div class="row">\n' +
                            '    \t<div class="col-md-12">\n' +
                            '    \t\t<div class="panel panel-default">\n' +
                            '    \t\t\t<div class="panel-heading">\n' +
                            '    \t\t\t\t<h4 class="panel-title">Chi tiết biên nhận</h4>\n' +
                            '    \t\t\t<div class="panel-body">\n' +
                            '    \t\t\t\t<div class="table-responsive">' +
                            '    \t\t\t\t\t<table class="table table-condensed">' +
                            '    \t\t\t\t\t\t<tbody>\n' +
                            '    \t\t\t\t\t\t\t<!-- foreach ($order->lineItems as $line) or some such thing here -->\n' +
                            products +
                            '    \t\t\t\t\t\t</tbody>\n' +
                            '    \t\t\t\t\t</table>\n' +
                            '    \t\t\t\t</div>\n' +
                            '    \t\t\t</div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t\t\tGiảm trên tổng hóa đơn: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.discountPrice,
                            ) +
                            (this.selectedBillTab.data.discountType ===
                            'percent'
                                ? '%'
                                : 'đ') +
                            '.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tTổng tiền: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tBằng chữ: <span>' +
                            appUtil.formatCurrencyVNDString(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền khách đưa: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.amountReceivedByCus,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền trả lại khách: <span>' +
                            (this.selectedBillTab.data.amountReceivedByCus -
                                this.getDiscountBillMoney() || 0) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tGhi chú: <span>' +
                            (this.selectedBillTab.data.note || '') +
                            '.</span>' +
                            ' <br /><br /><br /><br />\n' +
                            '    \t\t<hr>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'>Cảm ơn Quý khách và hẹn gặp lại!!!</p></div><br />\n" +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'><strong>Pass Wifi: " +
                            appUtil.getStorage(AppConstant.WIFI) +
                            '</strong></p></div>\n' +
                            "<div style='page-break-before:always'></div>" +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '</div>' +
                            '</div></html>',
                    );
                    popup.onbeforeunload = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                        return '.\n';
                    };
                    popup.onabort = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                    };
                    popup.document.close();
                    // this.dataPrint = null;
                }
            }
        }, 1000);
    }

    formatMoney(n) {
        if (n)
            return n
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                .replace('.00', '');
        return 0;
    }

    getDiscountMoney(product: ProductModel, discountTemp: number) {
        if (product.discountType === 'percent') {
            return (
                product.salePrice +
                product.taxVat -
                (product.salePrice / 100) * discountTemp
            );
        }
        return product.salePrice + product.taxVat - discountTemp;
    }

    getAccountCode(data: Goods) {
        if (data.detail2) {
            return data.detail2;
        }
        if (data.detail2) {
            return data.detail2;
        }
        if (data.goodsCode) {
            return data.goodsCode;
        }
        return data.account;
    }

    getCustomerName(customerId) {
        if (customerId > 0) {
            return this.customers.find((x) => x.id === customerId).name;
        }
        return '';
    }

    getAccountName(data: Goods) {
        if (data.detail2) {
            return data.detailName2;
        }
        if (data.detail1) {
            return data.detailName1;
        }
        if (data.goodsName) {
            return data.goodsName;
        }
        return data.accountName;
    }

    getDiscountBillMoney() {
        let totalPrice = 0;
        if (this.selectedBillTab.data.discountType === 'percent') {
            totalPrice =
                this.selectedBillTab.data.totalAmount -
                (this.selectedBillTab.data.totalAmount / 100) *
                    this.selectedBillTab.data.discountPrice;
        } else {
            totalPrice =
                this.selectedBillTab.data.totalAmount -
                this.selectedBillTab.data.discountPrice;
        }
        return totalPrice;
    }
}
