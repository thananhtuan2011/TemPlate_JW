import { NgModule } from '@angular/core';
import { DoubleInStringPipe } from './double-in-string.pipe';

@NgModule({
    declarations: [DoubleInStringPipe],
    providers: [DoubleInStringPipe],
    exports: [DoubleInStringPipe],
})
export class PipesModule {}
