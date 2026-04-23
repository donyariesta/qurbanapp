import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { formatRupiah } from '@/lib/formator';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

type Option = {
    value: number | string;
    label: string;
};

type Field = {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
    required?: boolean;
    defaultValue?: string | number;
    step?: string;
    options?: Option[];
    optionsKey?: string;
};

type Column = {
    key: string;
    label: string;
};

type RecordValue = string | number | null;

interface CrudPageProps extends Record<string, unknown> {
    title: string;
    singular: string;
    routeName: string;
    fields: Field[];
    columns: Column[];
    records: Array<Record<string, RecordValue>>;
    options: Record<string, Option[]>;
    detailRouteName?: string;
}

export default function CrudPage({
    auth,
    title,
    singular,
    routeName,
    fields,
    columns,
    records,
    options,
    detailRouteName,
}: PageProps<CrudPageProps>) {
    const emptyForm = useMemo(
        () =>
            fields.reduce<Record<string, string | number>>((carry, field) => {
                carry[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? 0 : '');
                return carry;
            }, {}),
        [fields],
    );

    const [editingId, setEditingId] = useState<number | null>(null);
    const formatValue = (columnKey: string, value: RecordValue) => {
        if (value === null) {
            return '-';
        }

        const currencyPattern = /(amount|price|total)/i;
        if (currencyPattern.test(columnKey)) {
            return formatRupiah(value);
        }

        return value;
    };

    const [showingFormModal, setShowingFormModal] = useState(false);
    const { data, setData, transform, post, put, processing, errors, reset } = useForm(emptyForm);

    const selectedLabelMap = useMemo(
        () =>
            Object.fromEntries(
                fields.map((field) => [
                    field.name,
                    field.options ?? (field.optionsKey ? options[field.optionsKey] ?? [] : []),
                ]),
            ),
        [fields, options],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]),
        );

        transform(() => payload);

        if (editingId) {
            put(route(`${routeName}.update`, editingId), {
                onSuccess: () => cancelEditing(),
            });
            return;
        }

        post(route(`${routeName}.store`), {
            onSuccess: () => {
                cancelEditing();
            },
        });
    };

    const startEditing = (record: Record<string, RecordValue>) => {
        setEditingId(Number(record.id));
        setShowingFormModal(true);

        fields.forEach((field) => {
            setData(field.name, (record[field.name] ?? '') as string | number);
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setShowingFormModal(false);
        reset();
        Object.entries(emptyForm).forEach(([key, value]) => {
            setData(key, value);
        });
    };

    const destroy = (id: number) => {
        if (!window.confirm(`Delete this ${singular.toLowerCase()}?`)) {
            return;
        }

        router.delete(route(`${routeName}.destroy`, id));
    };

    const openCreateModal = () => {
        setEditingId(null);
        setShowingFormModal(true);
        reset();
        Object.entries(emptyForm).forEach(([key, value]) => {
            setData(key, value);
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user!}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                            <p className="text-sm text-gray-600">
                                All management screens are restricted to logged-in users.
                            </p>
                            <PrimaryButton type="button" onClick={openCreateModal}>
                                Tambah {singular}
                            </PrimaryButton>
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {columns.map((column) => (
                                            <th
                                                key={column.key}
                                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                            >
                                                {column.label}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-sm text-gray-500">
                                                No records yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr key={String(record.id)}>
                                                {columns.map((column) => (
                                                    <td key={`${record.id}-${column.key}`} className="whitespace-pre-wrap px-4 py-3 text-sm text-gray-700">
                                                        {formatValue(column.key, record[column.key])}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex gap-3">
                                                        {detailRouteName && (
                                                            <Link
                                                                href={route(`${detailRouteName}.show`, Number(record.id))}
                                                                className="font-medium text-blue-600 hover:text-blue-800"
                                                            >
                                                                Detail
                                                            </Link>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(record)}
                                                            className="font-medium text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(Number(record.id))}
                                                            className="font-medium text-red-600 hover:text-red-800"
                                                        >
                                                            Hapus
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
                            {records.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                    No records yet.
                                </div>
                            ) : (
                                records.map((record) => (
                                    <div key={String(record.id)} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="space-y-2">
                                            {columns.map((column) => (
                                                <div key={`${record.id}-${column.key}`} className="flex items-start justify-between gap-3 text-sm">
                                                    <span className="font-medium text-gray-500">{column.label}</span>
                                                    <span className="text-right text-gray-800">{formatValue(column.key, record[column.key])}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-sm">
                                            {detailRouteName && (
                                                <Link
                                                    href={route(`${detailRouteName}.show`, Number(record.id))}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Detail
                                                </Link>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => startEditing(record)}
                                                className="font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => destroy(Number(record.id))}
                                                className="font-medium text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showingFormModal} onClose={cancelEditing} maxWidth="2xl">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {editingId ? `Edit ${singular}` : `Create ${singular}`}
                        </h3>
                        <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                        {fields.map((field) => {
                            const selectOptions = selectedLabelMap[field.name] ?? [];

                            return (
                                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={String(data[field.name] ?? '')}
                                            onChange={(event) => setData(field.name, event.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            rows={3}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            value={String(data[field.name] ?? '')}
                                            onChange={(event) => setData(field.name, event.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Select {field.label}</option>
                                            {selectOptions.map((option) => (
                                                <option key={`${field.name}-${option.value}`} value={String(option.value)}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === 'checkbox' ? (
                                        <label className="inline-flex items-center gap-2">
                                            <Checkbox
                                                checked={Boolean(Number(data[field.name] ?? 0))}
                                                onChange={(event) => setData(field.name, event.target.checked ? 1 : 0)}
                                            />
                                            <span className="text-sm text-gray-700">{field.label}</span>
                                        </label>
                                    ) : (
                                        <TextInput
                                            type={field.type}
                                            value={String(data[field.name] ?? '')}
                                            onChange={(event) => setData(field.name, event.target.value)}
                                            className="block w-full"
                                            step={field.step}
                                        />
                                    )}
                                    <InputError message={errors[field.name]} className="mt-2" />
                                </div>
                            );
                        })}

                        <div className="md:col-span-2">
                            <PrimaryButton disabled={processing}>
                                {editingId ? `Update ${singular}` : `Create ${singular}`}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
