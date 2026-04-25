import { useState } from 'react';
import { PageProps } from '@/types';
import { formatRupiah } from '@/lib/formator';
import { Head, Link, router } from '@inertiajs/react';
import QurbanBrand from '@/Components/QurbanBrand';
import {Icon } from '@/Components/Icon';
import ReportFooterArt from '@/Components/ReportFooterArt';

interface PublicReportProps extends Record<string, unknown> {
    years: number[];
    selectedYear: number | null;
    participantFilters: {
        participant_type: string;
        participant_qurban_id: string;
    };
    participantQurbanOptions: Array<{
        value: string;
        label: string;
    }>;
    summary: {
        participant_count: number;
        qurban_count: number;
        participant_count_cow: number;
        participant_count_sheep: number;
        qurban_count_cow: number;
        qurban_count_sheep: number;
        total_cash_received: number | string;
        total_spent: number | string;
        remaining_cash: number | string;
    };
    participants: Array<{
        name: string;
        address: string;
        qurban_type: string;
        qurban_number: number;
        linked_qurban: string;
        required_amount: string;
        paid_amount: string;
        payment_status: string;
    }>;
    procurements: Array<{
        item: string;
        price: string;
        quantity: number;
        notes: string | null;
        total: string;
    }>;
    showMeatYieldSummary: boolean;
    meatYieldSummary: {
        cows: { effective_total: number; two_third_total: number; two_third_portion_per_pax: number };
        sheeps: { effective_total: number; two_third_total: number; two_third_portion_per_pax: number };
        total_pax_distribution: number;
    } | null;
}

function animalIcon(linked: string, type: string) {
    const t = `${linked} ${type}`.toLowerCase();
    if (t.includes('cow')) {
        return <Icon name="cow" width={20} height={20} className="text-emerald-700" aria-hidden />;
    }
    if (t.includes('sheep')) {
        return <Icon name="sheep" width={20} height={20} className="text-amber-700" aria-hidden />;
    }
    return <i className="fa-solid fa-paw text-gray-500" aria-hidden />;
}

function statusBadge(status: string) {
    const paid = status === 'Paid';
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
            }`}
        >
            <i className={`fa-regular ${paid ? 'fa-circle-check' : 'fa-clock'}`} aria-hidden />
            {status}
        </span>
    );
}

export default function PublicReport({ auth, years, selectedYear, participantFilters, participantQurbanOptions, summary, participants, procurements, showMeatYieldSummary, meatYieldSummary }: PageProps<PublicReportProps>) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Public Report" />

            <div className="relative min-h-screen bg-[#f9fafb] pb-28">
                <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                        <div className="flex items-center justify-between gap-3 lg:justify-start">
                            <QurbanBrand href={route('reports.index')} imgClassName="h-9 w-auto sm:h-10" />
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((o) => !o)}
                                className="rounded-lg p-2 text-qurban-800 hover:bg-emerald-50 lg:hidden"
                                aria-expanded={mobileMenuOpen}
                                aria-label="Toggle filters and actions"
                            >
                                <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} aria-hidden />
                            </button>
                        </div>
                        <div className="hidden flex-1 text-center lg:block lg:px-4">
                            <h1 className="text-xl font-bold text-qurban-800 sm:text-2xl">Laporan Pelaksanaan Qurban</h1>
                            <p className="mt-1 text-sm text-gray-500">Ringkasan pelaksanaan berdasarkan tahun {selectedYear}.</p>
                        </div>
                        <div className="hidden flex-wrap items-center justify-center gap-3 lg:flex lg:justify-end">
                            <div className="relative min-w-[8.5rem]">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <i className="fa-solid fa-calendar-day" aria-hidden />
                                </span>
                                <select
                                    value={selectedYear ?? ''}
                                    onChange={(event) =>
                                        router.get(route('reports.index'), { year: event.target.value }, { preserveScroll: true, replace: true })
                                    }
                                    className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-gray-800 shadow-sm focus:border-qurban-600 focus:outline-none focus:ring-1 focus:ring-qurban-600"
                                >
                                    {years.length === 0 ? (
                                        <option value="">No events</option>
                                    ) : (
                                        years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-qurban-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-qurban-900"
                                >
                                    <i className="fa-solid fa-user-shield" aria-hidden />
                                    Admin dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-qurban-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-qurban-900"
                                >
                                    <i className="fa-solid fa-right-to-bracket" aria-hidden />
                                    Log in
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-3 lg:hidden">
                        <h1 className="text-center text-lg font-bold text-qurban-800">Laporan Pelaksanaan Qurban</h1>
                        <p className="mt-1 text-center text-xs text-gray-500">Ringkasan pelaksanaan berdasarkan tahun {selectedYear}.</p>
                    </div>
                    {mobileMenuOpen ? (
                        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 lg:hidden">
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <i className="fa-solid fa-calendar-day" aria-hidden />
                                </span>
                                <select
                                    value={selectedYear ?? ''}
                                    onChange={(event) =>
                                        router.get(route('reports.index'), { year: event.target.value }, { preserveScroll: true, replace: true })
                                    }
                                    className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-medium focus:border-qurban-600 focus:outline-none focus:ring-1 focus:ring-qurban-600"
                                >
                                    {years.length === 0 ? (
                                        <option value="">No events</option>
                                    ) : (
                                        years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-qurban-800 px-4 py-2.5 text-sm font-semibold text-white"
                                >
                                    <i className="fa-solid fa-user-shield" aria-hidden />
                                    Admin dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-qurban-800 px-4 py-2.5 text-sm font-semibold text-white"
                                >
                                    <i className="fa-solid fa-right-to-bracket" aria-hidden />
                                    Log in
                                </Link>
                            )}
                        </div>
                    ) : null}
                </header>

                <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-emerald-100/80 bg-emerald-50/90 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-qurban-800 shadow-sm ring-1 ring-emerald-100">
                                    <i className="fa-solid fa-users" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Jumlah Peserta</p>
                                    <p className="mt-1 text-3xl font-bold text-qurban-800">{summary.participant_count}</p>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Sapi: {summary.participant_count_cow} | Domba: {summary.participant_count_sheep}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-amber-100/80 bg-cream-100 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-amber-800 shadow-sm ring-1 ring-amber-100">
                                    <i className="fa-solid fa-cow" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Jumlah Hewan Qurban</p>
                                    <p className="mt-1 text-3xl font-bold text-qurban-800">{summary.qurban_count}</p>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Sapi: {summary.qurban_count_cow} | Domba: {summary.qurban_count_sheep}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-teal-100/80 bg-report-teal p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-qurban-800 shadow-sm ring-1 ring-teal-100">
                                    <i className="fa-solid fa-wallet" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Ringkasan Keuangan</p>
                                    <p className="mt-2 text-sm text-gray-700">Diterima: {formatRupiah(summary.total_cash_received)}</p>
                                    <p className="text-sm text-gray-700">Dibelanjakan: {formatRupiah(summary.total_spent)}</p>
                                    <p className="mt-2 text-sm font-bold text-qurban-800">Saldo sisa: {formatRupiah(summary.remaining_cash)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <i className="fa-solid fa-users text-qurban-800" aria-hidden />
                                Peserta
                            </h2>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-[10rem]">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <i className="fa-solid fa-filter text-xs" aria-hidden />
                                    </span>
                                    <select
                                        value={participantFilters.participant_type}
                                        onChange={(event) =>
                                            router.get(
                                                route('reports.index'),
                                                {
                                                    year: selectedYear ?? '',
                                                    participant_type: event.target.value,
                                                    participant_qurban_id: participantFilters.participant_qurban_id,
                                                },
                                                { preserveScroll: true, replace: true },
                                            )
                                        }
                                        className="w-full cursor-pointer rounded-lg border border-gray-200 py-2 pl-9 pr-7 text-sm focus:border-qurban-600 focus:outline-none focus:ring-1 focus:ring-qurban-600"
                                    >
                                        <option value="">Filter Hewan Qurban</option>
                                        <option value="Cow">Sapi</option>
                                        <option value="Sheep">Domba</option>
                                    </select>
                                </div>
                                <div className="relative min-w-0 flex-1 sm:min-w-[14rem]">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <i className="fa-solid fa-list text-sm" aria-hidden />
                                    </span>
                                    <select
                                        value={participantFilters.participant_qurban_id}
                                        onChange={(event) =>
                                            router.get(
                                                route('reports.index'),
                                                {
                                                    year: selectedYear ?? '',
                                                    participant_type: participantFilters.participant_type,
                                                    participant_qurban_id: event.target.value,
                                                },
                                                { preserveScroll: true, replace: true },
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-qurban-600 focus:outline-none focus:ring-1 focus:ring-qurban-600"
                                    >
                                        <option value="">Filter Nomor Qurban</option>
                                        {participantQurbanOptions.map((option) => (
                                            <option key={option.label} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        window.open(
                                            route('reports.index', {
                                                year: selectedYear ?? '',
                                                participant_type: participantFilters.participant_type,
                                                participant_qurban_id: participantFilters.participant_qurban_id,
                                                download_participants_csv: 1,
                                            }),
                                            '_blank',
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <i className="fa-solid fa-file-csv" aria-hidden />
                                    Download CSV
                                </button>
                            </div>
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Alamat</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Hewan Qurban</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Dibayarkan</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tagihan</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {participants.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                Belum ada peserta.
                                            </td>
                                        </tr>
                                    ) : (
                                        participants.map((participant, index) => (
                                            <tr key={`${participant.name}-${participant.linked_qurban}-${index}`} className="hover:bg-gray-50/80">
                                                <td className="whitespace-nowrap px-4 py-3 text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{participant.name}</td>
                                                <td className="max-w-xs truncate px-4 py-3 text-gray-600">{participant.address}</td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    <span className="inline-flex items-center gap-2">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                                            {animalIcon(participant.linked_qurban, participant.qurban_type)}
                                                        </span>
                                                        {participant.linked_qurban}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatRupiah(participant.paid_amount)}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatRupiah(participant.required_amount)}</td>
                                                <td className="px-4 py-3">{statusBadge(participant.payment_status)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 p-4 md:hidden">
                            {participants.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
                                    Belum ada peserta.
                                </div>
                            ) : (
                                participants.map((participant, index) => (
                                    <div
                                        key={`${participant.name}-${participant.linked_qurban}-m-${index}`}
                                        className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                                            {animalIcon(participant.linked_qurban, participant.qurban_type)}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="">
                                                <p className="text-xs text-gray-500">{participant.linked_qurban}</p>
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-gray-900">{participant.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-qurban-800">{formatRupiah(participant.required_amount)}</p>
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    {statusBadge(participant.payment_status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <i className="fa-solid fa-cart-shopping text-qurban-800" aria-hidden />
                                Detil Pembelanjaan
                            </h2>
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Harga</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {procurements.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                Belum ada pembelanjaan.
                                            </td>
                                        </tr>
                                    ) : (
                                        procurements.map((procurement) => (
                                            <tr key={`${procurement.item}-${procurement.total}`} className="hover:bg-gray-50/80">
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-2 font-medium text-gray-900">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-qurban-800">
                                                            <i className="fa-solid fa-bag-shopping text-sm" aria-hidden />
                                                        </span>
                                                        {procurement.item}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">{formatRupiah(procurement.price)}</td>
                                                <td className="px-4 py-3 text-gray-700">{procurement.quantity}</td>
                                                <td className="px-4 py-3 text-gray-700">{formatRupiah(procurement.total)}</td>
                                                <td className="max-w-xs truncate px-4 py-3 text-gray-600">{procurement.notes ?? '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="space-y-3 p-4 md:hidden">
                            {procurements.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
                                    Belum ada pembelanjaan.
                                </div>
                            ) : (
                                procurements.map((procurement) => (
                                    <div
                                        key={`${procurement.item}-${procurement.total}-m`}
                                        className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-qurban-800">
                                                <i className="fa-solid fa-basket-shopping" aria-hidden />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-2 text-sm text-gray-700">
                                                <p className="font-semibold text-gray-900">{procurement.item}</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <span className="text-gray-500">Harga</span>
                                                    <span className="text-right">{formatRupiah(procurement.price)}</span>
                                                    <span className="text-gray-500">Jumlah</span>
                                                    <span className="text-right">{procurement.quantity}</span>
                                                    <span className="text-gray-500">Total</span>
                                                    <span className="text-right font-semibold text-qurban-800">{formatRupiah(procurement.total)}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">Catatan: {procurement.notes ?? '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {showMeatYieldSummary && meatYieldSummary ? (
                        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
                            <div className="border-b border-gray-100 p-4 sm:p-5">
                                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <i className="fa-solid fa-weight-hanging text-qurban-800" aria-hidden />
                                    Ringkasan Hasil Daging
                                </h2>
                            </div>
                            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900">Sapi</p>
                                    <p className="mt-2">Total efektif: {meatYieldSummary.cows.effective_total} kg</p>
                                    <p>2/3 total: {meatYieldSummary.cows.two_third_total} kg</p>
                                    <p>Per pax ({meatYieldSummary.total_pax_distribution} pax): {meatYieldSummary.cows.two_third_portion_per_pax} kg</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900">Domba</p>
                                    <p className="mt-2">Total efektif: {meatYieldSummary.sheeps.effective_total} kg</p>
                                    <p>2/3 total: {meatYieldSummary.sheeps.two_third_total} kg</p>
                                    <p>Per pax ({meatYieldSummary.total_pax_distribution} pax): {meatYieldSummary.sheeps.two_third_portion_per_pax} kg</p>
                                </div>
                            </div>
                        </section>
                    ) : null}
                </div>

                <ReportFooterArt />
            </div>
        </>
    );
}
