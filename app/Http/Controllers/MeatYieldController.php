<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesSelectedEvent;
use App\Models\MeatYield;
use App\Models\Participant;
use App\Models\Qurban;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\Formatter;

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
                    'display_meat_yield_summary_public_report' => false,
                ],
            ]);
        }

        $totalPax = max(1, (int) $event->total_pax_distribution);
        $accumulateCows = (bool) $event->accumulate_cows_yield_meat;
        $rows = $this->getQurbansMeatYieldsRecords($event->event_id);
        $summary = $this->getQurbansMeatYieldsSummary($event->event_id, $rows, $totalPax, $accumulateCows);

        $rows = $rows->map(function ($row) use ($summary) {
            $row['one_third'] = $row['qurban_type'] === 'Cow' && $summary['accumulate_one_third_cows']
                ? Formatter::weight($summary['cows']['one_third_total'])
                : Formatter::weight($row['one_third']);

            $row['one_third_portion_per_pax'] = $row['qurban_type'] === 'Cow' && $summary['accumulate_one_third_cows']
                ? Formatter::weight($summary['cows']['one_third_portion_per_pax'])
                : Formatter::weight($row['one_third_portion_per_pax']);

            $row['one_third_pax'] = $row['qurban_type'] === 'Cow' && $summary['accumulate_one_third_cows']
                ? $summary['cows']['one_third_pax_total']
                : $row['one_third_pax'];

            return $row;
        });

        return Inertia::render('Admin/MeatYieldPage', [
            'summary' => $summary,
            'qurbans' => $rows->all(),
            'config' => [
                'accumulate_cows_yield_meat' => $accumulateCows,
                'total_pax_distribution' => $totalPax,
                'display_meat_yield_summary_public_report' => (bool) $event->display_meat_yield_summary_public_report,
            ],
        ]);
    }

    private function getQurbansMeatYieldsSummary(int $eventID, $rows, $totalPax, $accumulateCows)
    {
        $cowRows = $rows->where('qurban_type', 'Cow');
        $cowsEffectiveTotal = (float) $cowRows->sum('meat');

        $sheepRows = $rows->where('qurban_type', 'Sheep');
        $sheepsEffectiveTotal = (float) $sheepRows->sum('meat');
        $sheepsTwoThirdTotal = ($sheepsEffectiveTotal * 2) / 3;

        $cowsOneThirdTotal = $cowsEffectiveTotal / 3;
        $cowsTwoThirdTotal = ($cowsEffectiveTotal * 2) / 3;
        $cowsParticipantCount = Participant::query()
            ->join('qurbans', 'participants.qurban_id', '=', 'qurbans.qurban_id')
            ->where('participants.event_id', $eventID)
            ->where('qurbans.qurban_type', 'Cow')
            ->count();

        $summary = [
            'total_pax' => $totalPax,
            'accumulate_one_third_cows' => $accumulateCows,
            'cows' => [
                'meat_total' => round((float) $cowRows->sum('meat'), 2),
                'bone_total' => round((float) $cowRows->sum('bone'), 2),
                'two_third_total' => round($cowsTwoThirdTotal, 2),
                'two_third_portion_per_pax' => round($cowsTwoThirdTotal / $totalPax, 2),
                'one_third_total' => round($cowsOneThirdTotal, 2),
                'one_third_pax_total' => $cowsParticipantCount,
                'one_third_portion_per_pax' => $cowsParticipantCount > 0
                    ? round($cowsOneThirdTotal / $cowsParticipantCount, 2)
                    : $cowsOneThirdTotal,
            ],
            'sheeps' => [
                'meat_total' => round((float) $sheepRows->sum('meat'), 2),
                'bone_total' => round((float) $sheepRows->sum('bone'), 2),
                'two_third_total' => round($sheepsTwoThirdTotal, 2),
                'two_third_portion_per_pax' => round($sheepsTwoThirdTotal / $totalPax, 2),
                'distribution_rows' => $sheepRows
                    ->map(fn (array $row) => [
                        'qurban_number' => $row['qurban_number'],
                        'one_third' => round(($row['meat'] / 3), 2),
                    ])
                    ->values()
                    ->all(),
            ],
        ];

        return $summary;
    }

    private function getQurbansMeatYieldsRecords(int $eventID)
    {
        $qurbans = Qurban::query()
            ->where('event_id', $eventID)
            ->with(['meatYields', 'participants'])
            ->orderBy('qurban_type')
            ->orderBy('qurban_number')
            ->get();

        return $qurbans->map(function (Qurban $qurban) {
            $bone = (float) $qurban->meatYields->where('status', 'bone')->sum('weigh');
            $meat = (float) $qurban->meatYields->where('status', 'meat')->sum('weigh');
            $meat = $meat < $bone ? $bone : $meat;
            $oneThird = $meat / 3;
            $oneThirdTotalPax = max(1, $qurban->participants->count());
            $oneThirdPortionPerPax = $oneThird / $oneThirdTotalPax;

            return [
                'qurban_id' => $qurban->qurban_id,
                'qurban_number' => $qurban->qurban_number,
                'qurban_type' => $qurban->qurban_type,
                'participant_count' => $qurban->participants->count(),
                'meat' => round($meat, 2),
                'bone' => round($bone, 2),
                'one_third' => $oneThird,
                'one_third_pax' => $oneThirdTotalPax,
                'one_third_portion_per_pax' => $oneThirdPortionPerPax,
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
    }

    public function store(Request $request, Qurban $qurban)
    {
        $eventId = $this->selectedEventId();
        if (! $eventId || $qurban->event_id !== $eventId) {
            abort(403);
        }

        $validated = $request->validate([
            'weigh' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', 'in:meat,bone,insider,skin,head,feet'],
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
            'display_meat_yield_summary_public_report' => ['required', 'boolean'],
        ]);

        $event->update($validated);

        return to_route('meat-yields.index');
    }
}
