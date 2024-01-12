import { LanguageType } from '../../utilities/app-enum';

export interface SliderModel {
    id?: number;
    type?: LanguageType;
    name?: string;
    img?: string;
    createAt?: Date;
    adsensePosition?: number;
}

export interface SliderViewModel {
    id?: number;
    type?: LanguageType;
    typeName?: string;
    name?: string;
    image?: string | any;
    imageUrl?: string | any;
    createAt?: Date;
    adsensePosition?: number;
}
