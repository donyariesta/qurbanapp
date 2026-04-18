import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface DashboardProps extends Record<string, unknown> {
    latestEventYear: number | null;
    stats: Record<string, number>;
    framework: {
        laravelVersion: string;
        phpVersion: string;
    };
}

export default function Dashboard({ auth, latestEventYear, stats, framework }: PageProps<DashboardProps>) {
    const cards = [
        ['Events', stats.events],
        ['Submitters', stats.submitters],
        ['Participants', stats.participants],
        ['Qurbans', stats.qurbans],
        ['Procurements', stats.procurements],
        ['Transactions', stats.transactions],
    ];

    return (
        <AuthenticatedLayout
            user={auth.user!}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto space-y-6 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        {cards.map(([label, value]) => (
                            <div key={label} className="rounded-lg bg-white p-6 shadow-sm">
                                <p className="text-sm text-gray-500">{label}</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">Current Workspace</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Latest event year: {latestEventYear ?? 'No event data yet'}.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link href={route('events.index')} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                                Manage Data
                            </Link>
                            <Link href={route('reports.index')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                                Open Public Report
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Laravel {framework.laravelVersion} on PHP {framework.phpVersion}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
