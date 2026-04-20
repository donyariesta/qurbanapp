import { useState, PropsWithChildren, ReactNode } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps, User } from '@/types';

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { eventYears, selectedEventYear, auth } = usePage<PageProps<{ eventYears: number[]; selectedEventYear: number | null }>>().props;
    const permissions = auth.permissions ?? [];
    const canAccess = (routeName: string) =>
        permissions.includes('*') ||
        permissions.some((pattern) => {
            if (pattern.endsWith('.*')) {
                const prefix = pattern.slice(0, -2);
                return routeName === `${prefix}.index` || routeName.startsWith(`${prefix}.`);
            }

            return routeName === pattern;
        });
    const navItems = [
        { label: 'Dashboard', routeName: 'dashboard', active: route().current('dashboard') },
        ...(canAccess('events.index') ? [{ label: 'Events', routeName: 'events.index', active: route().current('events.*') }] : []),
        ...(canAccess('submitters.index') ? [{ label: 'Submitters', routeName: 'submitters.index', active: route().current('submitters.*') }] : []),
        ...(canAccess('qurbans.index') ? [{ label: 'Qurbans', routeName: 'qurbans.index', active: route().current('qurbans.*') }] : []),
        ...(canAccess('meat-yields.index') ? [{ label: 'Meat Yield', routeName: 'meat-yields.index', active: route().current('meat-yields.*') }] : []),
        ...(canAccess('procurements.index') ? [{ label: 'Procurements', routeName: 'procurements.index', active: route().current('procurements.*') }] : []),
        ...(canAccess('transactions.index') ? [{ label: 'Transactions', routeName: 'transactions.index', active: route().current('transactions.*') }] : []),
        ...(canAccess('users.index') ? [{ label: 'Users', routeName: 'users.index', active: route().current('users.*') }] : []),
        ...(canAccess('audit-logs.index') ? [{ label: 'Audit Logs', routeName: 'audit-logs.index', active: route().current('audit-logs.index') }] : []),
        { label: 'Public Report', routeName: 'reports.index', active: route().current('reports.index') },
    ];

    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
                <div className="border-b border-gray-100 px-6 py-4">
                    <Link href={route('dashboard')}>
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                </div>
                <div className="flex-1 space-y-1 px-4 py-4">
                    {navItems.map((item) => (
                        <NavLink key={item.routeName} href={route(item.routeName)} active={item.active} className="w-full rounded-md border-b-0 px-3 py-2 text-sm">
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </aside>

            <div className="flex-1">
                <nav className="border-b border-gray-100 bg-white md:hidden">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href={route('dashboard')}>
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <div className="px-4">
                            <select
                                value={selectedEventYear ?? ''}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (!value) return;
                                    router.get(route('eventYear.set', { year: Number(value) }));
                                }}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
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
                        {navItems.map((item) => (
                            <ResponsiveNavLink key={item.routeName} href={route(item.routeName)} active={item.active}>
                                {item.label}
                            </ResponsiveNavLink>
                        ))}
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">
                                {user.name}
                            </div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
                </nav>

                <div className="hidden border-b border-gray-200 bg-white px-6 py-4 md:flex md:items-center md:justify-between">
                    <div className="w-full max-w-xs">
                        <select
                            value={selectedEventYear ?? ''}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (!value) return;
                                router.get(route('eventYear.set', { year: Number(value) }));
                            }}
                            className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

                    <div className="relative">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition ease-in-out duration-150 hover:text-gray-700 focus:outline-none"
                                    >
                                        {user.name}

                                        <svg
                                            className="ms-2 -me-0.5 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
