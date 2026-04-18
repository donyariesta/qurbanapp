import { PageProps } from '@/types';
import { formatRupiah } from '@/lib/currency';
import { Head, Link, router } from '@inertiajs/react';

interface PublicReportProps extends Record<string, unknown> {
    years: number[];
    selectedYear: number | null;
    summary: {
        participant_count: number;
        qurban_count: number;
        total_cash: number | string;
    };
    participants: Array<{
        name: string;
        address: string;
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

export default function PublicReport({ auth, years, selectedYear, summary, participants, procurements }: PageProps<PublicReportProps>) {
    return (
        <>
            <Head title="Public Report" />

            <div className="min-h-screen bg-gray-100 py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Qurban Event Live Report</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Public event summary filtered by event year.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={selectedYear ?? ''}
                                onChange={(event) =>
                                    router.get(route('reports.index'), { year: event.target.value }, { preserveScroll: true, replace: true })
                                }
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {years.length === 0 ? (
                                    <option value="">No events available</option>
                                ) : (
                                    years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))
                                )}
                            </select>

                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                                    Admin Dashboard
                                </Link>
                            ) : (
                                <Link href={route('login')} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Number of Participation</p>
                            <p className="mt-2 text-3xl font-semibold text-gray-900">{summary.participant_count}</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Number of Qurban</p>
                            <p className="mt-2 text-3xl font-semibold text-gray-900">{summary.qurban_count}</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Total Cash</p>
                            <p className="mt-2 text-3xl font-semibold text-gray-900">{formatRupiah(summary.total_cash)}</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
                        <div className="mt-4 hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Address</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Qurban</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Paid</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Required</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {participants.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                                                No participant data for this event.
                                            </td>
                                        </tr>
                                    ) : (
                                        participants.map((participant) => (
                                            <tr key={`${participant.name}-${participant.linked_qurban}`}>
                                                <td className="px-4 py-3 text-sm text-gray-700">{participant.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{participant.address}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{participant.linked_qurban}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(participant.paid_amount)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(participant.required_amount)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            participant.payment_status === 'Paid'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                    >
                                                        {participant.payment_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 space-y-3 md:hidden">
                            {participants.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                    No participant data for this event.
                                </div>
                            ) : (
                                participants.map((participant) => (
                                    <div key={`${participant.name}-${participant.linked_qurban}`} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Name</span><span className="text-right">{participant.name}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Address</span><span className="text-right">{participant.address}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Qurban</span><span className="text-right">{participant.linked_qurban}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Paid</span><span className="text-right">{formatRupiah(participant.paid_amount)}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Required</span><span className="text-right">{formatRupiah(participant.required_amount)}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Status</span><span className="text-right">{participant.payment_status}</span></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Procurement Details</h2>
                        <div className="mt-4 hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {procurements.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                                                No procurement data for this event.
                                            </td>
                                        </tr>
                                    ) : (
                                        procurements.map((procurement) => (
                                            <tr key={`${procurement.item}-${procurement.total}`}>
                                                <td className="px-4 py-3 text-sm text-gray-700">{procurement.item}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(procurement.price)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{procurement.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(procurement.total)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{procurement.notes ?? '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 space-y-3 md:hidden">
                            {procurements.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                    No procurement data for this event.
                                </div>
                            ) : (
                                procurements.map((procurement) => (
                                    <div key={`${procurement.item}-${procurement.total}`} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Item</span><span className="text-right">{procurement.item}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Price</span><span className="text-right">{formatRupiah(procurement.price)}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Quantity</span><span className="text-right">{procurement.quantity}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Total</span><span className="text-right">{formatRupiah(procurement.total)}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Notes</span><span className="text-right">{procurement.notes ?? '-'}</span></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
