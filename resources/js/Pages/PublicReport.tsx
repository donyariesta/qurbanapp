import { useState } from 'react';
import { PageProps } from '@/types';
import { formatRupiah } from '@/lib/formator';
import { Head, Link, router } from '@inertiajs/react';
import QurbanBrand from '@/Components/QurbanBrand';
import ReportFooterArt from '@/Components/ReportFooterArt';

interface PublicReportProps extends Record<string, unknown> {
    years: number[];
    selectedYear: number | null;
    participantFilters: {
        participant_type: string;
        participant_qurban_number: string;
    };
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
}

function animalIcon(linked: string, type: string) {
    const t = `${linked} ${type}`.toLowerCase();
    if (t.includes('cow')) {
        return <i className="fa-solid fa-cow text-qurban-800" aria-hidden />;
    }
    if (t.includes('sheep')) {
        return <i className="fa-solid fa-sheep text-amber-700" aria-hidden />;
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

export default function PublicReport({ auth, years, selectedYear, participantFilters, summary, participants, procurements }: PageProps<PublicReportProps>) {
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
                            <h1 className="text-xl font-bold text-qurban-800 sm:text-2xl">Qurban Event Live Report</h1>
                            <p className="mt-1 text-sm text-gray-500">Public event summary filtered by event year.</p>
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
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                                    <i className="fa-solid fa-chevron-down text-xs" aria-hidden />
                                </span>
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
                        <h1 className="text-center text-lg font-bold text-qurban-800">Qurban Event Live Report</h1>
                        <p className="mt-1 text-center text-xs text-gray-500">Public event summary filtered by event year.</p>
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
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Number of participants</p>
                                    <p className="mt-1 text-3xl font-bold text-qurban-800">{summary.participant_count}</p>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Cow: {summary.participant_count_cow} | Sheep: {summary.participant_count_sheep}
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
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Number of qurban</p>
                                    <p className="mt-1 text-3xl font-bold text-qurban-800">{summary.qurban_count}</p>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Cow: {summary.qurban_count_cow} | Sheep: {summary.qurban_count_sheep}
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
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Cash summary</p>
                                    <p className="mt-2 text-sm text-gray-700">Received: {formatRupiah(summary.total_cash_received)}</p>
                                    <p className="text-sm text-gray-700">Spent: {formatRupiah(summary.total_spent)}</p>
                                    <p className="mt-2 text-sm font-bold text-qurban-800">Remaining: {formatRupiah(summary.remaining_cash)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <i className="fa-solid fa-users text-qurban-800" aria-hidden />
                                Participants
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
                                                    participant_qurban_number: participantFilters.participant_qurban_number,
                                                },
                                                { preserveScroll: true, replace: true },
                                            )
                                        }
                                        className="w-full cursor-pointer rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-qurban-600 focus:outline-none focus:ring-1 focus:ring-qurban-600"
                                    >
                                        <option value="">Filter by cow/sheep</option>
                                        <option value="Cow">Cow</option>
                                        <option value="Sheep">Sheep</option>
                                    </select>
                                </div>
                                <div className="relative min-w-0 flex-1 sm:min-w-[14rem]">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <i className="fa-solid fa-magnifying-glass text-sm" aria-hidden />
                                    </span>
                                    <input
                                        type="search"
                                        inputMode="numeric"
                                        value={participantFilters.participant_qurban_number}
                                        placeholder="Search by qurban number..."
                                        onChange={(event) =>
                                            router.get(
                                                route('reports.index'),
                                                {
                                                    year: selectedYear ?? '',
                                                    participant_type: participantFilters.participant_type,
                                                    participant_qurban_number: event.target.value,
                                                },
                                                { preserveScroll: true, replace: true },
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-qurban-600 focus:outline-none focus:ring-1 focus:ring-qurban-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Address</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Linked qurban</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Paid</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Required</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {participants.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                No participant data for this event.
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
                                    No participant data for this event.
                                </div>
                            ) : (
                                participants.map((participant, index) => (
                                    <div
                                        key={`${participant.name}-${participant.linked_qurban}-m-${index}`}
                                        className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                                            {animalIcon(participant.linked_qurban, participant.qurban_type)}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-gray-900">{participant.name}</p>
                                                <i className="fa-solid fa-chevron-right mt-1 text-xs text-gray-300" aria-hidden />
                                            </div>
                                            <p className="text-xs text-gray-500">{participant.linked_qurban}</p>
                                            <p className="text-sm font-semibold text-qurban-800">{formatRupiah(participant.required_amount)}</p>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                {statusBadge(participant.payment_status)}
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
                                Procurement details
                            </h2>
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {procurements.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No procurement data for this event.
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
                                    No procurement data for this event.
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
                                                    <span className="text-gray-500">Price</span>
                                                    <span className="text-right">{formatRupiah(procurement.price)}</span>
                                                    <span className="text-gray-500">Quantity</span>
                                                    <span className="text-right">{procurement.quantity}</span>
                                                    <span className="text-gray-500">Total</span>
                                                    <span className="text-right font-semibold text-qurban-800">{formatRupiah(procurement.total)}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">Notes: {procurement.notes ?? '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <ReportFooterArt />
            </div>
        </>
    );
}
