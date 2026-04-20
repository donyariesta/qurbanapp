<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanAccessRoute
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
        'meat-yields.*',
        'procurements.*',
        'transactions.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $routeName = $request->route()?->getName();

        if (! $user || ! $routeName) {
            abort(403);
        }

        if ($user->isSystemAdmin()) {
            return $next($request);
        }

        foreach (self::OPERATOR_ROUTES as $allowedRoutePattern) {
            if (Str::is($allowedRoutePattern, $routeName)) {
                return $next($request);
            }
        }

        abort(403, 'You are not allowed to access this page.');
    }
}
