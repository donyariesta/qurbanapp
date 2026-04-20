import { Link, InertiaLinkProps } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'text-indigo-700 bg-indigo-50 '
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
