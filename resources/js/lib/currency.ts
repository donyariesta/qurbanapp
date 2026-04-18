export function formatRupiah(value: number | string | null | undefined): string {
    const numeric = Number(value ?? 0);
    const safeNumber = Number.isFinite(numeric) ? numeric : 0;

    return `Rp. ${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(Math.round(safeNumber))}`;
}
