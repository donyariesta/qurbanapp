<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeatYield extends Model
{
    use HasFactory;

    protected $table = 'meat_yield';
    protected $primaryKey = 'meat_yield_id';

    protected $fillable = [
        'qurban_id',
        'weighing_sequence',
        'weigh',
        'status',
    ];

    protected $casts = [
        'weigh' => 'decimal:2',
    ];

    public function qurban(): BelongsTo
    {
        return $this->belongsTo(Qurban::class, 'qurban_id', 'qurban_id');
    }
}
