<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->eligibleTables() as $tableName) {
            $insertTrigger = $this->triggerName($tableName, 'bi');
            $updateTrigger = $this->triggerName($tableName, 'bu');

            DB::unprepared("DROP TRIGGER IF EXISTS `{$insertTrigger}`");
            DB::unprepared("DROP TRIGGER IF EXISTS `{$updateTrigger}`");

            DB::unprepared(
                "CREATE TRIGGER `{$insertTrigger}` BEFORE INSERT ON `{$tableName}` FOR EACH ROW
                BEGIN
                    IF NEW.created_at IS NULL THEN
                        SET NEW.created_at = CURRENT_TIMESTAMP;
                    END IF;
                    IF NEW.updated_at IS NULL THEN
                        SET NEW.updated_at = CURRENT_TIMESTAMP;
                    END IF;
                END"
            );

            DB::unprepared(
                "CREATE TRIGGER `{$updateTrigger}` BEFORE UPDATE ON `{$tableName}` FOR EACH ROW
                BEGIN
                    SET NEW.updated_at = CURRENT_TIMESTAMP;
                END"
            );
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->eligibleTables() as $tableName) {
            DB::unprepared("DROP TRIGGER IF EXISTS `{$this->triggerName($tableName, 'bi')}`");
            DB::unprepared("DROP TRIGGER IF EXISTS `{$this->triggerName($tableName, 'bu')}`");
        }
    }

    private function eligibleTables(): array
    {
        $tables = [];
        $rows = DB::select('SHOW TABLES');

        foreach ($rows as $row) {
            $tableName = (string) array_values((array) $row)[0];

            if (in_array($tableName, ['migrations'], true)) {
                continue;
            }

            if (! Schema::hasColumn($tableName, 'created_at') || ! Schema::hasColumn($tableName, 'updated_at')) {
                continue;
            }

            $tables[] = $tableName;
        }

        return $tables;
    }

    private function triggerName(string $tableName, string $suffix): string
    {
        return substr("trg_{$tableName}_{$suffix}_timestamps", 0, 64);
    }
};
