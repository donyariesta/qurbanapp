import { Link } from '@inertiajs/react';
import { ImgHTMLAttributes } from 'react';

type QurbanBrandProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
    href?: string;
    imgClassName?: string;
};

export default function QurbanBrand({
    href = route('dashboard'),
    className = '',
    imgClassName = 'h-10 w-auto sm:h-11',
    ...imgProps
}: QurbanBrandProps) {
    return (
        <Link href={href} className={`inline-flex shrink-0 items-center ${className}`}>
            <img
                src="/images/qurban-logo.png"
                alt="Qurban — Manage · Share · Benefit"
                className={imgClassName}
                {...imgProps}
            />
        </Link>
    );
}
