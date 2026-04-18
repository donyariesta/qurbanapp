<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Procurement;
use App\Models\Qurban;
use App\Models\Submitter;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

trait BuildsQurbanOptions
{
    protected function selectedEventIdForOptions(): ?int
    {
        $year = session('selected_event_year');
        if (! is_numeric($year)) {
            return null;
        }

        return Event::query()->where('year', (int) $year)->value('event_id');
    }

    protected function eventOptions(): array
    {
        return Event::query()
            ->orderByDesc('year')
            ->get()
            ->map(fn (Event $event) => [
                'value' => $event->event_id,
                'label' => (string) $event->year,
            ])
            ->all();
    }

    protected function submitterOptions(): array
    {
        $eventId = $this->selectedEventIdForOptions();

        return Submitter::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->with('event')
            ->orderBy('name')
            ->get()
            ->map(fn (Submitter $submitter) => [
                'value' => $submitter->submitter_id,
                'label' => "{$submitter->name} ({$submitter->event?->year})",
            ])
            ->all();
    }

    protected function qurbanOptions(): array
    {
        $eventId = $this->selectedEventIdForOptions();

        return Qurban::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->with('event')
            ->orderBy('qurban_number')
            ->get()
            ->map(fn (Qurban $qurban) => [
                'value' => $qurban->qurban_id,
                'label' => "Qurban #{$qurban->qurban_number} - {$qurban->qurban_type} ({$qurban->event?->year})",
            ])
            ->all();
    }

    protected function participantOptions(): array
    {
        $eventId = $this->selectedEventIdForOptions();

        return Participant::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->with('event')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(fn (Participant $participant) => [
                'value' => $participant->participant_id,
                'label' => "{$participant->full_name} ({$participant->event?->year})",
            ])
            ->all();
    }

    protected function procurementOptions(): array
    {
        $eventId = $this->selectedEventIdForOptions();

        return Procurement::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->with('event')
            ->orderBy('item')
            ->get()
            ->map(fn (Procurement $procurement) => [
                'value' => $procurement->procurement_id,
                'label' => "{$procurement->item} ({$procurement->event?->year})",
            ])
            ->all();
    }

    protected function transactionOptions(): array
    {
        $eventId = $this->selectedEventIdForOptions();

        return Transaction::query()
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->with('event')
            ->orderByDesc('date_of_payment')
            ->get()
            ->map(fn (Transaction $transaction) => [
                'value' => $transaction->transaction_id,
                'label' => "#{$transaction->transaction_id} ({$transaction->event?->year})",
            ])
            ->all();
    }

    protected function referenceOptions(): array
    {
        return [
            'Submitter' => $this->submitterOptions(),
            'Participant' => $this->participantOptions(),
            'Transaction' => $this->transactionOptions(),
            'Procurement' => $this->procurementOptions(),
        ];
    }

    protected function resolveReference(?string $referenceType, ?int $referenceId): ?Model
    {
        if (! $referenceType || ! $referenceId) {
            return null;
        }

        return match ($referenceType) {
            'Submitter' => Submitter::query()->find($referenceId),
            'Participant' => Participant::query()->find($referenceId),
            'Transaction' => Transaction::query()->find($referenceId),
            'Procurement' => Procurement::query()->find($referenceId),
            default => throw ValidationException::withMessages([
                'reference_type' => 'The selected reference type is invalid.',
            ]),
        };
    }
}
