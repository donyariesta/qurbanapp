<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Procurement;
use App\Models\Qurban;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicReportController extends Controller
{
    public function index(Request $request): Response
    {
        $years = Event::query()
            ->orderByDesc('year')
            ->pluck('year')
            ->all();

        $selectedYear = $request->integer('year') ?: ($years[0] ?? null);
        $event = $selectedYear
            ? Event::query()->where('year', $selectedYear)->first()
            : null;

        $participants = collect();
        $procurements = collect();
        $summary = [
            'participant_count' => 0,
            'qurban_count' => 0,
            'total_cash' => 0,
        ];

        if ($event) {
            $participantPayments = Transaction::query()
                ->where('event_id', $event->event_id)
                ->where('reference_type', 'Participant')
                ->selectRaw('reference_id, SUM(amount) as total_paid')
                ->groupBy('reference_id')
                ->pluck('total_paid', 'reference_id');

            $participants = Participant::query()
                ->with(['qurban', 'submitter'])
                ->where('event_id', $event->event_id)
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get()
                ->map(function (Participant $participant) use ($participantPayments) {
                    $requiredAmount = (float) ($participant->qurban?->qurban_shared_price ?? 0);
                    $paidAmount = (float) ($participantPayments[$participant->participant_id] ?? 0);

                    return [
                        'name' => $participant->full_name,
                        'address' => $participant->address,
                        'linked_qurban' => $participant->qurban
                            ? "Qurban #{$participant->qurban->qurban_number} - {$participant->qurban->qurban_type}"
                            : '-',
                        'required_amount' => number_format($requiredAmount, 2, '.', ''),
                        'paid_amount' => number_format($paidAmount, 2, '.', ''),
                        'payment_status' => $paidAmount >= $requiredAmount && $requiredAmount > 0
                            ? 'Paid'
                            : 'Pending',
                    ];
                });

            $procurements = Procurement::query()
                ->where('event_id', $event->event_id)
                ->orderBy('item')
                ->get()
                ->map(fn (Procurement $procurement) => [
                    'item' => $procurement->item,
                    'price' => number_format((float) $procurement->price, 2, '.', ''),
                    'quantity' => $procurement->quantity,
                    'notes' => $procurement->notes,
                    'total' => number_format((float) $procurement->price * $procurement->quantity, 2, '.', ''),
                ]);

            $summary = [
                'participant_count' => Participant::query()
                    ->where('event_id', $event->event_id)
                    ->count(),
                'qurban_count' => Qurban::query()
                    ->where('event_id', $event->event_id)
                    ->count(),
                'total_cash' => number_format(
                    (float) Transaction::query()->where('event_id', $event->event_id)->sum('amount'),
                    2,
                    '.',
                    ''
                ),
            ];
        }

        return Inertia::render('PublicReport', [
            'years' => $years,
            'selectedYear' => $selectedYear,
            'summary' => $summary,
            'participants' => $participants->values()->all(),
            'procurements' => $procurements->values()->all(),
        ]);
    }
}
