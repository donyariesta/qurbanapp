<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\MeatYield;
use App\Models\Participant;
use App\Models\Qurban;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeatYieldController extends Controller
{
    use ResolvesSelectedEvent;

    public function index(): Response
    {
        $event = $this->selectedEvent();
        if (! $event) {
            return Inertia::render('Admin/MeatYieldPage', [
                'summary' => [],
                'qurbans' => [],
                'config' => [
                    'accumulate_cows_yield_meat' => false,
                    'total_pax_distribution' => 1,
                ],
            ]);
        }

        $qurbans = Qurban::query()
            ->where('event_id', $event->event_id)
            ->with(['meatYields', 'participants'])
            ->orderBy('qurban_number')
            ->get();

        $totalPax = max(1, (int) $event->total_pax_distribution);
        $accumulateCows = (bool) $event->accumulate_cows_yield_meat;

        $rows = $qurbans->map(function (Qurban $qurban) use ($accumulateCows) {
            $gross = (float) $qurban->meatYields->where('status', 'gross')->sum('weigh');
            $net = (float) $qurban->meatYields->where('status', 'net')->sum('weigh');
            $effective = $net > 0 ? $net : $gross;
            $oneThird = $effective / 3;
            $participantCount = max(1, $qurban->participants->count());
            $portionPerParticipant = $qurban->qurban_type === 'Cow' && $accumulateCows
                ? null
                : $oneThird / $participantCount;

            return [
                'qurban_id' => $qurban->qurban_id,
                'qurban_number' => $qurban->qurban_number,
                'qurban_type' => $qurban->qurban_type,
                'participant_count' => $qurban->participants->count(),
                'gross_total' => round($gross, 2),
                'net_total' => round($net, 2),
                'effective_total' => round($effective, 2),
                'one_third' => round($oneThird, 2),
                'portion_per_participant' => $portionPerParticipant !== null ? round($portionPerParticipant, 2) : null,
                'details' => $qurban->meatYields
                    ->sortByDesc('weighing_sequence')
                    ->values()
                    ->map(fn (MeatYield $meatYield) => [
                        'meat_yield_id' => $meatYield->meat_yield_id,
                        'weighing_sequence' => $meatYield->weighing_sequence,
                        'weigh' => $meatYield->weigh,
                        'status' => $meatYield->status,
                        'created_at' => optional($meatYield->created_at)->format('Y-m-d H:i:s'),
                    ])
                    ->all(),
            ];
        })->values();

        $cowRows = $rows->where('qurban_type', 'Cow');
        $sheepRows = $rows->where('qurban_type', 'Sheep');
        $cowsEffectiveTotal = (float) $cowRows->sum('effective_total');
        $cowsOneThird = $cowsEffectiveTotal / 3;
        $cowsTwoThird = ($cowsEffectiveTotal * 2) / 3;
        $cowsParticipantCount = Participant::query()
            ->join('qurbans', 'participants.qurban_id', '=', 'qurbans.qurban_id')
            ->where('participants.event_id', $event->event_id)
            ->where('qurbans.qurban_type', 'Cow')
            ->count();

        $summary = [
            'cows' => [
                'gross_total' => round((float) $cowRows->sum('gross_total'), 2),
                'net_total' => round((float) $cowRows->sum('net_total'), 2),
                'distribution_two_thirds' => round($cowsTwoThird, 2),
                'portion_per_pax' => round($cowsTwoThird / $totalPax, 2),
                'participant_one_third_total' => round($cowsOneThird, 2),
                'participant_portion' => $accumulateCows && $cowsParticipantCount > 0
                    ? round($cowsOneThird / $cowsParticipantCount, 2)
                    : null,
            ],
            'sheeps' => [
                'gross_total' => round((float) $sheepRows->sum('gross_total'), 2),
                'net_total' => round((float) $sheepRows->sum('net_total'), 2),
                'distribution_rows' => $sheepRows
                    ->map(fn (array $row) => [
                        'qurban_number' => $row['qurban_number'],
                        'distribution_two_thirds' => round(($row['effective_total'] * 2) / 3, 2),
                        'portion_per_pax' => round((($row['effective_total'] * 2) / 3) / $totalPax, 2),
                    ])
                    ->values()
                    ->all(),
            ],
        ];

        return Inertia::render('Admin/MeatYieldPage', [
            'summary' => $summary,
            'qurbans' => $rows->all(),
            'config' => [
                'accumulate_cows_yield_meat' => $accumulateCows,
                'total_pax_distribution' => $totalPax,
            ],
        ]);
    }

    public function store(Request $request, Qurban $qurban)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId || $qurban->event_id !== $eventId) {
            abort(403);
        }

        $validated = $request->validate([
            'weigh' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', 'in:gross,net'],
        ]);

        $nextSequence = (int) MeatYield::query()
            ->where('qurban_id', $qurban->qurban_id)
            ->max('weighing_sequence') + 1;

        MeatYield::query()->create([
            'qurban_id' => $qurban->qurban_id,
            'weighing_sequence' => $nextSequence,
            'weigh' => $validated['weigh'],
            'status' => $validated['status'],
        ]);

        return to_route('meat-yields.index');
    }

    public function reset(Qurban $qurban)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId || $qurban->event_id !== $eventId) {
            abort(403);
        }

        MeatYield::query()->where('qurban_id', $qurban->qurban_id)->delete();

        return to_route('meat-yields.index');
    }

    public function updateConfig(Request $request)
    {
        $event = $this->selectedEvent();
        if (! $event) {
            return to_route('events.index');
        }

        $validated = $request->validate([
            'accumulate_cows_yield_meat' => ['required', 'boolean'],
            'total_pax_distribution' => ['required', 'integer', 'min:1'],
        ]);

        $event->update($validated);

        return to_route('meat-yields.index');
    }
}
