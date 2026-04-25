<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Procurement;
use App\Models\Qurban;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\Formatter;

class PublicReportController extends Controller
{
    private const PARTICIPANT_CSV_COLUMNS = [
        'Nama',
        'Alamat',
        'Jenis Qurban',
        'Nomor Qurban',
        'Hewan Qurban',
        'Dibayarkan',
        'Tagihan',
        'Status',
    ];

    public function index(Request $request): Response|StreamedResponse
    {
        $years = Event::query()
            ->orderByDesc('year')
            ->pluck('year')
            ->all();

        $selectedYear = $request->integer('year') ?: ($years[0] ?? null);
        $participantTypeFilter = $request->string('participant_type')->toString();
        $participantQurbanFilter = $request->string('participant_qurban_id')->toString();
        $exportParticipantsCsv = $request->boolean('download_participants_csv');
        $event = $selectedYear
            ? Event::query()->where('year', $selectedYear)->first()
            : null;

        $participants = collect();
        $procurements = collect();
        $summary = [
            'participant_count' => 0,
            'qurban_count' => 0,
            'participant_count_cow' => 0,
            'participant_count_sheep' => 0,
            'qurban_count_cow' => 0,
            'qurban_count_sheep' => 0,
            'total_cash_received' => 0,
            'total_spent' => 0,
            'remaining_cash' => 0,
        ];
        $qurbanNumberOptions = [];
        $meatYieldSummary = null;

        if ($event) {
            $submitterPayments = Transaction::query()
                ->where('event_id', $event->event_id)
                ->where('reference_type', 'Submitter')
                ->selectRaw('reference_id, SUM(amount) as total_paid')
                ->groupBy('reference_id')
                ->pluck('total_paid', 'reference_id');

            $submitterRequired = Participant::query()
                ->join('qurbans', 'participants.qurban_id', '=', 'qurbans.qurban_id')
                ->where('participants.event_id', $event->event_id)
                ->selectRaw('participants.submitter_id, SUM(qurbans.qurban_shared_price) as total_required')
                ->groupBy('participants.submitter_id')
                ->pluck('total_required', 'submitter_id');

            $submitterParticipantCount = Participant::query()
                ->where('event_id', $event->event_id)
                ->selectRaw('submitter_id, COUNT(*) as total_participants')
                ->groupBy('submitter_id')
                ->pluck('total_participants', 'submitter_id');

            $participants = Participant::query()
                ->with(['qurban', 'submitter'])
                ->where('participants.event_id', $event->event_id)
                ->when(
                    in_array($participantTypeFilter, ['Cow', 'Sheep'], true),
                    fn ($query) => $query->whereHas('qurban', fn ($q) => $q->where('qurban_type', $participantTypeFilter))
                )
                ->when(
                    $participantQurbanFilter !== '',
                    fn ($query) => $query->where('participants.qurban_id', (int) $participantQurbanFilter)
                )
                ->join('qurbans', 'participants.qurban_id', '=', 'qurbans.qurban_id')
                ->orderByRaw("CASE WHEN qurbans.qurban_type = 'Cow' THEN 0 ELSE 1 END")
                ->orderBy('qurbans.qurban_number')
                ->orderBy('participants.first_name')
                ->orderBy('participants.last_name')
                ->select('participants.*')
                ->get()
                ->map(function (Participant $participant) use ($submitterPayments, $submitterRequired, $submitterParticipantCount) {
                    $requiredAmount = (float) ($participant->qurban?->qurban_shared_price ?? 0);
                    $submitterId = (int) $participant->submitter_id;
                    $submitterPaid = (float) ($submitterPayments[$submitterId] ?? 0);
                    $participantCount = max(1, (int) ($submitterParticipantCount[$submitterId] ?? 1));
                    $paidAmount = $submitterPaid / $participantCount;
                    $submitterOutstanding = (float) ($submitterRequired[$submitterId] ?? 0) - $submitterPaid;

                    return [
                        'name' => $participant->full_name,
                        'address' => $participant->address,
                        'qurban_type' => $participant->qurban?->qurban_type,
                        'qurban_number' => $participant->qurban?->qurban_number,
                        'linked_qurban' => Formatter::qurbanName($participant->qurban?->qurban_number, $participant->qurban?->qurban_type),
                        'required_amount' => number_format($requiredAmount, 2, '.', ''),
                        'paid_amount' => number_format($paidAmount, 2, '.', ''),
                        'payment_status' => $submitterOutstanding <= 0 && (float) ($submitterRequired[$submitterId] ?? 0) > 0
                            ? 'Paid'
                            : 'Pending',
                    ];
                });

            $qurbanNumberOptions = Qurban::query()
                ->where('event_id', $event->event_id)
                ->orderByRaw("CASE WHEN qurban_type = 'Cow' THEN 0 ELSE 1 END")
                ->orderBy('qurban_number')
                ->get()
                ->map(fn (Qurban $qurban) => [
                    'value' => (string) $qurban->qurban_id,
                    'label' => Formatter::qurbanName($qurban->qurban_number, $qurban->qurban_type),
                ])
                ->values()
                ->all();

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
                'participant_count_cow' => Participant::query()
                    ->join('qurbans', 'participants.qurban_id', '=', 'qurbans.qurban_id')
                    ->where('participants.event_id', $event->event_id)
                    ->where('qurbans.qurban_type', 'Cow')
                    ->count(),
                'participant_count_sheep' => Participant::query()
                    ->join('qurbans', 'participants.qurban_id', '=', 'qurbans.qurban_id')
                    ->where('participants.event_id', $event->event_id)
                    ->where('qurbans.qurban_type', 'Sheep')
                    ->count(),
                'qurban_count' => Qurban::query()
                    ->where('event_id', $event->event_id)
                    ->count(),
                'qurban_count_cow' => Qurban::query()
                    ->where('event_id', $event->event_id)
                    ->where('qurban_type', 'Cow')
                    ->count(),
                'qurban_count_sheep' => Qurban::query()
                    ->where('event_id', $event->event_id)
                    ->where('qurban_type', 'Sheep')
                    ->count(),
                'total_cash_received' => number_format(
                    (float) Transaction::query()
                        ->where('event_id', $event->event_id)
                        ->where('amount', '>', 0)
                        ->sum('amount'),
                    2,
                    '.',
                    ''
                ),
                'total_spent' => number_format(
                    abs((float) Transaction::query()
                        ->where('event_id', $event->event_id)
                        ->where('amount', '<', 0)
                        ->sum('amount')),
                    2,
                    '.',
                    ''
                ),
                'remaining_cash' => number_format(
                    (float) Transaction::query()->where('event_id', $event->event_id)->sum('amount'),
                    2,
                    '.',
                    ''
                ),
            ];

            if ($event->display_meat_yield_summary_public_report) {
                $meatYieldSummary = $this->buildMeatYieldSummary((int) $event->event_id, (int) $event->total_pax_distribution);
            }

            if ($exportParticipantsCsv) {
                return $this->downloadParticipantsCsv($participants, $event->year);
            }
        }

        return Inertia::render('PublicReport', [
            'years' => $years,
            'selectedYear' => $selectedYear,
            'participantFilters' => [
                'participant_type' => in_array($participantTypeFilter, ['Cow', 'Sheep'], true) ? $participantTypeFilter : '',
                'participant_qurban_id' => $participantQurbanFilter,
            ],
            'participantQurbanOptions' => $qurbanNumberOptions,
            'summary' => $summary,
            'participants' => $participants->values()->all(),
            'procurements' => $procurements->values()->all(),
            'showMeatYieldSummary' => (bool) ($event?->display_meat_yield_summary_public_report ?? false),
            'meatYieldSummary' => $meatYieldSummary,
        ]);
    }

    private function downloadParticipantsCsv($participants, int $year): StreamedResponse
    {
        return response()->streamDownload(function () use ($participants) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, self::PARTICIPANT_CSV_COLUMNS);

            foreach ($participants as $participant) {
                fputcsv($handle, [
                    $participant['name'],
                    $participant['address'],
                    $participant['qurban_type'],
                    $participant['qurban_number'],
                    $participant['linked_qurban'],
                    $participant['paid_amount'],
                    $participant['required_amount'],
                    $participant['payment_status'],
                ]);
            }

            fclose($handle);
        }, "participants-{$year}.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function buildMeatYieldSummary(int $eventId, int $totalPaxDistribution): array
    {
        $totalPax = max(1, $totalPaxDistribution);

        $qurbans = Qurban::query()
            ->where('event_id', $eventId)
            ->with('meatYields')
            ->orderByRaw("CASE WHEN qurban_type = 'Cow' THEN 0 ELSE 1 END")
            ->orderBy('qurban_number')
            ->get();

        $rows = $qurbans->map(function (Qurban $qurban) {
            $bone = (float) $qurban->meatYields->where('status', 'bone')->sum('weigh');
            $meat = (float) $qurban->meatYields->where('status', 'meat')->sum('weigh');
            $meat = $meat < $bone ? $bone : $meat;

            return [
                'qurban_type' => $qurban->qurban_type,
                'meat' => $meat,
            ];
        });

        $cowTotal = (float) $rows->where('qurban_type', 'Cow')->sum('meat');
        $sheepTotal = (float) $rows->where('qurban_type', 'Sheep')->sum('meat');
        $cowTwoThird = ($cowTotal * 2) / 3;
        $sheepTwoThird = ($sheepTotal * 2) / 3;

        return [
            'cows' => [
                'effective_total' => round($cowTotal, 2),
                'two_third_total' => round($cowTwoThird, 2),
                'two_third_portion_per_pax' => round($cowTwoThird / $totalPax, 2),
            ],
            'sheeps' => [
                'effective_total' => round($sheepTotal, 2),
                'two_third_total' => round($sheepTwoThird, 2),
                'two_third_portion_per_pax' => round($sheepTwoThird / $totalPax, 2),
            ],
            'total_pax_distribution' => $totalPax,
        ];
    }
}
