import { LanguageType } from '../../utilities/app-enum';

export enum IntroduceType {
    Post = 1, // Bài viết
    Leader = 2, // Lãnh đạo
    PaymentType = 3, // Phương thức thanh toán
    Warranty = 4, // Bảo hành
    Return = 5, // Đổi trả
    Support = 6, // Trung tâm hỗ trợ
    Transport = 7, // Vận chuyển
    Policy = 8, // Chính sách
}

export interface IntroduceModel {
    id?: number;
    title?: string;
    name?: string;
    type?: LanguageType;
    typeName?: string;
    content?: string;
    iframeYoutube?: string;
    introduceType?: IntroduceType;
    introduceTypeName?: string;
}
