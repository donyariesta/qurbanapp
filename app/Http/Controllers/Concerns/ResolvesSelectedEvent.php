<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Event;

trait ResolvesSelectedEvent
{
    protected function selectedEventYear(): ?int
    {
        $year = session('selected_event_year');

        return is_numeric($year) ? (int) $year : null;
    }

    protected function selectedEvent(): ?Event
    {
        $year = $this->selectedEventYear();
        if (! $year) {
            return null;
        }

        return Event::query()->where('year', $year)->first();
    }

    protected function selectedEventId(): ?int
    {
        return $this->selectedEvent()?->event_id;
    }
}

