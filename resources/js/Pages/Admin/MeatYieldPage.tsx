import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useMemo, useState } from 'react';

type QurbanYield = {
    qurban_id: number;
    qurban_number: number;
    qurban_type: 'Cow' | 'Sheep';
    participant_count: number;
    gross_total: number;
    net_total: number;
    effective_total: number;
    one_third: number;
    portion_per_participant: number | null;
    details: Array<{
        meat_yield_id: number;
        weighing_sequence: number;
        weigh: number;
        status: 'gross' | 'net';
        created_at: string;
    }>;
};

interface MeatYieldPageProps extends Record<string, unknown> {
    summary: {
        cows?: {
            gross_total: number;
            net_total: number;
            distribution_two_thirds: number;
            portion_per_pax: number;
            participant_one_third_total: number;
            participant_portion: number | null;
        };
        sheeps?: {
            gross_total: number;
            net_total: number;
            distribution_rows: Array<{
                qurban_number: number;
                distribution_two_thirds: number;
                portion_per_pax: number;
            }>;
        };
    };
    qurbans: QurbanYield[];
    config: {
        accumulate_cows_yield_meat: boolean;
        total_pax_distribution: number;
    };
}

export default function MeatYieldPage({ auth, summary, qurbans, config }: PageProps<MeatYieldPageProps>) {
    const [tab, setTab] = useState<'summary' | 'weighing' | 'config'>('summary');
    const [activeQurban, setActiveQurban] = useState<QurbanYield | null>(null);
    const [detailQurban, setDetailQurban] = useState<QurbanYield | null>(null);
    const weighingForm = useForm({
        weigh: '',
        status: 'net' as 'gross' | 'net',
    });
    const configForm = useForm({
        accumulate_cows_yield_meat: config.accumulate_cows_yield_meat,
        total_pax_distribution: String(config.total_pax_distribution ?? 1),
    });

    const sortedQurbans = useMemo(() => [...qurbans].sort((a, b) => a.qurban_number - b.qurban_number), [qurbans]);

    return (
        <AuthenticatedLayout user={auth.user!} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Meat Yield</h2>}>
            <Head title="Meat Yield" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex gap-2">
                            {(['summary', 'weighing', 'config'] as const).map((item) => (
                                <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === item ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    {item[0].toUpperCase() + item.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {tab === 'summary' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900">Cows</h3>
                                    <p className="mt-2 text-sm text-gray-700">Gross: {summary.cows?.gross_total ?? 0}</p>
                                    <p className="text-sm text-gray-700">Net: {summary.cows?.net_total ?? 0}</p>
                                    <p className="text-sm text-gray-700">2/3 Distribution: {summary.cows?.distribution_two_thirds ?? 0}</p>
                                    <p className="text-sm text-gray-700">Portion per pax: {summary.cows?.portion_per_pax ?? 0}</p>
                                    {config.accumulate_cows_yield_meat && (
                                        <>
                                            <p className="text-sm text-gray-700">1/3 Participants total: {summary.cows?.participant_one_third_total ?? 0}</p>
                                            <p className="text-sm text-gray-700">1/3 Portion per participant: {summary.cows?.participant_portion ?? 0}</p>
                                        </>
                                    )}
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900">Sheeps</h3>
                                    <p className="mt-2 text-sm text-gray-700">Gross: {summary.sheeps?.gross_total ?? 0}</p>
                                    <p className="text-sm text-gray-700">Net: {summary.sheeps?.net_total ?? 0}</p>
                                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                                        {(summary.sheeps?.distribution_rows ?? []).map((row) => (
                                            <div key={row.qurban_number}>
                                                Sheep #{row.qurban_number}: 2/3 {row.distribution_two_thirds}, per pax {row.portion_per_pax}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <h3 className="mb-4 font-semibold text-gray-900">Qurban Meat Yield</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Qurban</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Net</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gross</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">1/3</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Portion/Participant</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {sortedQurbans.map((qurban) => (
                                                <tr key={qurban.qurban_id}>
                                                    <td className="px-4 py-3 text-sm text-gray-700">#{qurban.qurban_number} - {qurban.qurban_type}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{qurban.net_total}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{qurban.gross_total}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{qurban.one_third}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{qurban.portion_per_participant ?? 'None'}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="flex gap-3">
                                                            <button
                                                                type="button"
                                                                className="font-medium text-red-600 hover:text-red-800"
                                                                onClick={() => {
                                                                    if (window.confirm(`Reset weighing for qurban #${qurban.qurban_number}?`)) {
                                                                        router.delete(route('meat-yields.reset', qurban.qurban_id));
                                                                    }
                                                                }}
                                                            >
                                                                Reset Weighing
                                                            </button>
                                                            <button type="button" className="font-medium text-indigo-600 hover:text-indigo-800" onClick={() => setDetailQurban(qurban)}>
                                                                Detail
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'weighing' && (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {sortedQurbans.map((qurban) => (
                                    <button key={qurban.qurban_id} type="button" onClick={() => setActiveQurban(qurban)} className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 text-left hover:bg-indigo-100">
                                        <p className="text-lg font-semibold text-indigo-900">Qurban #{qurban.qurban_number}</p>
                                        <p className="text-sm text-indigo-700">{qurban.qurban_type}</p>
                                        <p className="mt-2 text-xs text-indigo-600">Tap to add weighing</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'config' && (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    configForm.put(route('meat-yields.config.update'));
                                }}
                                className="space-y-4"
                            >
                                <label className="inline-flex items-center gap-2">
                                    <Checkbox
                                        checked={configForm.data.accumulate_cows_yield_meat}
                                        onChange={(e) => configForm.setData('accumulate_cows_yield_meat', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Accumulate cows yield meat</span>
                                </label>
                                <div className="max-w-sm">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Total pax distribution</label>
                                    <TextInput
                                        type="number"
                                        min="1"
                                        value={configForm.data.total_pax_distribution}
                                        onChange={(e) => configForm.setData('total_pax_distribution', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <PrimaryButton disabled={configForm.processing}>Save Config</PrimaryButton>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={!!activeQurban} onClose={() => setActiveQurban(null)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Add Meat Yield {activeQurban ? `for Qurban #${activeQurban.qurban_number}` : ''}</h3>
                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!activeQurban) return;
                            weighingForm.post(route('meat-yields.store', activeQurban.qurban_id), {
                                onSuccess: () => {
                                    setActiveQurban(null);
                                    weighingForm.reset();
                                    weighingForm.setData('status', 'net');
                                },
                            });
                        }}
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Weigh</label>
                            <TextInput type="number" step="0.01" min="0.01" value={weighingForm.data.weigh} onChange={(e) => weighingForm.setData('weigh', e.target.value)} className="block w-full" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                            <div className="flex gap-3">
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'gross' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'gross')}>Gross</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'net' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'net')}>Net</button>
                            </div>
                        </div>
                        <PrimaryButton disabled={weighingForm.processing}>Save Weighing</PrimaryButton>
                    </form>
                </div>
            </Modal>

            <Modal show={!!detailQurban} onClose={() => setDetailQurban(null)} maxWidth="2xl">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Weighing Details {detailQurban ? `for Qurban #${detailQurban.qurban_number}` : ''}</h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Seq</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Weight</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {(detailQurban?.details ?? []).map((detail) => (
                                    <tr key={detail.meat_yield_id}>
                                        <td className="px-4 py-3 text-sm text-gray-700">{detail.weighing_sequence}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{detail.status}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{detail.weigh}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{detail.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
