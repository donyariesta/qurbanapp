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
                ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'required' => true],
                ['name' => 'role_id', 'label' => 'Role', 'type' => 'select', 'required' => true, 'optionsKey' => 'roles'],
                ['name' => 'password', 'label' => 'Password', 'type' => 'text', 'required' => false],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'email', 'label' => 'Email'],
                ['key' => 'role_name', 'label' => 'Role'],
            ],
            'records' => User::query()
                ->with('role')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
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
        User::query()->create($this->validateData($request));

        return to_route('users.index');
    }

    public function update(Request $request, User $user)
    {
        $validated = $this->validateData($request, $user);

        if (! filled($validated['password'] ?? null)) {
            unset($validated['password']);
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
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'role_id' => ['required', 'exists:roles,id'],
            'password' => $passwordRules,
        ]);
    }
}
