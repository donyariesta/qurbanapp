<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $primaryKey = 'event_id';

    protected $fillable = [
        'year',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    public function submitters(): HasMany
    {
        return $this->hasMany(Submitter::class, 'event_id', 'event_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'event_id', 'event_id');
    }

    public function qurbans(): HasMany
    {
        return $this->hasMany(Qurban::class, 'event_id', 'event_id');
    }

    public function procurements(): HasMany
    {
        return $this->hasMany(Procurement::class, 'event_id', 'event_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'event_id', 'event_id');
    }
}
