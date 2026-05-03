<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Qurban extends Model
{
    use HasFactory;

    protected $primaryKey = 'qurban_id';

    protected $fillable = [
        'event_id',
        'qurban_number',
        'qurban_type',
        'qurban_shared_price',
        'quota',
        'independent',
    ];

    protected $casts = [
        'qurban_number' => 'integer',
        'qurban_shared_price' => 'decimal:2',
        'quota' => 'integer',
        'independent' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'qurban_id', 'qurban_id');
    }

    public function meatYields(): HasMany
    {
        return $this->hasMany(MeatYield::class, 'qurban_id', 'qurban_id');
    }
}
