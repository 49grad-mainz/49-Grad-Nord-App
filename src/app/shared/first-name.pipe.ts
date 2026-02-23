import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'firstName',
    standalone: true
})
export class FirstNamePipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (!value) {
            return '';
        }
        // Split by space and take the first part
        const parts = value.trim().split(/\s+/);
        return parts.length > 0 ? parts[0] : value;
    }
}
