import { LanguageType } from '../../utilities/app-enum';

export interface NewsModel {
    id?: number;
    title?: string;
    shortContent?: string;
    type?: LanguageType;
    image?: string | any;
    imageUrl?: string | any;
    content?: string;
    createAt?: Date;
}
