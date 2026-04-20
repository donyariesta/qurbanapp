<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/CrudPage', [
            'title' => 'Users',
            'singular' => 'User',
            'routeName' => 'users',
            'fields' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                ['name' => 'username', 'label' => 'Username', 'type' => 'text', 'required' => true],
                ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'required' => true],
                ['name' => 'role_id', 'label' => 'Role', 'type' => 'select', 'required' => true, 'optionsKey' => 'roles'],
                ['name' => 'is_active', 'label' => 'Status', 'type' => 'select', 'required' => false, 'options' => [
                    ['value' => 1, 'label' => 'Active'],
                    ['value' => 0, 'label' => 'Inactive'],
                ]],
                ['name' => 'password', 'label' => 'Password', 'type' => 'text', 'required' => false],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'username', 'label' => 'Username'],
                ['key' => 'email', 'label' => 'Email'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'role_name', 'label' => 'Role'],
            ],
            'records' => User::query()
                ->with('role')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'is_active' => $user->is_active ? 1 : 0,
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                    'role_name' => $user->role?->name ?? '-',
                ])
                ->all(),
            'options' => [
                'roles' => Role::query()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Role $role) => [
                        'value' => $role->id,
                        'label' => $role->name,
                    ])
                    ->all(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateData($request);
        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);
        User::query()->create($validated);

        return to_route('users.index');
    }

    public function update(Request $request, User $user)
    {
        $validated = $this->validateData($request, $user);

        if (! filled($validated['password'] ?? null)) {
            unset($validated['password']);
        }
        if (! array_key_exists('is_active', $validated)) {
            unset($validated['is_active']);
        }

        $user->update($validated);

        return to_route('users.index');
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()?->id === $user->id) {
            return back()->withErrors(['delete' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return to_route('users.index');
    }

    private function validateData(Request $request, ?User $user = null): array
    {
        $passwordRules = $user
            ? ['nullable', 'string', Password::defaults()]
            : ['required', 'string', Password::defaults()];

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user?->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'role_id' => ['required', 'exists:roles,id'],
            'is_active' => ['nullable', 'boolean'],
            'password' => $passwordRules,
        ]);
    }
}
