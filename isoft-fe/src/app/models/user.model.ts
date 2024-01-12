export interface User {
    id?: number;
    username?: string;
    fullName?: string;
    fullname?: string;
    avatar?: string;
    token?: string;
    role?: string;
    code?: string;
}

export class UserStatisticsBirhdayInMonthModel {
    month: number = 0;
    male: number = 0;
    female: number = 0;

    constructor(data?: any) {
        if (data) {
            for (let prop in data) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        }
    }
}
export class UserStatisticsModel {
    totalUsers: number = 0;
    totalMale: number = 0;
    totalFemale: number = 0;
    birthDayOfUsers: UserStatisticsBirhdayInMonthModel[] = [];

    constructor(data?: any) {
        if (data) {
            for (let prop in data) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        }
    }
}
