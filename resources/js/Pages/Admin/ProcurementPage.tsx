import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { formatRupiah } from '@/lib/formator';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Payment = {
    id: number;
    amount: string;
    date_of_payment: string;
};

type Procurement = {
    id: number;
    item: string;
    price: string;
    quantity: number;
    notes: string | null;
    total_amount: number;
    paid_amount: number;
    outstanding_amount: number;
    payment_status: string;
    payments: Payment[];
};

interface ProcurementPageProps extends Record<string, unknown> {
    procurements: Procurement[];
}

export default function ProcurementPage({ auth, procurements }: PageProps<ProcurementPageProps>) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showingFormModal, setShowingFormModal] = useState(false);
    const [paymentProcurement, setPaymentProcurement] = useState<Procurement | null>(null);
    const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

    const procurementForm = useForm({
        item: '',
        price: '',
        quantity: '',
        notes: '',
        is_paid: false,
        date_of_payment: '',
    });

    const paymentForm = useForm({
        amount: '',
        date_of_payment: '',
    });

    const openCreateModal = () => {
        setEditingId(null);
        setShowingFormModal(true);
        procurementForm.setData({
            item: '',
            price: '',
            quantity: '',
            notes: '',
            is_paid: false,
            date_of_payment: '',
        });
        procurementForm.clearErrors();
    };

    const startEditing = (procurement: Procurement) => {
        setEditingId(procurement.id);
        setShowingFormModal(true);
        procurementForm.setData({
            item: procurement.item,
            price: String(procurement.price),
            quantity: String(procurement.quantity),
            notes: procurement.notes ?? '',
            is_paid: false,
            date_of_payment: '',
        });
        procurementForm.clearErrors();
    };

    const closeFormModal = () => {
        setEditingId(null);
        setShowingFormModal(false);
        procurementForm.reset();
        procurementForm.clearErrors();
    };

    const submitProcurement = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingId) {
            procurementForm.put(route('procurements.update', editingId), {
                onSuccess: closeFormModal,
            });
            return;
        }

        procurementForm.post(route('procurements.store'), {
            onSuccess: closeFormModal,
        });
    };

    const destroyProcurement = (procurementId: number) => {
        if (!window.confirm('Delete this procurement?')) {
            return;
        }

        router.delete(route('procurements.destroy', procurementId));
    };

    const openPaymentModal = (procurement: Procurement) => {
        setPaymentProcurement(procurement);
        setEditingPaymentId(null);
        paymentForm.setData({
            amount: '',
            date_of_payment: '',
        });
        paymentForm.clearErrors();
    };

    const closePaymentModal = () => {
        setPaymentProcurement(null);
        setEditingPaymentId(null);
        paymentForm.reset();
        paymentForm.clearErrors();
    };

    const startEditingPayment = (payment: Payment) => {
        setEditingPaymentId(payment.id);
        paymentForm.setData({
            amount: String(payment.amount),
            date_of_payment: payment.date_of_payment,
        });
        paymentForm.clearErrors();
    };

    const submitPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!paymentProcurement) return;

        if (editingPaymentId) {
            paymentForm.put(
                route('procurements.payments.update', {
                    procurement: paymentProcurement.id,
                    transaction: editingPaymentId,
                }),
                { onSuccess: closePaymentModal },
            );
            return;
        }

        paymentForm.post(route('procurements.payments.store', { procurement: paymentProcurement.id }), {
            onSuccess: closePaymentModal,
        });
    };

    const destroyPayment = (paymentId: number) => {
        if (!paymentProcurement || !window.confirm('Delete this payment?')) {
            return;
        }

        router.delete(
            route('procurements.payments.destroy', {
                procurement: paymentProcurement.id,
                transaction: paymentId,
            }),
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user!}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pembelanjaan</h2>}
        >
            <Head title="Procurements" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                            <p className="text-sm text-gray-600">Pencatatan Pembelanjaan.</p>
                            <PrimaryButton type="button" onClick={openCreateModal}>
                                Tambah Pembelanjaan
                            </PrimaryButton>
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Harga</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Catatan</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {procurements.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                                                Belum ada catatan pembelanjaan.
                                            </td>
                                        </tr>
                                    ) : (
                                        procurements.map((procurement) => (
                                            <tr key={procurement.id}>
                                                <td className="px-4 py-3 text-sm text-gray-700">{procurement.item}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(procurement.price)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{procurement.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(procurement.total_amount)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {procurement.outstanding_amount > 0
                                                        ? `Sisa ${formatRupiah(procurement.outstanding_amount)}`
                                                        : 'Paid'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{procurement.notes ?? '-'}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => openPaymentModal(procurement)}
                                                            className="font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            Pembayaran
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(procurement)}
                                                            className="font-medium text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroyProcurement(procurement.id)}
                                                            className="font-medium text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 p-4 md:hidden">
                            {procurements.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                    Belum ada catatan pembelanjaan.
                                </div>
                            ) : (
                                procurements.map((procurement) => (
                                    <div key={procurement.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Item</span><span className="text-right">{procurement.item}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Harga</span><span className="text-right">{formatRupiah(procurement.price)}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Jumlah</span><span className="text-right">{procurement.quantity}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Total</span><span className="text-right">{formatRupiah(procurement.total_amount)}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Status</span><span className="text-right">{procurement.outstanding_amount > 0 ? `Sisa ${formatRupiah(procurement.outstanding_amount)}` : 'Lunas'}</span></div>
                                            <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Catatan</span><span className="text-right">{procurement.notes ?? '-'}</span></div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-sm">
                                            <button type="button" onClick={() => openPaymentModal(procurement)} className="font-medium text-blue-600 hover:text-blue-800">Pembayaran</button>
                                            <button type="button" onClick={() => startEditing(procurement)} className="font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                                            <button type="button" onClick={() => destroyProcurement(procurement.id)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showingFormModal} onClose={closeFormModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Pembelanjaan' : 'Buat Pembelanjaan'}</h3>
                        <button
                            type="button"
                            onClick={closeFormModal}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={submitProcurement} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Item</label>
                            <TextInput value={procurementForm.data.item} onChange={(e) => procurementForm.setData('item', e.target.value)} className="block w-full" />
                            <InputError message={procurementForm.errors.item} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Harga</label>
                            <TextInput type="number" step="0.01" value={procurementForm.data.price} onChange={(e) => procurementForm.setData('price', e.target.value)} className="block w-full" />
                            <InputError message={procurementForm.errors.price} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah</label>
                            <TextInput type="number" value={procurementForm.data.quantity} onChange={(e) => procurementForm.setData('quantity', e.target.value)} className="block w-full" />
                            <InputError message={procurementForm.errors.quantity} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                            <textarea
                                value={procurementForm.data.notes}
                                onChange={(e) => procurementForm.setData('notes', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={3}
                            />
                            <InputError message={procurementForm.errors.notes} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            {!editingId && (
                                <div className="mb-4">
                                    <label className="inline-flex items-center gap-2">
                                        <Checkbox
                                            checked={procurementForm.data.is_paid}
                                            onChange={(e) => procurementForm.setData('is_paid', e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Lunas?</span>
                                    </label>
                                </div>
                            )}
                            {!editingId && procurementForm.data.is_paid && (
                                <div className="mb-4 max-w-sm">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Pembayaran</label>
                                    <TextInput
                                        type="date"
                                        value={procurementForm.data.date_of_payment}
                                        onChange={(e) => procurementForm.setData('date_of_payment', e.target.value)}
                                        className="block w-full"
                                    />
                                    <InputError message={procurementForm.errors.date_of_payment} className="mt-2" />
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <PrimaryButton disabled={procurementForm.processing}>
                                {editingId ? 'Update Pembelanjaan' : 'Buat Pembelanjaan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={!!paymentProcurement} onClose={closePaymentModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Procurement Payments {paymentProcurement ? `- ${paymentProcurement.item}` : ''}
                        </h3>
                        <button
                            type="button"
                            onClick={closePaymentModal}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            Close
                        </button>
                    </div>

                    <form onSubmit={submitPayment} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah</label>
                            <TextInput type="number" step="0.01" value={paymentForm.data.amount} onChange={(e) => paymentForm.setData('amount', e.target.value)} className="block w-full" />
                            <InputError message={paymentForm.errors.amount} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Pembayaran</label>
                            <TextInput type="date" value={paymentForm.data.date_of_payment} onChange={(e) => paymentForm.setData('date_of_payment', e.target.value)} className="block w-full" />
                            <InputError message={paymentForm.errors.date_of_payment} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <PrimaryButton disabled={paymentForm.processing}>
                                {editingPaymentId ? 'Update Pembayaran' : 'Add Pembayaran'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="mt-6 hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paymentProcurement?.payments.length ? (
                                    paymentProcurement.payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-4 py-3 text-sm text-gray-700">{formatRupiah(payment.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{payment.date_of_payment}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditingPayment(payment)}
                                                        className="font-medium text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroyPayment(payment.id)}
                                                        className="font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                                            Belum ada pembayaran untuk pembelanjaan ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 space-y-3 md:hidden">
                        {paymentProcurement?.payments.length ? (
                            paymentProcurement.payments.map((payment) => (
                                <div key={payment.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="font-medium text-gray-500">Jumlah</span><span>{formatRupiah(payment.amount)}</span></div>
                                        <div className="flex justify-between"><span className="font-medium text-gray-500">Tanggal</span><span>{payment.date_of_payment}</span></div>
                                    </div>
                                    <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3 text-sm">
                                        <button type="button" onClick={() => startEditingPayment(payment)} className="font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                                        <button type="button" onClick={() => destroyPayment(payment.id)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                Belum ada pembayaran untuk pembelanjaan ini.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
