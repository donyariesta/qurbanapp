<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditableObserver
{
    public function created(Model $model): void
    {
        $this->logEvent($model, 'create', null, $this->serializableAttributes($model->getAttributes()));
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        unset($changes['updated_at']);

        if ($changes === []) {
            return;
        }

        $oldValues = [];
        foreach (array_keys($changes) as $column) {
            $oldValues[$column] = $model->getOriginal($column);
        }

        $this->logEvent($model, 'update', $this->serializableAttributes($oldValues), $this->serializableAttributes($changes));
    }

    public function deleted(Model $model): void
    {
        $this->logEvent($model, 'delete', $this->serializableAttributes($model->getOriginal()), null);
    }

    private function logEvent(Model $model, string $eventType, ?array $oldValue, ?array $newValue): void
    {
        $user = Auth::user();
        if (! $user) {
            return;
        }

        if ($model instanceof AuditLog) {
            return;
        }

        AuditLog::query()->create([
            'user_id' => $user->id,
            'event_timestamp' => now(),
            'event_type' => $eventType,
            'new_value' => $newValue,
            'old_value' => $oldValue,
            'record_id' => (string) $model->getKey(),
            'record_table' => $model->getTable(),
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }

    private function serializableAttributes(array $attributes): array
    {
        return collect($attributes)
            ->map(fn ($value) => is_scalar($value) || $value === null ? $value : json_encode($value))
            ->all();
    }
}
