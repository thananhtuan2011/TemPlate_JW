export interface DocumentTypeModel {
    id?: number;
    name?: string;
    description?: string;
    status?: boolean;
    createAt?: Date;
    updateAt?: Date;
    deleteAt?: Date;
    isDelete: boolean;
    userCreated?: number;
    userUpdated?: number;
}
