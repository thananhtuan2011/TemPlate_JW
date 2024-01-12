export class HeaderGeneralStatistics {
    totalItems: number;
    currenPage: number;
    pageSize: number;
    data: [
        {
            id: number;
            code: number;
            name: string;
            type: number;
        },
    ];
    dataTotal: number;
    nextStt: number;
}
export class GeneralStatistics {
    dt: [];
    dts: null;
    nextStt: number;
    p: number;
    pz: number;
    ti: number;
}
