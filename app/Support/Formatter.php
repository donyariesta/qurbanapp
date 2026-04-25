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

    public static function qurbanName($qurbanNumber, $qurbanType): string
    {
        if (empty($qurbanNumber) || empty($qurbanType)) {
            return '-';
        }

        $qurbanTypes = [
            'cow' => 'Sapi',
            'sheep' => 'Kambing',
        ];
        return $qurbanTypes[strtolower($qurbanType)] . " #$qurbanNumber";
    }
}
