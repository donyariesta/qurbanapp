<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Participant;
use App\Models\Qurban;
use App\Models\Submitter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ParticipantController extends Controller
{
    use BuildsQurbanOptions;
    use ResolvesSelectedEvent;

    public function index(): RedirectResponse
    {
        return to_route('submitters.index');
    }

    public function store(Request $request)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $validated = $this->validateData($request);
        $validated['event_id'] = $eventId;

        Participant::query()->create($validated);

        return to_route('participants.index');
    }

    public function update(Request $request, Participant $participant)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($participant->event_id !== $eventId) {
            abort(403, 'This participant does not belong to the selected event.');
        }

        $validated = $this->validateData($request, $participant);
        $validated['event_id'] = $eventId;

        $participant->update($validated);

        return to_route('participants.index');
    }

    public function destroy(Participant $participant)
    {
        $eventId = $this->selectedEventId();
        if ($eventId && $participant->event_id !== $eventId) {
            abort(403, 'This participant does not belong to the selected event.');
        }

        $participant->delete();

        return to_route('participants.index');
    }

    public function storeForSubmitter(Request $request, Submitter $submitter)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $this->assertSubmitterBelongsToEvent($submitter, $eventId);

        $validated = $this->validateData($request, null, $submitter);
        $validated['event_id'] = $eventId;
        $validated['submitter_id'] = $submitter->submitter_id;

        Participant::query()->create($validated);

        return to_route('submitters.show', $submitter);
    }

    public function updateForSubmitter(Request $request, Submitter $submitter, Participant $participant)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $this->assertSubmitterBelongsToEvent($submitter, $eventId);
        $this->assertParticipantBelongsToSubmitter($participant, $submitter, $eventId);

        $validated = $this->validateData($request, $participant, $submitter);
        $validated['event_id'] = $eventId;
        $validated['submitter_id'] = $submitter->submitter_id;

        $participant->update($validated);

        return to_route('submitters.show', $submitter);
    }

    public function destroyForSubmitter(Submitter $submitter, Participant $participant)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $this->assertSubmitterBelongsToEvent($submitter, $eventId);
        $this->assertParticipantBelongsToSubmitter($participant, $submitter, $eventId);

        $participant->delete();

        return to_route('submitters.show', $submitter);
    }

    private function validateData(Request $request, ?Participant $participant = null, ?Submitter $submitter = null): array
    {
        $eventId = $this->selectedEventId();

        $validated = $request->validate([
            'qurban_id' => ['required', 'exists:qurbans,qurban_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string'],
        ]);

        $submitter = $submitter ?? Submitter::query()->findOrFail($request->input('submitter_id'));
        $qurban = Qurban::query()->findOrFail($validated['qurban_id']);

        if (! $eventId || $submitter->event_id !== (int) $eventId) {
            throw ValidationException::withMessages([
                'submitter_id' => 'The selected submitter does not belong to the selected event.',
            ]);
        }

        if (! $eventId || $qurban->event_id !== (int) $eventId) {
            throw ValidationException::withMessages([
                'qurban_id' => 'The selected qurban does not belong to the selected event.',
            ]);
        }

        $participantCount = Participant::query()
            ->where('qurban_id', $qurban->qurban_id)
            ->when($participant, fn ($query) => $query->where('participant_id', '!=', $participant->participant_id))
            ->count();

        if ($participantCount >= (int) $qurban->quota) {
            throw ValidationException::withMessages([
                'qurban_id' => 'The selected qurban quota is already full.',
            ]);
        }

        return $validated;
    }

    private function assertSubmitterBelongsToEvent(Submitter $submitter, int $eventId): void
    {
        if ($submitter->event_id !== $eventId) {
            abort(403, 'This submitter does not belong to the selected event.');
        }
    }

    private function assertParticipantBelongsToSubmitter(Participant $participant, Submitter $submitter, int $eventId): void
    {
        if ($participant->event_id !== $eventId || $participant->submitter_id !== $submitter->submitter_id) {
            abort(403, 'This participant does not belong to the selected submitter.');
        }
    }
}
