import './bootstrap';
import '../css/app.css';

import { router as inertiaRouter } from '@inertiajs/core';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect, useState } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function RequestCloak() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = inertiaRouter.on('start', () => setLoading(true));
        const finish = inertiaRouter.on('finish', () => setLoading(false));
        const error = inertiaRouter.on('error', () => setLoading(false));
        const invalid = inertiaRouter.on('invalid', () => setLoading(false));

        return () => {
            start();
            finish();
            error();
            invalid();
        };
    }, []);

    if (!loading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="rounded-md bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow">
                Loading...
            </div>
        </div>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <RequestCloak />
                <App {...props} />
            </>,
        );
    },
    progress: {
        color: '#144534',
    },
});
