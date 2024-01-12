export const PTCSS = `<style>
    body {
        font-family: 'Times New Roman';
    }
    .wrapper {
        width: 21cm;
        height: 13cm;
        margin: 0;
        padding: 0 20px;
    }


    .bill-header {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
    }

    .bill-header img {
        height: 150px;
    }

    #bill-title {
        font-size: 22px;
        font-weight: bold;
        text-align: center;
        text-transform: uppercase;
        margin-top: 10px;
        margin-bottom: 30px;
    }

    .customer-info {
        width:100%;
        table-layout: fixed;
    }

    .customer-info tr td {
        padding: 2px 0;
    }

    .prod-info td {
        font-size: 14px;
    }

    .detail-table {
        width:100%;
        table-layout: fixed;
    }

    .detail-table tr th {
        padding: 10px 1px;
    }

    .detail-table,
    .detail-table tr td,
    .detail-table tr th {
        border: 1px groove black;
        border-collapse: collapse;
    }

    .detail-table .prod-info {
        padding: 2px;
        border-bottom: 1px dashed black;
    }

    .total-info td {
        border-left: none !important;
        border-right: none !important;
    }

    .bill-footer {
        padding: 0 20px;
        display: -webkit-box;
        display: -webkit-flex;
        display: flex;
        -webkit-flex-direction: row;
        flex-direction: row;
        -webkit-box-pack: justify;
        -webkit-justify-content: space-between;
        justify-content: space-between;
    }

    .bill-footer .item {
        text-align: center;
    }

</style>`;

export const PXCSS = ` <style>
body {
    padding: 0rem 1rem;
}

.head {
    display: flex;
}

.head_left {
    justify-content: flex-start;
    width: 80%;
    font-size: 12px;
}

.head_left span {
    display: block;
}

.head_right {
    text-align: right;
    width: 20%;
    font-size: 12px;
}

.tite {
    text-align: center;
    margin-top: -1rem;
}
.tite h2 {
    margin-bottom: 0px;
}
.tite span {
    display: block;
}

.tite_right {
    display: flex;
    float: right;
    flex-direction: column;
    margin-top: -2rem;
    width: 20%;
}

.tite_right .tite_right_title {
    text-align: left;
    font-weight: bold;
}

.tite_right span {
    display: inline;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;

}

td,
th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
}

tbody td:nth-child(1) {
    width: 5%;
}

.text_right {
    text-align: right;
}

.text_left {
    text-align: left;
}
.text_center {
    text-align: center;
}

.content {
    padding: 1rem 0rem;
    margin-top: -0.8rem;
}

.content .lable {
    font-weight: bold;
}

.content .sign_name {
    font-weight: normal;
}

.padding_bt {
    padding-bottom: 10px;
    word-break: break-word;
}

.p_month {
    margin-top: 0rem;
    text-align: right;
    margin-bottom: 0rem;
}

.sign {
    display: flex;
    flex-wrap: wrap;
}

.sign div {
    width: 20%;
}

.sign div p {
    margin-bottom: 0px;
}

.sign div span {
    font-size: 13px;
}

.sign .p_empty {
    height: 1.3rem;
}
.sign .lable, .sign h4, .sign span, .sign .sign_name {
    text-align: center;
    font-size: 12px;
}
.sign span {
    margin-left: auto;
    margin-right: auto;
    display: table;
}

.text-overflow {
    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
}

.logo-pxk {
    width: 40%;
    height: 40%;
    margin-top: 20px;
}
</style>`;

export const PTCSSForArise = `  <style>
body {
    padding: 0rem 1rem;
    font-family: Tahoma, Arial, Helvetica, sans-serif;
}
.a5-horizontal {
    width: 21cm;
    height: 13cm;
    margin: 0;
    padding-top: 20px;
}
.inright {
    font-size: 11px;
    font-weight: normal !important;
}
.inright:before {
    content: '';
    position: absolute;
    border-bottom: 1px dotted #151515d6;
    width: 100px;
    margin-top: 11px;
    margin-left: -25px;
}
.head {
    margin-left: 20px;
    display: flex;
}
.head_left {
    justify-content: flex-start;
    width: 80%;
    margin-left: 25px;
}
.head_left span {
    display: block;
}
.header-bold {
    font-weight: 900;
}
.head_right {
    text-align: right;
    width: 20%;
}
.head_left, .head_right {
    font-size: 11px;
}
.tite {
    text-align: center;
    margin-top: -1rem;
}
.tite h2 {
    margin-bottom: 5px;
    margin-top: 25px;
}
.tite span {
    display: block;
    font-size: 12px;
}
.tite_right {
    display: flex;
    float: right;
    flex-direction: column;
    margin-top: -3rem;
    width: 150px;
}
.tite_right span {
    text-align: left;
    font-weight: bold;
}
.bottom-line {
    position: relative;
}
.bottom-line-80:before {
    position: absolute;
    content: '';
    width: 80px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.bottom-line-30:before {
    position: absolute;
    content: '';
    width: 30px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.bottom-line-105:before {
    position: absolute;
    content: '';
    width: 105px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.bottom-line-4xx:before {
    position: absolute;
    content: '';
    width: 448px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.bottom-line-3xx:before {
    position: absolute;
    content: '';
    width: 355px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.bottom-line-150:before {
    position: absolute;
    content: '';
    width: 150px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.bottom-line-114:before {
    position: absolute;
    content: '';
    width: 114px;
    border-bottom: 1px dotted;
    bottom: 0;
}
.d-inline-block {
    display: inline-block;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    border: 1px solid #000;
}
.sm-size {
    font-size: 11px !important;
}
.wrapper {
    padding: 0px 25px;
    margin-left: 40px;
}
td,
th {
    text-align: left;
    padding: 4px 8px;
    border-right: 1px solid #000;
}
td:nth-child(2n) {
    text-align: right;
}
.content {
    font-size: 12px;
    padding: 1rem 0rem;
    margin-top: -5px;
}
.content .lable {
    font-weight: bold;
}
.padding_bt {
    padding-bottom: 10px;
    word-break: break-word;
}
.padding_bt_d2 {
    padding-bottom: 5px;
    word-break: break-word;
}
.p_month {
    margin-top: 0rem;
    text-align: right;
    margin-bottom: 0rem;
}
.big-tbhead {
    height: 40px;
    vertical-align: middle;
    text-align: center;
}
.yellow-header {
    background-color: #FFFFE1;
    border-bottom: 1px solid;
}
.sign {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly
}
.light-border-bottom {
    border-bottom: 1px solid grey;
}
.sign div {
    width: 20%;
}
.sign div p {
    margin-bottom: 0px;
}
.sign div span {
    font-size: 12px;
}
.sign .p_empty {
    height: 4.3rem;
}
.sign .lable, .sign h4, .sign span {
    text-align: center;
    font-size: 12px;
}
.sign span {
    margin-left: auto;
    margin-right: auto;
    display: table;
}
.w-full{
width: 100%
}
.flex{
display: flex;
}
.flex-column{
flex-direction: column;
}
.align-items-center{
align-items: center;
}
.align-items-start{
align-items: start;
}
.justify-content-center{
justify-content: center;
}
.justify-content-start{
justify-content: start;
}
.justify-content-between{
justify-content: space-between;
}
.py-1{
padding: 0.25rem 0;
}
.px-1{
padding: 0 0.25rem
}
.py-2{
padding: 0.5rem 0;
}
.px-2{
padding: 0 0.5rem
}
.mb-0{
margin-bottom: 0;
}
.mt-0{
margin-top: 0;
}
.font-bold{
font-weight: bold;
}
.uppercase{
text-transform: uppercase;
}
</style>`;
