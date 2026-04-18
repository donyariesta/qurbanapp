<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Procurement;
use App\Models\Submitter;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProcurementController extends Controller
{
    use BuildsQurbanOptions;
    use ResolvesSelectedEvent;

    public function index(): Response
    {
        $eventId = $this->selectedEventId();

        return Inertia::render('Admin/ProcurementPage', [
            'procurements' => Procurement::query()
                ->with('event')
                ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
                ->orderBy('item')
                ->get()
                ->map(fn (Procurement $procurement) => [
                    'id' => $procurement->procurement_id,
                    'item' => $procurement->item,
                    'price' => $procurement->price,
                    'quantity' => $procurement->quantity,
                    'notes' => $procurement->notes,
                    'payments' => Transaction::query()
                        ->where('event_id', $eventId)
                        ->where('reference_type', 'Procurement')
                        ->where('reference_id', $procurement->procurement_id)
                        ->orderByDesc('date_of_payment')
                        ->get()
                        ->map(fn (Transaction $payment) => [
                            'id' => $payment->transaction_id,
                            'amount' => $payment->amount,
                            'date_of_payment' => optional($payment->date_of_payment)->format('Y-m-d'),
                        ])
                        ->all(),
                ])
                ->all(),
        ]);
    }

    public function storePayment(Request $request, Procurement $procurement)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($procurement->event_id !== $eventId) {
            abort(403, 'This procurement does not belong to the selected event.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'date_of_payment' => ['required', 'date'],
        ]);

        $fallbackSubmitter = Submitter::query()
            ->where('event_id', $eventId)
            ->orderBy('submitter_id')
            ->first();

        if (! $fallbackSubmitter) {
            return back()->withErrors([
                'payment' => 'At least one submitter is required before recording procurement payments.',
            ]);
        }

        Transaction::query()->create([
            'event_id' => $eventId,
            'submitter_id' => $fallbackSubmitter->submitter_id,
            'amount' => $validated['amount'],
            'date_of_payment' => $validated['date_of_payment'],
            'reference_id' => $procurement->procurement_id,
            'reference_type' => 'Procurement',
        ]);

        return to_route('procurements.index');
    }

    public function updatePayment(Request $request, Procurement $procurement, Transaction $transaction)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if (
            $procurement->event_id !== $eventId
            || $transaction->event_id !== $eventId
            || $transaction->reference_type !== 'Procurement'
            || (int) $transaction->reference_id !== (int) $procurement->procurement_id
        ) {
            abort(403, 'This payment does not belong to the procurement.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'date_of_payment' => ['required', 'date'],
        ]);

        $transaction->update([
            'amount' => $validated['amount'],
            'date_of_payment' => $validated['date_of_payment'],
            'reference_id' => $procurement->procurement_id,
            'reference_type' => 'Procurement',
        ]);

        return to_route('procurements.index');
    }

    public function destroyPayment(Procurement $procurement, Transaction $transaction)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if (
            $procurement->event_id !== $eventId
            || $transaction->event_id !== $eventId
            || $transaction->reference_type !== 'Procurement'
            || (int) $transaction->reference_id !== (int) $procurement->procurement_id
        ) {
            abort(403, 'This payment does not belong to the procurement.');
        }

        $transaction->delete();

        return to_route('procurements.index');
    }

    public function store(Request $request)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        Procurement::query()->create($validated + ['event_id' => $eventId]);

        return to_route('procurements.index');
    }

    public function update(Request $request, Procurement $procurement)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($procurement->event_id !== $eventId) {
            abort(403, 'This procurement does not belong to the selected event.');
        }

        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $procurement->update($validated);

        return to_route('procurements.index');
    }

    public function destroy(Procurement $procurement)
    {
        $eventId = $this->selectedEventId();
        if ($eventId && $procurement->event_id !== $eventId) {
            abort(403, 'This procurement does not belong to the selected event.');
        }

        $procurement->delete();

        return to_route('procurements.index');
    }
}
