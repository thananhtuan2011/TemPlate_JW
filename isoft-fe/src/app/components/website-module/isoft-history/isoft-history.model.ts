import { LanguageType } from '../../../utilities/app-enum';
import { IntroduceType } from '../../../models/web-setting/introduce.model';

export enum ClassName {
    Six = 'six',
    Seven = 'seven',
    Eight = 'eight',
    Nine = 'Nine',
}

export interface IsoftHistoryModel {
    id?: number;
    title?: string;
    name?: string;
    className?: ClassName;
    classNameStr?: string;
    content?: string;
    createAt?: Date;
    order?: number;
}
