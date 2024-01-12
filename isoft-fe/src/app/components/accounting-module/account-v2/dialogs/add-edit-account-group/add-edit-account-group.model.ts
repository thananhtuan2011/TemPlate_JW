import { AccountGroupSyncModel } from 'src/app/models/account-group-sync.model';
import { AccountGroupSyncMultiSelect } from 'src/app/shared/is-table/is-table.model';

export class AddEditAccountGroupTableModel extends AccountGroupSyncModel {
    accountGroupMultiSelect: AccountGroupSyncMultiSelect;

    constructor(data?: any) {
        super(data);
    }
}
