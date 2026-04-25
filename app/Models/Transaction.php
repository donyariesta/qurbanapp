<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $primaryKey = 'transaction_id';

    protected $fillable = [
        'event_id',
        'amount',
        'date_of_payment',
        'reference_id',
        'reference_type',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date_of_payment' => 'date',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

}
