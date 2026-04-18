<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/CrudPage', [
            'title' => 'Events',
            'singular' => 'Event',
            'routeName' => 'events',
            'fields' => [
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'required' => true],
            ],
            'columns' => [
                ['key' => 'year', 'label' => 'Year'],
            ],
            'records' => Event::query()
                ->orderByDesc('year')
                ->get()
                ->map(fn (Event $event) => [
                    'id' => $event->event_id,
                    'year' => $event->year,
                ])
                ->all(),
            'options' => [],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'digits:4', 'min:2000', 'max:9999', 'unique:events,year'],
        ]);

        Event::query()->create($validated);

        return to_route('events.index');
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'year' => [
                'required',
                'integer',
                'digits:4',
                'min:2000',
                'max:9999',
                Rule::unique('events', 'year')->ignore($event->event_id, 'event_id'),
            ],
        ]);

        $event->update($validated);

        return to_route('events.index');
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return to_route('events.index');
    }
}
