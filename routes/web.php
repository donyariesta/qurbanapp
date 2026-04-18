<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\EventYearController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicReportController;
use App\Http\Controllers\QurbanController;
use App\Http\Controllers\SubmitterController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Models\Event;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::redirect('/', '/reports');

Route::get('/reports', [PublicReportController::class, 'index'])->name('reports.index');

Route::get('/dashboard', function () {
    $year = session('selected_event_year');
        if (! is_numeric($year)) {
            $year = 0;
        }

    $event =  Event::query()->where('year', (int) $year)->first();

    return Inertia::render('Dashboard', [
        'latestEventYear' => $event?->year,
        'stats' => [
            'events' => Event::query()->count(),
            'submitters' => $event?->submitters()->count() ?? 0,
            'participants' => $event?->participants()->count() ?? 0,
            'qurbans' => $event?->qurbans()->count() ?? 0,
            'procurements' => $event?->procurements()->count() ?? 0,
            'transactions' => $event?->transactions()->count() ?? 0,
        ],
        'framework' => [
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ],
    ]);
})->middleware(['auth', 'verified', 'route.access'])->name('dashboard');

Route::middleware(['auth', 'route.access'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/event-year/{year}', [EventYearController::class, 'set'])->name('eventYear.set');

    Route::resource('events', EventController::class)->except(['show', 'create', 'edit']);
    Route::resource('submitters', SubmitterController::class)->except(['create', 'edit']);
    Route::resource('participants', ParticipantController::class)->except(['show', 'create', 'edit']);
    Route::post('submitters/{submitter}/participants', [ParticipantController::class, 'storeForSubmitter'])->name('submitters.participants.store');
    Route::put('submitters/{submitter}/participants/{participant}', [ParticipantController::class, 'updateForSubmitter'])->name('submitters.participants.update');
    Route::delete('submitters/{submitter}/participants/{participant}', [ParticipantController::class, 'destroyForSubmitter'])->name('submitters.participants.destroy');
    Route::post('submitters/{submitter}/payments', [TransactionController::class, 'storeForSubmitter'])->name('submitters.payments.store');
    Route::put('submitters/{submitter}/payments/{transaction}', [TransactionController::class, 'updateForSubmitter'])->name('submitters.payments.update');
    Route::delete('submitters/{submitter}/payments/{transaction}', [TransactionController::class, 'destroyForSubmitter'])->name('submitters.payments.destroy');
    Route::resource('qurbans', QurbanController::class)->except(['show', 'create', 'edit']);
    Route::resource('procurements', ProcurementController::class)->except(['show', 'create', 'edit']);
    Route::post('procurements/{procurement}/payments', [ProcurementController::class, 'storePayment'])->name('procurements.payments.store');
    Route::put('procurements/{procurement}/payments/{transaction}', [ProcurementController::class, 'updatePayment'])->name('procurements.payments.update');
    Route::delete('procurements/{procurement}/payments/{transaction}', [ProcurementController::class, 'destroyPayment'])->name('procurements.payments.destroy');
    Route::resource('transactions', TransactionController::class)->except(['show', 'create', 'edit']);
    Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);
});

require __DIR__.'/auth.php';
