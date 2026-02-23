export function isSameDay(date1: Date | string | number | null | undefined, date2: Date | string | number | null | undefined): boolean {
    if (!date1 || !date2) {
        return false;
    }
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}
