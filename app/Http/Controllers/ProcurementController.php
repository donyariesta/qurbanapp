<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Procurement;
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

        return Inertia::render('Admin/CrudPage', [
            'title' => 'Procurements',
            'singular' => 'Procurement',
            'routeName' => 'procurements',
            'fields' => [
                ['name' => 'item', 'label' => 'Item', 'type' => 'text', 'required' => true],
                ['name' => 'price', 'label' => 'Price', 'type' => 'number', 'required' => true, 'step' => '0.01'],
                ['name' => 'quantity', 'label' => 'Quantity', 'type' => 'number', 'required' => true],
                ['name' => 'notes', 'label' => 'Notes', 'type' => 'textarea', 'required' => false],
            ],
            'columns' => [
                ['key' => 'item', 'label' => 'Item'],
                ['key' => 'price', 'label' => 'Price'],
                ['key' => 'quantity', 'label' => 'Quantity'],
                ['key' => 'notes', 'label' => 'Notes'],
            ],
            'records' => Procurement::query()
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
