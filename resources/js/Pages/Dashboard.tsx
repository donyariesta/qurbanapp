import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { canAccessRoute } from '@/lib/permissions';
import { Icon } from '../Components/Icon';

interface DashboardProps extends Record<string, unknown> {
    latestEventYear: number | null;
    stats: Record<string, number>;
    framework: {
        laravelVersion: string;
        phpVersion: string;
    };
}

type StatDef = {
    label: string;
    sub: string;
    value: number;
    routeName: string;
    icon?: string;
    faicon?: string;
};

export default function Dashboard({ auth, latestEventYear, stats, framework }: PageProps<DashboardProps>) {
    const permissions = usePage<PageProps>().props.auth.permissions ?? [];
    const can = (name: string) => canAccessRoute(permissions, name);

    const statDefs: StatDef[] = [
        { label: 'Peserta', sub: 'Seluruh peserta', value: stats.participants, routeName: 'participants.index', faicon: 'fa-users' },
        { label: 'Hewan Sapi', sub: 'Hewan qurban sapi', value: stats.qurbans_cow, routeName: 'qurbans.index', icon: 'cow' },
        { label: 'Hewan Domba', sub: 'Hewan qurban domba', value: stats.qurbans_sheep, routeName: 'qurbans.index', icon: 'sheep' },
        { label: 'Pembelanjaan', sub: 'Pembelanjaan', value: stats.procurements, routeName: 'procurements.index', faicon: 'fa-cart-shopping' },
        { label: 'Transaksi', sub: 'Uang masuk/keluar', value: stats.transactions, routeName: 'transactions.index', faicon: 'fa-right-left' },
    ];

    return (
        <AuthenticatedLayout user={auth.user!}>
            <Head title="Dashboard" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Sekilas tentang Pelaksanaan Qurban.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {statDefs.map((card) => {
                            const clickable = can(card.routeName);
                            const inner = (
                                <>
                                    <div className="flex flex-1 items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-qurban-800">
                                            {!!card.faicon ? <i className={`fa-solid ${card.faicon} text-lg`} aria-hidden /> : <Icon name={card.icon} width={26} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                            <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
                                            <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
                                        </div>
                                    </div>
                                    {clickable ? (
                                        <i className="fa-solid fa-chevron-right mt-1 text-sm text-gray-300" aria-hidden />
                                    ) : null}
                                </>
                            );

                            const cardClass =
                                'flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-100 transition';

                            if (clickable) {
                                return (
                                    <Link
                                        key={card.label}
                                        href={route(card.routeName)}
                                        className={`${cardClass} hover:border-emerald-200 hover:shadow-md`}
                                    >
                                        {inner}
                                    </Link>
                                );
                            }

                            return (
                                <div key={card.label} className={`${cardClass} cursor-default opacity-90`}>
                                    {inner}
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
                        <div className="relative z-10 max-w-xl">
                            <h2 className="text-lg font-semibold text-gray-900">Current workspace</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Latest event year: <span className="font-semibold text-qurban-800">{latestEventYear ?? 'No event data yet'}</span>.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                {can('events.index') ? (
                                    <Link
                                        href={route('events.index')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-qurban-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-qurban-900"
                                    >
                                        <i className="fa-solid fa-database" aria-hidden />
                                        Manage data
                                    </Link>
                                ) : null}
                                <Link
                                    href={route('reports.index')}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                >
                                    Open public report
                                    <i className="fa-solid fa-arrow-up-right-from-square text-xs text-gray-400" aria-hidden />
                                </Link>
                            </div>
                        </div>
                        <div
                            className="pointer-events-none absolute -bottom-6 -right-4 h-48 w-72 text-emerald-100 sm:h-56 sm:w-96"
                            aria-hidden
                        >
                            <svg viewBox="0 0 200 140" className="h-full w-full" fill="currentColor">
                                <path opacity="0.35" d="M40 100 L55 55 L70 100 L90 45 L110 100 L130 60 L150 100 V120 H20Z" className="text-qurban-800" />
                                <circle cx="100" cy="28" r="10" className="text-qurban-700" opacity="0.25" />
                                <ellipse cx="55" cy="118" rx="12" ry="8" opacity="0.3" />
                                <ellipse cx="140" cy="118" rx="10" ry="7" opacity="0.3" />
                            </svg>
                        </div>
                    </div>

                    <footer className="flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-2">
                            <i className="fa-solid fa-shield-halved text-qurban-700" aria-hidden />
                            Laravel {framework.laravelVersion} on PHP {framework.phpVersion}
                        </span>
                        <span className="inline-flex items-center gap-2 text-gray-600">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            System running smoothly
                        </span>
                    </footer>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
