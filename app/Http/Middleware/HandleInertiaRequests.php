<?php

namespace App\Http\Middleware;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    private const OPERATOR_ROUTES = [
        'dashboard',
        'reports.index',
        'profile.*',
        'password.*',
        'verification.*',
        'eventYear.set',
        'submitters.*',
        'participants.*',
        'qurbans.*',
        'procurements.*',
        'transactions.*',
    ];

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $years = Event::query()
            ->orderByDesc('year')
            ->pluck('year')
            ->all();

        $selectedYear = $request->session()->get('selected_event_year');
        if (! $selectedYear && count($years) > 0) {
            $selectedYear = $years[0];
            $request->session()->put('selected_event_year', $selectedYear);
        }

        $user = $request->user()?->loadMissing('role');
        $permissions = [];

        if ($user) {
            $permissions = $user->isSystemAdmin()
                ? ['*']
                : self::OPERATOR_ROUTES;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $permissions,
            ],
            'eventYears' => $years,
            'selectedEventYear' => $selectedYear,
        ];
    }
}
