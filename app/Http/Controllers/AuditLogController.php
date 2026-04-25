<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'record_id' => ['nullable', 'string', 'max:255'],
            'ip_address' => ['nullable', 'string', 'max:45'],
            'user_agent' => ['nullable', 'string', 'max:1000'],
            'per_page' => ['nullable', 'integer', 'in:50,100,500,1000,2000'],
        ]);
        $perPage = (int) ($validated['per_page'] ?? 50);

        $logs = AuditLog::query()
            ->with('user:id,name,username')
            ->when($validated['from_date'] ?? null, fn ($query, $value) => $query->whereDate('event_timestamp', '>=', $value))
            ->when($validated['to_date'] ?? null, fn ($query, $value) => $query->whereDate('event_timestamp', '<=', $value))
            ->when($validated['user_id'] ?? null, fn ($query, $value) => $query->where('user_id', $value))
            ->when($validated['record_id'] ?? null, fn ($query, $value) => $query->where('record_id', 'like', "%{$value}%"))
            ->when($validated['ip_address'] ?? null, fn ($query, $value) => $query->where('ip_address', 'like', "%{$value}%"))
            ->when($validated['user_agent'] ?? null, fn ($query, $value) => $query->where('user_agent', 'like', "%{$value}%"))
            ->orderByDesc('event_timestamp')
            ->limit($perPage)
            ->get()
            ->map(fn (AuditLog $log) => [
                'audit_log_id' => $log->audit_log_id,
                'user' => $log->user ? "{$log->user->name} ({$log->user->username})" : 'Unknown',
                'event_timestamp' => optional($log->event_timestamp)->format('Y-m-d H:i:s'),
                'event_type' => $log->event_type,
                'record_id' => $log->record_id,
                'record_table' => $log->record_table,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'new_value' => $log->new_value,
                'old_value' => $log->old_value,
            ])
            ->all();

        return Inertia::render('Admin/AuditLogPage', [
            'filters' => [
                'from_date' => $validated['from_date'] ?? '',
                'to_date' => $validated['to_date'] ?? '',
                'user_id' => isset($validated['user_id']) ? (string) $validated['user_id'] : '',
                'record_id' => $validated['record_id'] ?? '',
                'ip_address' => $validated['ip_address'] ?? '',
                'user_agent' => $validated['user_agent'] ?? '',
                'per_page' => (string) $perPage,
            ],
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'username'])
                ->map(fn (User $user) => [
                    'value' => (string) $user->id,
                    'label' => "{$user->name} ({$user->username})",
                ])
                ->all(),
            'logs' => $logs,
        ]);
    }
}
