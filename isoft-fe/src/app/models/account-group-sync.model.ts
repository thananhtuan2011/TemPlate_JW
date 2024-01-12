export class AccountGroupSyncModel {
    id: number = 0;
    code: string = '';
    name: string = '';

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
