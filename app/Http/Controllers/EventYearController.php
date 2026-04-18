<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventYearController extends Controller
{
    public function set(Request $request, int $year)
    {
        // $request->validate([
        //     'year' => ['required', 'integer', 'exists:events,year'],
        // ]);

        $event = Event::query()->where('year', $year)->firstOrFail();

        $request->session()->put('selected_event_year', $event->year);

        return redirect()->back();
    }
}

