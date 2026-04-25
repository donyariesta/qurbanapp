import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { PageProps } from '@/types';

type AuditLog = {
    audit_log_id: number;
    user: string;
    event_timestamp: string;
    event_type: string;
    record_id: string | null;
    record_table: string;
    ip_address: string | null;
    user_agent: string | null;
    new_value: Record<string, unknown> | null;
    old_value: Record<string, unknown> | null;
};

interface AuditLogPageProps extends Record<string, unknown> {
    filters: {
        from_date: string;
        to_date: string;
        user_id: string;
        record_id: string;
        ip_address: string;
        user_agent: string;
        per_page: string;
    };
    users: Array<{ value: string; label: string }>;
    logs: AuditLog[];
}

export default function AuditLogPage({ auth, filters, users, logs }: PageProps<AuditLogPageProps>) {
    const [form, setForm] = useState(filters);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(route('audit-logs.index'), form, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user!}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Audit Logs</h2>}
        >
            <Head title="Audit Logs" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
                                <TextInput type="date" className="block w-full" value={form.from_date} onChange={(e) => setForm((prev) => ({ ...prev, from_date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
                                <TextInput type="date" className="block w-full" value={form.to_date} onChange={(e) => setForm((prev) => ({ ...prev, to_date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">User</label>
                                <select value={form.user_id} onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="">All users</option>
                                    {users.map((user) => (
                                        <option key={user.value} value={user.value}>
                                            {user.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Related ID</label>
                                <TextInput className="block w-full" value={form.record_id} onChange={(e) => setForm((prev) => ({ ...prev, record_id: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">IP</label>
                                <TextInput className="block w-full" value={form.ip_address} onChange={(e) => setForm((prev) => ({ ...prev, ip_address: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">User Agent</label>
                                <TextInput className="block w-full" value={form.user_agent} onChange={(e) => setForm((prev) => ({ ...prev, user_agent: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Rows</label>
                                <select value={form.per_page} onChange={(e) => setForm((prev) => ({ ...prev, per_page: e.target.value }))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {[50, 100, 500, 1000, 2000].map((size) => (
                                        <option key={size} value={String(size)}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <PrimaryButton>Filter Logs</PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Event</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Record</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">IP</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User Agent</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Old Value</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">New Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
                                                No audit logs found for the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.audit_log_id}>
                                                <td className="px-4 py-3 text-sm text-gray-700">{log.audit_log_id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{log.event_timestamp}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{log.user}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 uppercase">{log.event_type}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{log.record_table}#{log.record_id ?? '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{log.ip_address ?? '-'}</td>
                                                <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-700" title={log.user_agent ?? ''}>{log.user_agent ?? '-'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700">{log.old_value ? JSON.stringify(log.old_value) : '-'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700">{log.new_value ? JSON.stringify(log.new_value) : '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
