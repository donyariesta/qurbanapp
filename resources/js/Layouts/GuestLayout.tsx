import QurbanBrand from '@/Components/QurbanBrand';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f9fafb]">
            <header className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto flex max-w-md items-center justify-center px-4 py-5 sm:max-w-lg">
                    <QurbanBrand href={route('reports.index')} />
                </div>
            </header>

            <div className="flex flex-1 flex-col items-center px-4 py-8 sm:justify-center sm:px-6 sm:py-10">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md ring-1 ring-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
