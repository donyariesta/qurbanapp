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
    qurbanOptions: Option[];
}

export default function SubmitterDetail({ auth, submitter, participants, qurbanOptions }: PageProps<SubmitterDetailProps>) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showingFormModal, setShowingFormModal] = useState(false);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        address: '',
        qurban_id: '',
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
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                            <h3 className="text-base font-semibold text-gray-900">Participants</h3>
                            <PrimaryButton type="button" onClick={openCreateModal}>
                                Add Participant
                            </PrimaryButton>
                        </div>
                        <div className="overflow-x-auto">
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
        </AuthenticatedLayout>
    );
}
