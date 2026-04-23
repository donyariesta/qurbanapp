/** Decorative footer aligned with public report mockup (low-opacity green landscape). */
export default function ReportFooterArt() {
    return (
        <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 overflow-hidden text-qurban-800/25 sm:h-44"
            aria-hidden
        >
            <svg className="absolute bottom-0 h-full w-full" viewBox="0 0 1200 160" preserveAspectRatio="none">
                <path
                    fill="currentColor"
                    d="M0 120 Q200 80 400 100 T800 90 T1200 110 V160 H0Z"
                />
                <path
                    fill="currentColor"
                    opacity="0.65"
                    d="M0 140 Q300 100 600 125 T1200 130 V160 H0Z"
                />
                <path
                    fill="currentColor"
                    opacity="0.45"
                    d="M80 95 L100 60 L120 95 L140 55 L160 95 L180 70 L200 95 V120 H80Z"
                />
                <path
                    fill="currentColor"
                    opacity="0.45"
                    d="M920 100 Q940 70 960 100 Q980 75 1000 100 L1020 85 L1040 100 V125 H900Z"
                />
                <ellipse cx="180" cy="108" rx="14" ry="10" fill="currentColor" opacity="0.5" />
                <ellipse cx="1020" cy="112" rx="18" ry="12" fill="currentColor" opacity="0.5" />
            </svg>
        </div>
    );
}
