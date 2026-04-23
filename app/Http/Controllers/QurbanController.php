<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsQurbanOptions;
use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\Qurban;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QurbanController extends Controller
{
    use BuildsQurbanOptions;
    use ResolvesSelectedEvent;

    public function index(): Response
    {
        $eventId = $this->selectedEventId();

        return Inertia::render('Admin/CrudPage', [
            'title' => 'Hewan Qurban',
            'singular' => 'Hewan Qurban',
            'routeName' => 'qurbans',
            'fields' => [
                ['name' => 'qurban_number', 'label' => 'Nomor Qurban', 'type' => 'number', 'required' => true],
                ['name' => 'qurban_type', 'label' => 'Jenis Hewan', 'type' => 'select', 'required' => true, 'options' => [
                    ['value' => 'Cow', 'label' => 'Sapi'],
                    ['value' => 'Sheep', 'label' => 'Domba'],
                ]],
                ['name' => 'qurban_shared_price', 'label' => 'Harga per Peserta', 'type' => 'number', 'required' => true, 'step' => '0.01'],
                ['name' => 'quota', 'label' => 'Quota', 'type' => 'number', 'required' => true],
            ],
            'columns' => [
                ['key' => 'qurban_number', 'label' => 'Nomor Qurban'],
                ['key' => 'qurban_type', 'label' => 'Jenis Hewan'],
                ['key' => 'qurban_shared_price', 'label' => 'Harga per Peserta'],
                ['key' => 'quota', 'label' => 'Quota'],
            ],
            'records' => Qurban::query()
                ->with('event')
                ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
                ->orderBy('qurban_number')
                ->get()
                ->map(fn (Qurban $qurban) => [
                    'id' => $qurban->qurban_id,
                    'qurban_number' => $qurban->qurban_number,
                    'qurban_type' => $qurban->qurban_type,
                    'qurban_shared_price' => $qurban->qurban_shared_price,
                    'quota' => $qurban->quota,
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

        Qurban::query()->create($validated);

        return to_route('qurbans.index');
    }

    public function update(Request $request, Qurban $qurban)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId) {
            return to_route('events.index');
        }

        if ($qurban->event_id !== $eventId) {
            abort(403, 'This qurban does not belong to the selected event.');
        }

        $validated = $this->validateData($request, $qurban);
        $validated['event_id'] = $eventId;

        $qurban->update($validated);

        return to_route('qurbans.index');
    }

    public function destroy(Qurban $qurban)
    {
        $eventId = $this->selectedEventId();
        if ($eventId && $qurban->event_id !== $eventId) {
            abort(403, 'This qurban does not belong to the selected event.');
        }

        $qurban->delete();

        return to_route('qurbans.index');
    }

    private function validateData(Request $request, ?Qurban $qurban = null): array
    {
        $eventId = $this->selectedEventId();

        return $request->validate([
            'qurban_number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('qurbans', 'qurban_number')
                    ->where('event_id', $eventId)
                    ->ignore($qurban?->qurban_id, 'qurban_id'),
            ],
            'qurban_type' => ['required', Rule::in(['Cow', 'Sheep'])],
            'qurban_shared_price' => ['required', 'numeric', 'min:0'],
            'quota' => ['required', 'integer', 'min:1'],
        ]);
    }
}
