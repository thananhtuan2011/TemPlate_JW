export const StyleCustom = `  <style>
@media print {
  html,
  body {
    font-family: "Roboto",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    height: 100%;
    width: 100%;
    height:100%;
    position:absolute;
    top:0px;
    bottom:0px;
    margin: auto;
    margin-top: 0px !important;
  }
}

@page {
  margin: 4px;
}

.invoice-title h2, .invoice-title h3 {
    display: inline-block;
}

.table > tbody > tr > .no-line {
    border-top: none;
}

.table > thead > tr > .no-line {
    border-bottom: none;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px !important;
  margin-left: -3px;
  margin-right: -3px;
}

td, th {
  font-size: 14px;
  text-align: left;
  padding: 8px;
}
table, th, td {
  border: none;
  border-collapse: collapse;
}
/*tr:nth-child(even) {*/
/*  background-color: #dddddd;*/
/*}*/
</style>
</head>
</style>`;
