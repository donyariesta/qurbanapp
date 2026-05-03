import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useMemo, useState } from 'react';
import { formatQurban } from '@/lib/formator';

type QurbanYield = {
    qurban_id: number;
    qurban_number: number;
    qurban_type: 'Cow' | 'Sheep';
    participant_count: number;
    meat: number;
    bone: number;
    one_third: number;
    one_third_pax: number;
    one_third_portion_per_pax: number | null;
    details: Array<{
        meat_yield_id: number;
        weighing_sequence: number;
        weigh: number;
        status: 'meat' | 'bone' | 'insider' | 'skin' | 'head' | 'feet';
        created_at: string;
    }>;
};

interface MeatYieldPageProps extends Record<string, unknown> {
    summary: {
        total_pax: number;
        cows?: {
            meat_total: number;
            bone_total: number;
            two_third_total: number;
            two_third_portion_per_pax: number;
            one_third_total: number;
            one_third_pax_total: number;
            one_third_portion_per_pax: number;
        };
        sheeps?: {
            meat_total: number;
            bone_total: number;
            two_third_total: number;
            two_third_portion_per_pax: number;
            distribution_rows: Array<{
                qurban_number: number;
                one_third: number;
                portion_per_pax: number;
            }>;
        };
    };
    qurbans: QurbanYield[];
    config: {
        accumulate_cows_yield_meat: boolean;
        total_pax_distribution: number;
        display_meat_yield_summary_public_report: boolean;
    };
}

export default function MeatYieldPage({ auth, summary, qurbans, config }: PageProps<MeatYieldPageProps>) {
    const [tab, setTab] = useState<'ringkasan' | 'penimbangan' | 'config'>('ringkasan');
    const [activeQurban, setActiveQurban] = useState<QurbanYield | null>(null);
    const [detailQurban, setDetailQurban] = useState<QurbanYield | null>(null);
    const weighingForm = useForm({
        weigh: '',
        status: 'meat' as 'meat' | 'bone' | 'insider' | 'skin' | 'head' | 'feet',
    });
    const configForm = useForm({
        accumulate_cows_yield_meat: config.accumulate_cows_yield_meat,
        total_pax_distribution: String(config.total_pax_distribution ?? 1),
        display_meat_yield_summary_public_report: config.display_meat_yield_summary_public_report,
    });

    return (
        <AuthenticatedLayout user={auth.user!} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Hasil Daging</h2>}>
            <Head title="Hasil Daging" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex gap-2">
                            {(['ringkasan', 'penimbangan', 'config'] as const).map((item) => (
                                <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === item ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    {item[0].toUpperCase() + item.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {tab === 'ringkasan' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900">Distribusi Daging Sapi</h3>
                                    <p className="mt-2 text-sm text-gray-700">Daging: <b>{summary.cows?.meat_total ?? 0} kg</b></p>
                                    <p className="text-sm text-gray-700">Tulang: <b>{summary.cows?.bone_total ?? 0} kg</b></p>
                                    {config.accumulate_cows_yield_meat && (
                                        <>
                                            <p className="text-sm text-gray-700">Distribusi 1/3 Bagian: <b>{summary.cows?.one_third_portion_per_pax ?? 0} kg</b> per pax ({summary.cows?.one_third_total ?? 0} kg / {summary.cows?.one_third_pax_total ?? 0} peserta)</p>
                                        </>
                                    )}
                                    <p className="text-sm text-gray-700">Distribusi 2/3 Bagian: <b>{summary.cows?.two_third_portion_per_pax ?? 0} kg</b> per pax ({summary.cows?.two_third_total ?? 0} kg / {summary.total_pax} pax)</p>
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900">Distribusi Daging Domba</h3>
                                    <p className="mt-2 text-sm text-gray-700">Daging: <b>{summary.sheeps?.meat_total ?? 0} kg</b></p>
                                    <p className="text-sm text-gray-700">Tulang: <b>{summary.sheeps?.bone_total ?? 0} kg</b></p>
                                    <p className="text-sm text-gray-700">Distribusi 2/3 Bagian: <b>{summary.sheeps?.two_third_portion_per_pax ?? 0} kg</b> per pax ({summary.sheeps?.two_third_total ?? 0} kg / {summary.total_pax} pax)</p>
                                    <p className="text-sm text-gray-700 pt-4">
                                        <b>Distribusi 1/3 Bagian:</b>
                                        <ul>
                                            {(summary.sheeps?.distribution_rows ?? []).map((row) => (
                                                <li key={row.qurban_number}>
                                                    {formatQurban('Sheep', row.qurban_number)}: <b>{row.one_third} kg</b>
                                                </li>
                                            ))}
                                        </ul>
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <h3 className="mb-4 font-semibold text-gray-900">Detil Hasil Daging Qurban</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Qurban</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tulang</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Daging</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Distribusi 1/3 Bagian</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {qurbans.map((qurban) => (
                                                <tr key={qurban.qurban_id}>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{formatQurban(qurban.qurban_type, qurban.qurban_number)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{qurban.bone} kg</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{qurban.meat} kg</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        <b>{qurban.one_third_portion_per_pax ?? 'None'}</b> <small>{qurban.qurban_type === 'Cow' && `(${qurban.one_third} / ${qurban.one_third_pax} peserta)`}</small>
                                                    </td>
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
                                                                Reset Penimbangan
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

                    {tab === 'penimbangan' && (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {qurbans.map((qurban) => (
                                    <button key={qurban.qurban_id} type="button" onClick={() => setActiveQurban(qurban)} className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 text-left hover:bg-indigo-100">
                                        <p className="text-lg font-semibold text-indigo-900">{formatQurban(qurban.qurban_type, qurban.qurban_number)}</p>
                                        <p className="mt-2 text-xs text-indigo-600">Input penimbangan</p>
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
                                    <span className="text-sm font-medium text-gray-700">Akumulasi hasil daging sapi</span>
                                </label>
                                <div className="max-w-sm">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Total pax distribusi</label>
                                    <TextInput
                                        type="number"
                                        min="1"
                                        value={configForm.data.total_pax_distribution}
                                        onChange={(e) => configForm.setData('total_pax_distribution', e.target.value)}
                                        className="block w-full"
                                    />
                                </div>
                                <div className="max-w-sm">
                                    <label className="inline-flex items-center gap-2">
                                        <Checkbox
                                            checked={configForm.data.display_meat_yield_summary_public_report}
                                            onChange={(e) => configForm.setData('display_meat_yield_summary_public_report', e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Tampilkan ringkasan hasil daging pada public report</span>
                                    </label>
                                </div>
                                <div className="max-w-sm">
                                    <PrimaryButton disabled={configForm.processing}>Simpan Config</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={!!activeQurban} onClose={() => setActiveQurban(null)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Tambah Hasil Daging {activeQurban ? `untuk ${formatQurban(activeQurban.qurban_type, activeQurban.qurban_number)}` : ''}</h3>
                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!activeQurban) return;
                            weighingForm.post(route('meat-yields.store', activeQurban.qurban_id), {
                                onSuccess: () => {
                                    setActiveQurban(null);
                                    weighingForm.reset();
                                    weighingForm.setData('status', 'meat');
                                },
                            });
                        }}
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Bobot</label>
                            <TextInput type="number" step="0.01" min="0.01" value={weighingForm.data.weigh} onChange={(e) => weighingForm.setData('weigh', e.target.value)} className="block w-full" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                            <div className="flex gap-3 flex-wrap">
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'meat' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'meat')}>Daging</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'bone' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'bone')}>Tulang</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'insider' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'insider')}>Isi</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'skin' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'skin')}>Kulit</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'head' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'head')}>Kepala</button>
                                <button type="button" className={`rounded-md px-3 py-2 text-sm ${weighingForm.data.status === 'feet' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`} onClick={() => weighingForm.setData('status', 'feet')}>Kaki</button>
                            </div>
                        </div>
                        <PrimaryButton disabled={weighingForm.processing}>Simpan Bobot</PrimaryButton>
                    </form>
                </div>
            </Modal>

            <Modal show={!!detailQurban} onClose={() => setDetailQurban(null)} maxWidth="2xl">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Detil timbangan {detailQurban ? `untuk ${formatQurban(detailQurban.qurban_type, detailQurban.qurban_number)}` : ''}</h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Ke</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Bobot</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waktu</th>
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
