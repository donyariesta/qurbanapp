import { Link, InertiaLinkProps } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center gap-2.5 rounded-lg text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-qurban-600 focus-visible:ring-offset-2 ' +
                (active
                    ? 'bg-qurban-800 text-white shadow-sm '
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-qurban-900 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
