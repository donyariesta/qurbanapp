<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Participant;
use App\Models\Qurban;
use App\Models\Submitter;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    use BuildsQurbanOptions;
    use ResolvesSelectedEvent;

    public function index(): Response
    {
        $eventId = $this->selectedEventId();

        return Inertia::render('Admin/CrudPage', [
            'title' => 'Participants',
            'singular' => 'Participant',
            'routeName' => 'participants',
            'fields' => [
                ['name' => 'submitter_id', 'label' => 'Submitter', 'type' => 'select', 'required' => true, 'optionsKey' => 'submitters'],
                ['name' => 'qurban_id', 'label' => 'Qurban', 'type' => 'select', 'required' => true, 'optionsKey' => 'qurbans'],
                ['name' => 'first_name', 'label' => 'First Name', 'type' => 'text', 'required' => true],
                ['name' => 'last_name', 'label' => 'Last Name', 'type' => 'text', 'required' => true],
                ['name' => 'address', 'label' => 'Address', 'type' => 'textarea', 'required' => true],
            ],
            'columns' => [
                ['key' => 'full_name', 'label' => 'Name'],
                ['key' => 'submitter_name', 'label' => 'Submitter'],
                ['key' => 'qurban_label', 'label' => 'Linked Qurban'],
                ['key' => 'address', 'label' => 'Address'],
            ],
            'records' => Participant::query()
                ->with(['event', 'submitter', 'qurban'])
                ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get()
                ->map(fn (Participant $participant) => [
                    'id' => $participant->participant_id,
                    'submitter_id' => $participant->submitter_id,
                    'qurban_id' => $participant->qurban_id,
                    'first_name' => $participant->first_name,
                    'last_name' => $participant->last_name,
                    'full_name' => $participant->full_name,
                    'submitter_name' => $participant->submitter?->name,
                    'qurban_label' => $participant->qurban ? "Qurban #{$participant->qurban->qurban_number} - {$participant->qurban->qurban_type}" : null,
                    'address' => $participant->address,
                ])
                ->all(),
            'options' => [
                'submitters' => $this->submitterOptions(),
                'qurbans' => $this->qurbanOptions(),
            ],
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

        $validated = $this->validateData($request);
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

    private function validateData(Request $request): array
    {
        $eventId = $this->selectedEventId();

        $validated = $request->validate([
            'submitter_id' => ['required', 'exists:submitters,submitter_id'],
            'qurban_id' => ['required', 'exists:qurbans,qurban_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
        ]);

        $submitter = Submitter::query()->findOrFail($validated['submitter_id']);
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

        return $validated;
    }
}
