<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS `trg_meat_yield_bi_timestamps`');
        DB::unprepared('DROP TRIGGER IF EXISTS `trg_meat_yield_bu_timestamps`');

        DB::unprepared(
            'CREATE TRIGGER `trg_meat_yield_bi_timestamps` BEFORE INSERT ON `meat_yield` FOR EACH ROW
            BEGIN
                IF NEW.created_at IS NULL THEN
                    SET NEW.created_at = CURRENT_TIMESTAMP;
                END IF;
                IF NEW.updated_at IS NULL THEN
                    SET NEW.updated_at = CURRENT_TIMESTAMP;
                END IF;
            END'
        );

        DB::unprepared(
            'CREATE TRIGGER `trg_meat_yield_bu_timestamps` BEFORE UPDATE ON `meat_yield` FOR EACH ROW
            BEGIN
                SET NEW.updated_at = CURRENT_TIMESTAMP;
            END'
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS `trg_meat_yield_bi_timestamps`');
        DB::unprepared('DROP TRIGGER IF EXISTS `trg_meat_yield_bu_timestamps`');
    }
};
