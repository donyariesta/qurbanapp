<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $primaryKey = 'audit_log_id';

    protected $fillable = [
        'user_id',
        'event_timestamp',
        'event_type',
        'new_value',
        'old_value',
        'record_id',
        'record_table',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'event_timestamp' => 'datetime',
        'new_value' => 'array',
        'old_value' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
