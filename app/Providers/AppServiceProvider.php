<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Procurement;
use App\Models\Qurban;
use App\Models\Role;
use App\Models\Submitter;
use App\Models\Transaction;
use App\Models\User;
use App\Observers\AuditableObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::observe(AuditableObserver::class);
        Submitter::observe(AuditableObserver::class);
        Qurban::observe(AuditableObserver::class);
        Participant::observe(AuditableObserver::class);
        Procurement::observe(AuditableObserver::class);
        Transaction::observe(AuditableObserver::class);
        User::observe(AuditableObserver::class);
        Role::observe(AuditableObserver::class);
    }
}
