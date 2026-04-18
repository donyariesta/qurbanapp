<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Participant;
use App\Models\Procurement;
use App\Models\Submitter;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    use BuildsQurbanOptions;
    use ResolvesSelectedEvent;

    public function index(): Response
    {
        $eventId = $this->selectedEventId();

        return Inertia::render('Admin/CrudPage', [
            'title' => 'Transactions',
            'singular' => 'Transaction',
            'routeName' => 'transactions',
            'fields' => [
                ['name' => 'amount', 'label' => 'Amount', 'type' => 'number', 'required' => true, 'step' => '0.01'],
                ['name' => 'date_of_payment', 'label' => 'Date of Payment', 'type' => 'date', 'required' => true],
                ['name' => 'reference_type', 'label' => 'Reference Type', 'type' => 'select', 'required' => false, 'options' => [
                    ['value' => '', 'label' => 'None'],
                    ['value' => 'Submitter', 'label' => 'Submitter'],
                    ['value' => 'Participant', 'label' => 'Participant'],
                    ['value' => 'Transaction', 'label' => 'Transaction'],
                    ['value' => 'Procurement', 'label' => 'Procurement'],
                ]],
                ['name' => 'reference_id', 'label' => 'Reference Record ID', 'type' => 'number', 'required' => false],
            ],
            'columns' => [
                ['key' => 'amount', 'label' => 'Amount'],
                ['key' => 'date_of_payment', 'label' => 'Payment Date'],
                ['key' => 'reference_label', 'label' => 'Reference'],
            ],
            'records' => Transaction::query()
                ->with('event')
                ->orderByDesc('date_of_payment')
                ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
                ->get()
                ->map(fn (Transaction $transaction) => [
                    'id' => $transaction->transaction_id,
                    'event_id' => $transaction->event_id,
                    'amount' => $transaction->amount,
                    'date_of_payment' => optional($transaction->date_of_payment)->format('Y-m-d'),
                    'reference_id' => $transaction->reference_id,
                    'reference_type' => $transaction->reference_type,
                    'reference_label' => $transaction->reference_type && $transaction->reference_id
                        ? "{$transaction->reference_type} #{$transaction->reference_id}"
                        : 'None',
                ])
                ->all(),
            'options' => [],
        ]);
    }

    public function store(Request $request)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $validated = $this->validateData($request);
        $validated['event_id'] = $eventId;

        Transaction::query()->create($validated);

        return to_route('transactions.index');
    }

    public function update(Request $request, Transaction $transaction)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($transaction->event_id !== $eventId) {
            abort(403, 'This transaction does not belong to the selected event.');
        }

        $validated = $this->validateData($request);
        $validated['event_id'] = $eventId;

        $transaction->update($validated);

        return to_route('transactions.index');
    }

    public function destroy(Transaction $transaction)
    {
        $eventId = $this->selectedEventId();
        if ($eventId && $transaction->event_id !== $eventId) {
            abort(403, 'This transaction does not belong to the selected event.');
        }

        $transaction->delete();

        return to_route('transactions.index');
    }

    public function storeForSubmitter(Request $request, Submitter $submitter)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($submitter->event_id !== $eventId) {
            abort(403, 'This submitter does not belong to the selected event.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'date_of_payment' => ['required', 'date'],
        ]);

        Transaction::query()->create([
            'event_id' => $eventId,
            'amount' => $validated['amount'],
            'date_of_payment' => $validated['date_of_payment'],
            'reference_id' => $submitter->submitter_id,
            'reference_type' => 'Submitter',
        ]);

        return to_route('submitters.show', $submitter);
    }

    public function updateForSubmitter(Request $request, Submitter $submitter, Transaction $transaction)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($submitter->event_id !== $eventId) {
            abort(403, 'This submitter does not belong to the selected event.');
        }

        if (
            $transaction->event_id !== $eventId
            || $transaction->reference_type !== 'Submitter'
            || (int) $transaction->reference_id !== (int) $submitter->submitter_id
        ) {
            abort(403, 'This payment does not belong to the submitter.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'date_of_payment' => ['required', 'date'],
        ]);

        $transaction->update([
            'amount' => $validated['amount'],
            'date_of_payment' => $validated['date_of_payment'],
            'reference_id' => $submitter->submitter_id,
            'reference_type' => 'Submitter',
        ]);

        return to_route('submitters.show', $submitter);
    }

    public function destroyForSubmitter(Submitter $submitter, Transaction $transaction)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if (
            $transaction->event_id !== $eventId
            || $transaction->reference_type !== 'Submitter'
            || (int) $transaction->reference_id !== (int) $submitter->submitter_id
        ) {
            abort(403, 'This payment does not belong to the submitter.');
        }

        $transaction->delete();

        return to_route('submitters.show', $submitter);
    }

    private function validateData(Request $request): array
    {
        $eventId = $this->selectedEventId();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'date_of_payment' => ['required', 'date'],
            'reference_type' => ['nullable', Rule::in(['Submitter', 'Participant', 'Transaction', 'Procurement'])],
            'reference_id' => ['nullable', 'integer'],
        ]);

        $validated['reference_type'] = $validated['reference_type'] ?: null;
        $validated['reference_id'] = $validated['reference_id'] ?: null;

        if (($validated['reference_type'] && ! $validated['reference_id']) || (! $validated['reference_type'] && $validated['reference_id'])) {
            throw ValidationException::withMessages([
                'reference_id' => 'Reference type and reference record ID must be filled together.',
            ]);
        }

        $reference = $this->resolveReference($validated['reference_type'], $validated['reference_id']);

        if ($reference && (int) $reference->getAttribute('event_id') !== (int) $eventId) {
            throw ValidationException::withMessages([
                'reference_id' => 'The selected reference does not belong to the selected event.',
            ]);
        }

        return $validated;
    }

    protected function resolveReference(?string $type, ?int $id)
    {
        if (! $type || ! $id) {
            return null;
        }

        return match ($type) {
            'Submitter' => Submitter::query()->find($id),
            'Participant' => Participant::query()->find($id),
            'Procurement' => Procurement::query()->find($id),
            'Transaction' => Transaction::query()->find($id),
            default => null,
        };
    }
}
