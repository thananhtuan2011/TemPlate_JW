export interface Relative {
    id?: number;
    fullName?: string;
    phone?: string;
    birthDay?: Date | number | string;
    email?: string;

    avatar?: string;
    avataFile?: File;

    address?: string;
    facebook?: string;
    gender?: number;
    identify?: string;
    status?: boolean;
    total?: number;
    language?: string;

    //#region CMND
    nativePlace?: string;
    placeOfPermanent?: string;
    identifyCreatedDate?: Date | number | string;
    identifyCreatedPlace?: string;
    identifyExpiredDate?: Date | number | string;
    religion?: string; // Tôn giáo
    ethnicGroup?: string; // Dân tộc
    unionMember?: number; // Đoàn viên
    nation?: string; // Quốc gia
    //#endregion

    //#region Trình độ
    literacy?: string;
    literacyDetail?: string;
    specialize?: string;
    certificate?: string; // Tôn giáo
    //#endregion

    isSelected?: boolean;

    index?: number;
}
