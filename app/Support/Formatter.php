<?php

namespace App\Support;

class Formatter
{
    public static function currency($amount): string
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }

    public static function weight($kg): string
    {
        return number_format(round($kg, 2), 2) . ' kg';
    }

    public static function date($date): string
    {
        return \Carbon\Carbon::parse($date)->format('d M Y');
    }
}
