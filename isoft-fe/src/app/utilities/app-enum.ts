export enum UserTaskStatus {
    OPENING = 0, // Đang mở
    DOING = 1, // Đang tiến hành
    PAUSE = 2, // Tạm hoãn
    COMPLETE = 3, // Hoàn thành
    REVIEWING = 4
}

export enum UserTaskRole {
    RESPONSIBLE = 1, // Người chịu trách nhiệm
    JOINED = 2, // Người tham gia
    VIEWER = 3, // Người quan sát
}

export enum LanguageType {
    ENGLISH = 1,
    VIETNAM = 2,
    KOREA = 3,
}

export enum SliderPosition {
    LARGE_SLIDER,
    SMALL_IMAGE,
    PRIORITY_IMAGE,
    SLIDE_ONE_PAGE,
    NEW_SLIDER
}

export enum CareerGroupType {
    Office = 1, // Khối văn phòng
    Sale = 2, //Khối bán hàng
}

export enum WorkingMethodType {
    FullTime = 1,
    PartTime = 2,
    Shift = 3,
}

export enum MenuType {
    MenuWeb = 5,
    MenuOnePage = 7,
}

export enum PermissionAction {
    Add = 1,
    Edit = 2,
    Delete = 3,
    View = 4,
}

export enum LookupValueScopes {
    ChartOfAccount_Classification = 'COA_CLASSIFICATION',
    ChartOfAccount_AccGroup = 'COA_ACC_GROUP',
}

export enum KPIScore {
    RevenueScore = 1,
    TimekeepingScore = 0,
}

export enum ResponseStatusCode {
    DataNull = 'DATA_NULL',
}

export enum CustomerType {
    Customer = 0,
    Supplier = 1,
    WebCustomer,
}

export enum BillStatus {
    Paid = 'Paid',
}

export enum PaymentType {
    Debt = 'CN',
    Cash = 'TM',
    Bank = 'NH',
}

export const DocumentCodeWithPaymentType = {
    CN: 'CN',
    TM: 'PC',
    NH: 'CH'
}

export enum BillType {
    NoBill = 'BSN',
    HasBill = 'BS',
    All = 'ALL',
    HT = 'HT',
    NB = 'NB',
    LT = 'LT',
}

export const BillTypeNumber = {
    ALL: 1,
    HT: 2,
    NB: 3,
    LT: 4
}

export enum DiscountTypeEnum {
    Percent = 'percent',
    Money = 'money',
}
