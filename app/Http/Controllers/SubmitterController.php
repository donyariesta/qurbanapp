<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Participant;
use App\Models\Submitter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubmitterController extends Controller
{
    use BuildsQurbanOptions;
    use ResolvesSelectedEvent;

    public function index(): Response
    {
        $eventId = $this->selectedEventId();

        return Inertia::render('Admin/CrudPage', [
            'title' => 'Submitters',
            'singular' => 'Submitter',
            'routeName' => 'submitters',
            'detailRouteName' => 'submitters',
            'fields' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                ['name' => 'address', 'label' => 'Address', 'type' => 'textarea', 'required' => true],
                ['name' => 'phone_number', 'label' => 'Phone Number', 'type' => 'text', 'required' => true],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'phone_number', 'label' => 'Phone'],
                ['key' => 'address', 'label' => 'Address'],
            ],
            'records' => Submitter::query()
                ->with('event')
                ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
                ->orderBy('name')
                ->get()
                ->map(fn (Submitter $submitter) => [
                    'id' => $submitter->submitter_id,
                    'name' => $submitter->name,
                    'address' => $submitter->address,
                    'phone_number' => $submitter->phone_number,
                ])
                ->all(),
            'options' => [],
        ]);
    }

    public function show(Submitter $submitter): Response|RedirectResponse
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($submitter->event_id !== $eventId) {
            abort(403, 'This submitter does not belong to the selected event.');
        }

        return Inertia::render('Admin/SubmitterDetail', [
            'submitter' => [
                'id' => $submitter->submitter_id,
                'name' => $submitter->name,
                'address' => $submitter->address,
                'phone_number' => $submitter->phone_number,
            ],
            'participants' => Participant::query()
                ->with('qurban')
                ->where('event_id', $eventId)
                ->where('submitter_id', $submitter->submitter_id)
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get()
                ->map(fn (Participant $participant) => [
                    'id' => $participant->participant_id,
                    'first_name' => $participant->first_name,
                    'last_name' => $participant->last_name,
                    'full_name' => $participant->full_name,
                    'address' => $participant->address,
                    'qurban_id' => $participant->qurban_id,
                    'qurban_label' => $participant->qurban
                        ? "Qurban #{$participant->qurban->qurban_number} - {$participant->qurban->qurban_type}"
                        : '-',
                ])
                ->all(),
            'qurbanOptions' => $this->qurbanOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone_number' => ['required', 'string', 'max:30'],
        ]);

        Submitter::query()->create($validated + ['event_id' => $eventId]);

        return to_route('submitters.index');
    }

    public function update(Request $request, Submitter $submitter)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone_number' => ['required', 'string', 'max:30'],
        ]);

        if ($submitter->event_id !== $eventId) {
            abort(403, 'This submitter does not belong to the selected event.');
        }

        $submitter->update($validated);

        return to_route('submitters.index');
    }

    public function destroy(Submitter $submitter)
    {
        $eventId = $this->selectedEventId();
        if ($eventId && $submitter->event_id !== $eventId) {
            abort(403, 'This submitter does not belong to the selected event.');
        }

        $submitter->delete();

        return to_route('submitters.index');
    }
}
