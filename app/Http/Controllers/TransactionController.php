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
        $request = request();
        $validated = $request->validate([
            'submitter_id' => ['nullable', 'integer'],
            'procurement_id' => ['nullable', 'integer'],
            'payment_from' => ['nullable', 'date'],
            'payment_to' => ['nullable', 'date'],
            'cash_flow' => ['nullable', Rule::in(['all', 'cash_in', 'cash_out'])],
            'per_page' => ['nullable', 'integer', 'in:50,100,500,1000,2000'],
        ]);
        $perPage = (int) ($validated['per_page'] ?? 50);
        $cashFlow = $validated['cash_flow'] ?? 'all';
        $submitterOptions = $this->submitterOptions();
        $procurementOptions = $this->procurementOptions();

        $records = Transaction::query()
            ->with('event')
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->when($validated['submitter_id'] ?? null, fn ($query, $value) => $query
                ->where('reference_type', 'Submitter')
                ->where('reference_id', (int) $value))
            ->when($validated['procurement_id'] ?? null, fn ($query, $value) => $query
                ->where('reference_type', 'Procurement')
                ->where('reference_id', (int) $value))
            ->when($validated['payment_from'] ?? null, fn ($query, $value) => $query->whereDate('date_of_payment', '>=', $value))
            ->when($validated['payment_to'] ?? null, fn ($query, $value) => $query->whereDate('date_of_payment', '<=', $value))
            ->when($cashFlow === 'cash_in', fn ($query) => $query->where('amount', '>', 0))
            ->when($cashFlow === 'cash_out', fn ($query) => $query->where('amount', '<', 0))
            ->orderByDesc('date_of_payment')
            ->limit($perPage)
            ->get();

        $submitterMap = Submitter::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->pluck('name', 'submitter_id');
        $procurementMap = Procurement::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->pluck('item', 'procurement_id');

        return Inertia::render('Admin/TransactionPage', [
            'filters' => [
                'submitter_id' => isset($validated['submitter_id']) ? (string) $validated['submitter_id'] : '',
                'procurement_id' => isset($validated['procurement_id']) ? (string) $validated['procurement_id'] : '',
                'payment_from' => $validated['payment_from'] ?? '',
                'payment_to' => $validated['payment_to'] ?? '',
                'cash_flow' => $cashFlow,
                'per_page' => (string) $perPage,
            ],
            'submitterOptions' => $submitterOptions,
            'procurementOptions' => $procurementOptions,
            'records' => $records
                ->map(fn (Transaction $transaction) => [
                    'id' => $transaction->transaction_id,
                    'amount' => $transaction->amount,
                    'date_of_payment' => optional($transaction->date_of_payment)->format('Y-m-d'),
                    'reference_id' => $transaction->reference_id,
                    'reference_type' => $transaction->reference_type,
                    'reference_label' => $transaction->reference_type && $transaction->reference_id
                        ? $this->buildReferenceLabel($transaction, $submitterMap, $procurementMap)
                        : (!empty($transaction->notes) ? $transaction->notes : 'None'),
                ])
                ->all(),
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
            'transaction_option' => ['nullable', Rule::in(['general', 'submitter_payment', 'procurement_payment'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'date_of_payment' => ['required', 'date'],
            'reference_type' => ['nullable', Rule::in(['Submitter', 'Participant', 'Transaction', 'Procurement'])],
            'reference_id' => ['nullable', 'integer'],
            'submitter_id' => ['nullable', 'integer'],
            'procurement_id' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string'],
            'type' => ['nullable', Rule::in(['in', 'out'])],
        ]);
        $mode = $validated['transaction_option'] ?? 'general';

        if ($mode === 'submitter_payment') {
            $validated['reference_type'] = 'Submitter';
            $validated['reference_id'] = $validated['submitter_id'] ?? null;
        }

        if ($mode === 'procurement_payment') {
            $validated['reference_type'] = 'Procurement';
            $validated['reference_id'] = $validated['procurement_id'] ?? null;
            $validated['amount'] = ((float) $validated['amount']) * -1;
        }

        if ($mode === 'general') {
            $validated['amount'] = $validated['type'] == 'out' ? $validated['amount'] * -1 : $validated['amount'];
            unset($validated['type']);
        }
        $validated['reference_type'] = !empty($validated['reference_type']) ? $validated['reference_type'] : null;
        $validated['reference_id'] = !empty($validated['reference_id']) ? $validated['reference_id'] : null;

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

        unset($validated['transaction_option'], $validated['submitter_id'], $validated['procurement_id']);

        return $validated;
    }

    private function buildReferenceLabel(Transaction $transaction, $submitterMap, $procurementMap): string
    {
        if ($transaction->reference_type === 'Submitter') {
            $name = $submitterMap[$transaction->reference_id] ?? null;
            return $name ? "Peserta: {$name}" : "Peserta #{$transaction->reference_id}";
        }

        if ($transaction->reference_type === 'Procurement') {
            $item = $procurementMap[$transaction->reference_id] ?? null;
            return $item ? "Pembelian: {$item}" : "Pembelian #{$transaction->reference_id}";
        }

        return "{$transaction->reference_type} #{$transaction->reference_id}";
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
