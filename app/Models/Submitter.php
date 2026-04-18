<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Submitter extends Model
{
    use HasFactory;

    protected $primaryKey = 'submitter_id';

    protected $fillable = [
        'event_id',
        'name',
        'address',
        'phone_number',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'submitter_id', 'submitter_id');
    }

}
