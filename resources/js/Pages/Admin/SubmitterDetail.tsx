import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type ParticipantRecord = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    address: string;
    qurban_id: number | null;
    qurban_label: string;
};

type Option = {
    value: number | string;
    label: string;
};

interface SubmitterDetailProps extends Record<string, unknown> {
    submitter: {
        id: number;
        name: string;
        address: string;
        phone_number: string;
    };
    participants: ParticipantRecord[];
    payments: Array<{
        id: number;
        amount: string;
        date_of_payment: string;
    }>;
    paymentSummary: {
        total_owed: string;
        total_paid: string;
    };
    qurbanOptions: Option[];
}

export default function SubmitterDetail({ auth, submitter, participants, payments, paymentSummary, qurbanOptions }: PageProps<SubmitterDetailProps>) {
    const [activeTab, setActiveTab] = useState<'participants' | 'payments'>('participants');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showingFormModal, setShowingFormModal] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
    const [showingPaymentModal, setShowingPaymentModal] = useState(false);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        address: '',
        qurban_id: '',
    });
    const paymentForm = useForm({
        amount: '',
        date_of_payment: '',
    });

    const openCreateModal = () => {
        setEditingId(null);
        setShowingFormModal(true);
        reset();
        setData({
            first_name: '',
            last_name: '',
            address: '',
            qurban_id: '',
        });
    };

    const startEditing = (participant: ParticipantRecord) => {
        setEditingId(participant.id);
        setShowingFormModal(true);
        setData({
            first_name: participant.first_name,
            last_name: participant.last_name,
            address: participant.address,
            qurban_id: participant.qurban_id ? String(participant.qurban_id) : '',
        });
    };

    const closeModal = () => {
        setShowingFormModal(false);
        setEditingId(null);
        reset();
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingId) {
            put(route('submitters.participants.update', { submitter: submitter.id, participant: editingId }), {
                onSuccess: () => closeModal(),
            });
            return;
        }

        post(route('submitters.participants.store', { submitter: submitter.id }), {
            onSuccess: () => closeModal(),
        });
    };

    const destroy = (participantId: number) => {
        if (!window.confirm('Delete this participant?')) {
            return;
        }

        router.delete(route('submitters.participants.destroy', { submitter: submitter.id, participant: participantId }));
    };

    const openCreatePaymentModal = () => {
        setEditingPaymentId(null);
        setShowingPaymentModal(true);
        paymentForm.setData({
            amount: '',
            date_of_payment: '',
        });
        paymentForm.clearErrors();
    };

    const startEditingPayment = (payment: { id: number; amount: string; date_of_payment: string }) => {
        setEditingPaymentId(payment.id);
        setShowingPaymentModal(true);
        paymentForm.setData({
            amount: String(payment.amount),
            date_of_payment: payment.date_of_payment,
        });
        paymentForm.clearErrors();
    };

    const closePaymentModal = () => {
        setEditingPaymentId(null);
        setShowingPaymentModal(false);
        paymentForm.reset();
        paymentForm.clearErrors();
    };

    const submitPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingPaymentId) {
            paymentForm.put(route('submitters.payments.update', { submitter: submitter.id, transaction: editingPaymentId }), {
                onSuccess: closePaymentModal,
            });
            return;
        }

        paymentForm.post(route('submitters.payments.store', { submitter: submitter.id }), {
            onSuccess: closePaymentModal,
        });
    };

    const destroyPayment = (paymentId: number) => {
        if (!window.confirm('Delete this payment?')) {
            return;
        }

        router.delete(route('submitters.payments.destroy', { submitter: submitter.id, transaction: paymentId }));
    };

    const totalOwed = Number(paymentSummary.total_owed || 0);
    const totalPaid = Number(paymentSummary.total_paid || 0);
    const outstanding = totalOwed - totalPaid;

    return (
        <AuthenticatedLayout
            user={auth.user!}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Submitter Detail</h2>}
        >
            <Head title={`Submitter - ${submitter.name}`} />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{submitter.name}</h3>
                                <p className="mt-1 text-sm text-gray-600">{submitter.address}</p>
                                <p className="text-sm text-gray-600">Phone: {submitter.phone_number}</p>
                            </div>
                            <Link href={route('submitters.index')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                                Back to Submitters
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-4 py-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('participants')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === 'participants' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Participants
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('payments')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === 'payments' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Payments
                                </button>
                            </div>
                        </div>
                        {activeTab === 'participants' ? (
                            <>
                                <div className="flex justify-end px-4 py-4">
                                    <PrimaryButton type="button" onClick={openCreateModal}>
                                        Add Participant
                                    </PrimaryButton>
                                </div>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Address</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Qurban</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {participants.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                                                        No participants yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                participants.map((participant) => (
                                                    <tr key={participant.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{participant.full_name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{participant.address}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{participant.qurban_label}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => startEditing(participant)}
                                                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => destroy(participant.id)}
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
                                    {participants.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                            No participants yet.
                                        </div>
                                    ) : (
                                        participants.map((participant) => (
                                            <div key={participant.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Name</span><span className="text-right">{participant.full_name}</span></div>
                                                    <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Address</span><span className="text-right">{participant.address}</span></div>
                                                    <div className="flex justify-between gap-3"><span className="font-medium text-gray-500">Qurban</span><span className="text-right">{participant.qurban_label}</span></div>
                                                </div>
                                                <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3 text-sm">
                                                    <button type="button" onClick={() => startEditing(participant)} className="font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                                                    <button type="button" onClick={() => destroy(participant.id)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 p-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-md bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Total Owed</p>
                                        <p className="mt-1 text-xl font-semibold text-gray-900">{totalOwed.toFixed(2)}</p>
                                    </div>
                                    <div className="rounded-md bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Total Paid</p>
                                        <p className="mt-1 text-xl font-semibold text-gray-900">{totalPaid.toFixed(2)}</p>
                                    </div>
                                    <div className="rounded-md bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Outstanding</p>
                                        <p className="mt-1 text-xl font-semibold text-gray-900">{outstanding.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <PrimaryButton type="button" onClick={openCreatePaymentModal}>
                                        Add Payment
                                    </PrimaryButton>
                                </div>

                                <div className="hidden overflow-x-auto md:block">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                                                        No payments yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.map((payment) => (
                                                    <tr key={payment.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{payment.amount}</td>
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
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {payments.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                            No payments yet.
                                        </div>
                                    ) : (
                                        payments.map((payment) => (
                                            <div key={payment.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between"><span className="font-medium text-gray-500">Amount</span><span>{payment.amount}</span></div>
                                                    <div className="flex justify-between"><span className="font-medium text-gray-500">Date</span><span>{payment.date_of_payment}</span></div>
                                                </div>
                                                <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3 text-sm">
                                                    <button type="button" onClick={() => startEditingPayment(payment)} className="font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                                                    <button type="button" onClick={() => destroyPayment(payment.id)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showingFormModal} onClose={closeModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Participant' : 'Create Participant'}</h3>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
                            <TextInput
                                value={data.first_name}
                                onChange={(event) => setData('first_name', event.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
                            <TextInput
                                value={data.last_name}
                                onChange={(event) => setData('last_name', event.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                value={data.address}
                                onChange={(event) => setData('address', event.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={3}
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Qurban</label>
                            <select
                                value={String(data.qurban_id)}
                                onChange={(event) => setData('qurban_id', event.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select Qurban</option>
                                {qurbanOptions.map((option) => (
                                    <option key={option.value} value={String(option.value)}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.qurban_id} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <PrimaryButton disabled={processing}>
                                {editingId ? 'Update Participant' : 'Create Participant'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showingPaymentModal} onClose={closePaymentModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{editingPaymentId ? 'Edit Payment' : 'Add Payment'}</h3>
                        <button
                            type="button"
                            onClick={closePaymentModal}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={submitPayment} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Amount Paid</label>
                            <TextInput
                                type="number"
                                step="0.01"
                                value={paymentForm.data.amount}
                                onChange={(event) => paymentForm.setData('amount', event.target.value)}
                                className="block w-full"
                            />
                            <InputError message={paymentForm.errors.amount} className="mt-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Payment</label>
                            <TextInput
                                type="date"
                                value={paymentForm.data.date_of_payment}
                                onChange={(event) => paymentForm.setData('date_of_payment', event.target.value)}
                                className="block w-full"
                            />
                            <InputError message={paymentForm.errors.date_of_payment} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <PrimaryButton disabled={paymentForm.processing}>
                                {editingPaymentId ? 'Update Payment' : 'Add Payment'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
