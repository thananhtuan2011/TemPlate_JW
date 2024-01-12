import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'doubleInString',
})
export class DoubleInStringPipe implements PipeTransform {
    transform(number: number, fractionDegit = 3): string {
        if (number) {
            const [preNumberInString, postNumberInString] = number
                .toString()
                .split('.');
            let numberInString = '';
            if (preNumberInString.length <= fractionDegit) {
                numberInString = preNumberInString;
            } else {
                const modOfNumber = preNumberInString.length % fractionDegit;
                numberInString =
                    modOfNumber !== 0
                        ? preNumberInString.slice(0, modOfNumber) + ','
                        : '';

                let index = modOfNumber;
                while (index < preNumberInString.length) {
                    const endFraction = index + fractionDegit;
                    numberInString +=
                        preNumberInString.slice(index, endFraction) +
                        (endFraction < preNumberInString.length ? ',' : '');
                    index = endFraction;
                }
            }

            return postNumberInString
                ? numberInString + '.' + postNumberInString
                : numberInString;
        }
        return number === 0 ? '0' : '';
    }
}
