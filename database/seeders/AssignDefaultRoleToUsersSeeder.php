<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssignDefaultRoleToUsersSeeder extends Seeder
{
    public function run(): void
    {
        $operatorRole = Role::query()->where('slug', 'operator')->first();

        if (! $operatorRole) {
            return;
        }

        User::query()
            ->whereNull('role_id')
            ->update(['role_id' => $operatorRole->id]);
    }
}
