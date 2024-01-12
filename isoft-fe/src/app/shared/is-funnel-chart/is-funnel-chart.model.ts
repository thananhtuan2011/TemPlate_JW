export interface IIsFunnelChartModel {
    labels: string[];
    backgroundColors: string[];
    data: any[];
}

export class IsFunnelChartModel implements IIsFunnelChartModel {
    labels: string[] = [];
    backgroundColors: string[] = [];
    data: any[] = [];

    constructor(data?: IIsFunnelChartModel) {
        if (data) {
            for (let prop in data) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        }
    }
}
