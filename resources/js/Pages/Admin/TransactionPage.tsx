import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/formator';
import { PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Option = { value: number | string; label: string };

type RecordRow = {
    id: number;
    amount: string | number;
    date_of_payment: string;
    reference_type: string | null;
    reference_id: number | null;
    reference_label: string;
};

interface TransactionPageProps extends Record<string, unknown> {
    filters: {
        submitter_id: string;
        procurement_id: string;
        payment_from: string;
        payment_to: string;
        cash_flow: 'all' | 'cash_in' | 'cash_out';
        per_page: string;
    };
    submitterOptions: Option[];
    procurementOptions: Option[];
    records: RecordRow[];
}

export default function TransactionPage({ auth, filters, submitterOptions, procurementOptions, records }: PageProps<TransactionPageProps>) {
    const [filterForm, setFilterForm] = useState(filters);
    const [showingSubmitterModal, setShowingSubmitterModal] = useState(false);
    const [showingProcurementModal, setShowingProcurementModal] = useState(false);
    const [showingGeneralModal, setShowingGeneralModal] = useState(false);
    const submitterPaymentForm = useForm({
        transaction_option: 'submitter_payment',
        amount: '',
        date_of_payment: '',
        submitter_id: '',
    });
    const procurementPaymentForm = useForm({
        transaction_option: 'procurement_payment',
        amount: '',
        date_of_payment: '',
        procurement_id: '',
    });
    const generalForm = useForm({
        transaction_option: 'general',
        notes: '',
        amount: '',
        date_of_payment: '',
        type: 'in' as 'in' | 'out',
    });

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(route('transactions.index'), filterForm, { preserveState: true, replace: true });
    };

    const submitGeneralPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        generalForm.post(route('transactions.store'), {
            onSuccess: () => {
                generalForm.reset()
                generalForm.setData('type', 'in');
                setShowingGeneralModal(false);
            },
        });
    };
    const submitSubmitterPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitterPaymentForm.post(route('transactions.store'), {
            onSuccess: () => {
                submitterPaymentForm.reset();
                submitterPaymentForm.setData('transaction_option', 'submitter_payment');
                setShowingSubmitterModal(false);
            },
        });
    };
    const submitProcurementPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        procurementPaymentForm.post(route('transactions.store'), {
            onSuccess: () => {
                procurementPaymentForm.reset();
                procurementPaymentForm.setData('transaction_option', 'procurement_payment');
                setShowingProcurementModal(false);
            },
        });
    };

    const destroy = (id: number) => {
        if (!window.confirm('Delete this transaction?')) {
            return;
        }

        router.delete(route('transactions.destroy', id));
    };

    return (
        <AuthenticatedLayout user={auth.user!} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Transactions</h2>}>
            <Head title="Transactions" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setShowingSubmitterModal(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Setoran Peserta
                            </button>
                            <button type="button" onClick={() => setShowingProcurementModal(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Pembayaran Pembelanjaan
                            </button>
                            <button type="button" onClick={() => setShowingGeneralModal(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Input Transaksi Lain
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submitFilters} className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Peserta</label>
                                <select value={filterForm.submitter_id} onChange={(e) => setFilterForm((prev) => ({ ...prev, submitter_id: e.target.value }))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="">Semua</option>
                                    {submitterOptions.map((option) => (
                                        <option key={`submitter-${option.value}`} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Pembelanjaan</label>
                                <select value={filterForm.procurement_id} onChange={(e) => setFilterForm((prev) => ({ ...prev, procurement_id: e.target.value }))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="">Semua</option>
                                    {procurementOptions.map((option) => (
                                        <option key={`procurement-${option.value}`} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Transaksi</label>
                                <select value={filterForm.cash_flow} onChange={(e) => setFilterForm((prev) => ({ ...prev, cash_flow: e.target.value as 'all' | 'cash_in' | 'cash_out' }))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="all">Semua</option>
                                    <option value="cash_in">Masuk</option>
                                    <option value="cash_out">Keluar</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Transaksi Sejak</label>
                                <TextInput type="date" className="block w-full" value={filterForm.payment_from} onChange={(e) => setFilterForm((prev) => ({ ...prev, payment_from: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Transaksi Hingga</label>
                                <TextInput type="date" className="block w-full" value={filterForm.payment_to} onChange={(e) => setFilterForm((prev) => ({ ...prev, payment_to: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Banyak Baris Data</label>
                                <select value={filterForm.per_page} onChange={(e) => setFilterForm((prev) => ({ ...prev, per_page: e.target.value }))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {[50, 100, 500, 1000, 2000].map((size) => (
                                        <option key={size} value={String(size)}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <PrimaryButton>Apply Filters</PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reference</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr key={record.id}>
                                                <td className={`px-4 py-3 text-sm ${Number(record.amount) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatRupiah(record.amount)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{record.date_of_payment}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{record.reference_label}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button type="button" onClick={() => destroy(record.id)} className="font-medium text-red-600 hover:text-red-800">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showingSubmitterModal} onClose={() => setShowingSubmitterModal(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Setoran Peserta</h3>
                    <form onSubmit={submitSubmitterPayment} className="mt-4 grid gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Submitter</label>
                            <select value={submitterPaymentForm.data.submitter_id} onChange={(e) => submitterPaymentForm.setData('submitter_id', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="">Select submitter</option>
                                {submitterOptions.map((option) => (
                                    <option key={`submitter-modal-${option.value}`} value={String(option.value)}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={submitterPaymentForm.errors.submitter_id} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
                            <TextInput type="number" step="0.01" min="0" className="block w-full" value={submitterPaymentForm.data.amount} onChange={(e) => submitterPaymentForm.setData('amount', e.target.value)} />
                            <InputError message={submitterPaymentForm.errors.amount} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Payment</label>
                            <TextInput type="date" className="block w-full" value={submitterPaymentForm.data.date_of_payment} onChange={(e) => submitterPaymentForm.setData('date_of_payment', e.target.value)} />
                            <InputError message={submitterPaymentForm.errors.date_of_payment} className="mt-2" />
                        </div>
                        <PrimaryButton disabled={submitterPaymentForm.processing}>Save</PrimaryButton>
                    </form>
                </div>
            </Modal>

            <Modal show={showingProcurementModal} onClose={() => setShowingProcurementModal(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Pembayaran Pembelanjaan</h3>
                    <form onSubmit={submitProcurementPayment} className="mt-4 grid gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Procurement</label>
                            <select value={procurementPaymentForm.data.procurement_id} onChange={(e) => procurementPaymentForm.setData('procurement_id', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="">Select procurement</option>
                                {procurementOptions.map((option) => (
                                    <option key={`procurement-modal-${option.value}`} value={String(option.value)}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={procurementPaymentForm.errors.procurement_id} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
                            <TextInput type="number" step="0.01" min="0" className="block w-full" value={procurementPaymentForm.data.amount} onChange={(e) => procurementPaymentForm.setData('amount', e.target.value)} />
                            <InputError message={procurementPaymentForm.errors.amount} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Payment</label>
                            <TextInput type="date" className="block w-full" value={procurementPaymentForm.data.date_of_payment} onChange={(e) => procurementPaymentForm.setData('date_of_payment', e.target.value)} />
                            <InputError message={procurementPaymentForm.errors.date_of_payment} className="mt-2" />
                        </div>
                        <PrimaryButton disabled={procurementPaymentForm.processing}>Save</PrimaryButton>
                    </form>
                </div>
            </Modal>
            <Modal show={showingGeneralModal} onClose={() => setShowingGeneralModal(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Input Transaksi Lain</h3>
                    <form onSubmit={submitGeneralPayment} className="mt-4 grid gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                            <TextInput type="text" className="block w-full" value={generalForm.data.notes} onChange={(e) => generalForm.setData('notes', e.target.value)} />
                            <InputError message={generalForm.errors.notes} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
                            <TextInput type="number" step="0.01" min="0" className="block w-full" value={generalForm.data.amount} onChange={(e) => generalForm.setData('amount', e.target.value)} />
                            <InputError message={generalForm.errors.amount} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Tipe</label>
                            <div className="flex gap-3">
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${generalForm.data.type === 'in' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => generalForm.setData('type', 'in')}>Masuk</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${generalForm.data.type === 'out' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => generalForm.setData('type', 'out')}>Keluar</button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Payment</label>
                            <TextInput type="date" className="block w-full" value={generalForm.data.date_of_payment} onChange={(e) => generalForm.setData('date_of_payment', e.target.value)} />
                            <InputError message={generalForm.errors.date_of_payment} className="mt-2" />
                        </div>

                        <PrimaryButton disabled={generalForm.processing}>Save</PrimaryButton>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
