import { useState, PropsWithChildren, ReactNode } from 'react';
import QurbanBrand from '@/Components/QurbanBrand';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps, User } from '@/types';
import { canAccessRoute } from '@/lib/permissions';
import { Icon } from '../Components/Icon';

type NavItem = { label: string; routeName: string; active: boolean; icon?: string, faicon?: string };

function userInitials(user: User): string {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return user.name.slice(0, 2).toUpperCase() || 'U';
}

function displayRole(user: User): string {
    if (user.role?.name) {
        return user.role.name;
    }

    return user.name;
}

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User; header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { eventYears, selectedEventYear, auth } = usePage<PageProps<{ eventYears: number[]; selectedEventYear: number | null }>>().props;
    const permissions = auth.permissions ?? [];
    const can = (routeName: string) => canAccessRoute(permissions, routeName);

    const navItems: NavItem[] = [
        { label: 'Dashboard', routeName: 'dashboard', active: route().current('dashboard'), faicon: 'fa-gauge-high' },
        ...(can('events.index') ? [{ label: 'Events', routeName: 'events.index', active: route().current('events.*'), faicon: 'fa-calendar-days' }] : []),
        ...(can('submitters.index') ? [{ label: 'Peserta', routeName: 'submitters.index', active: route().current('submitters.*'), faicon: 'fa-id-card' }] : []),
        ...(can('qurbans.index') ? [{ label: 'Hewan Qurban', routeName: 'qurbans.index', active: route().current('qurbans.*'), icon: 'cow' }] : []),
        ...(can('meat-yields.index') ? [{ label: 'Hasil Daging', routeName: 'meat-yields.index', active: route().current('meat-yields.*'), icon: 'meat' }] : []),
        ...(can('procurements.index') ? [{ label: 'Procurements', routeName: 'procurements.index', active: route().current('procurements.*'), faicon: 'fa-cart-shopping' }] : []),
        ...(can('transactions.index') ? [{ label: 'Transactions', routeName: 'transactions.index', active: route().current('transactions.*'), faicon: 'fa-right-left' }] : []),
        ...(can('users.index') ? [{ label: 'Users', routeName: 'users.index', active: route().current('users.*'), faicon: 'fa-users' }] : []),
        ...(can('audit-logs.index') ? [{ label: 'Audit Logs', routeName: 'audit-logs.index', active: route().current('audit-logs.index'), faicon: 'fa-shield-halved' }] : []),
        { label: 'Public Report', routeName: 'reports.index', active: route().current('reports.index'), faicon: 'fa-pen-to-square' },
    ];

    return (
        <div className="min-h-screen bg-[#f9fafb] md:flex">
            <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
                <div className="border-b border-gray-100 px-5 py-5">
                    <QurbanBrand />
                </div>
                <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
                    {navItems.map((item) => (
                        <NavLink key={item.routeName} href={route(item.routeName)} active={item.active} className="w-full px-3 py-2.5">
                            {!!item.faicon ? <i className={`fa-solid ${item.faicon} w-5 text-center text-[0.95rem] opacity-90`} aria-hidden /> : <Icon name={item.icon} className={`opacity-80`} width={20} />}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-auto p-4">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
                        <p className="text-sm font-semibold text-qurban-900">Need help?</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600">Browse guides for operators and admins.</p>
                        <a
                            href="https://laravel.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-qurban-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                        >
                            View docs
                            <i className="fa-solid fa-arrow-up-right-from-square text-[0.7rem]" aria-hidden />
                        </a>
                    </div>
                </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                <nav className="border-b border-gray-200 bg-white md:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <QurbanBrand imgClassName="h-9 w-auto" />
                        <button
                            type="button"
                            onClick={() => setShowingNavigationDropdown((v) => !v)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-qurban-800 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-qurban-600"
                            aria-expanded={showingNavigationDropdown}
                            aria-label="Toggle navigation"
                        >
                            <i className={`fa-solid ${showingNavigationDropdown ? 'fa-xmark' : 'fa-bars'} text-xl`} aria-hidden />
                        </button>
                    </div>

                    <div className={showingNavigationDropdown ? 'block border-t border-gray-100' : 'hidden'}>
                        <div className="space-y-1 px-3 py-3">
                            <div className="px-1 pb-2">
                                <label className="sr-only" htmlFor="mobile-event-year">
                                    Event year
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <i className="fa-solid fa-calendar-days" aria-hidden />
                                    </span>
                                    <select
                                        id="mobile-event-year"
                                        value={selectedEventYear ?? ''}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            if (!value) return;
                                            router.get(route('eventYear.set', { year: Number(value) }));
                                        }}
                                        className="w-full rounded-lg border-gray-200 py-2.5 pl-9 text-sm shadow-sm focus:border-qurban-600 focus:ring-qurban-600"
                                    >
                                        {eventYears?.length ? (
                                            eventYears.map((year: number) => (
                                                <option key={year} value={year}>
                                                    Event {year}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No events yet</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            {navItems.map((item) => (
                                <ResponsiveNavLink key={item.routeName} href={route(item.routeName)} active={item.active}>
                                    <span className="inline-flex items-center gap-2">
                                        <i className={`fa-solid ${item.icon} w-5 text-center`} aria-hidden />
                                        {item.label}
                                    </span>
                                </ResponsiveNavLink>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="mt-2 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                    Log out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="hidden items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3.5 md:flex">
                    <div className="relative min-w-[12rem] max-w-xs flex-1">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i className="fa-solid fa-calendar-days" aria-hidden />
                        </span>
                        <select
                            value={selectedEventYear ?? ''}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (!value) return;
                                router.get(route('eventYear.set', { year: Number(value) }));
                            }}
                            className="w-full rounded-lg border-gray-200 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-qurban-600 focus:ring-qurban-600"
                        >
                            {eventYears?.length ? (
                                eventYears.map((year: number) => (
                                    <option key={year} value={year}>
                                        Event {year}
                                    </option>
                                ))
                            ) : (
                                <option value="">No events yet</option>
                            )}
                        </select>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-qurban-600"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-qurban-800 text-xs font-bold text-white">
                                        {userInitials(user)}
                                    </span>
                                    <span className="max-w-[14rem] truncate text-left leading-tight">
                                        <span className="block text-xs font-normal text-gray-500">Signed in as</span>
                                        <span className="block truncate font-semibold text-gray-900">{displayRole(user)}</span>
                                    </span>
                                    <i className="fa-solid fa-chevron-down text-xs text-gray-400" aria-hidden />
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>

                {header && (
                    <header className="border-b border-gray-100 bg-white/90">
                        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                            <div className="text-2xl font-bold tracking-tight text-qurban-800 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-qurban-800">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
