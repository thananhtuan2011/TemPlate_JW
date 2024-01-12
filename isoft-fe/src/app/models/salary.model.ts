export interface Salary {
    id: number;
    fullName: string;
    salary: number;
    contractTypeId: any;
    soNgayCong: any;
    departmentId: number;
    positionName: string;
    salaryTotal: number;
    salaryContract: number;
    dayInOut: number;
    salaryReal: number;
    thueTNCN: number;
    tamUng: number;
    salarySend: number;
    soThuTu: string;
    listChild: Salary[];
    salarySocial: [
        {
            code: string;
            valueCompany: number;
            valueUser: number;
        },
    ];
}
