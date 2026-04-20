<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    protected $primaryKey = 'participant_id';

    protected $fillable = [
        'event_id',
        'submitter_id',
        'qurban_id',
        'first_name',
        'last_name',
        'address',
    ];

    protected $appends = [
        'full_name',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(Submitter::class, 'submitter_id', 'submitter_id');
    }

    public function qurban(): BelongsTo
    {
        return $this->belongsTo(Qurban::class, 'qurban_id', 'qurban_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . ($this->last_name ?? ''));
    }
}
