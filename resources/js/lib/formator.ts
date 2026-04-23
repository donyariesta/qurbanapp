export function formatRupiah(value: number | string | null | undefined): string {
    const numeric = Number(value ?? 0);
    const safeNumber = Number.isFinite(numeric) ? numeric : 0;

    return `Rp. ${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(Math.round(safeNumber))}`;
}

export function formatQurban(type: string, value: number | string | null | undefined): string {
    if (type === 'Cow') {
        return `Sapi #${value}`;
    } else if (type === 'Sheep') {
        return `Domba #${value}`;
    }

    return `${type} #${value}`;
}
