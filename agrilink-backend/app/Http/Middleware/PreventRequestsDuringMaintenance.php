<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as Middleware;
use Illuminate\Http\Request;

class PreventRequestsDuringMaintenance extends Middleware
{
    protected function shouldPassThrough(Request $request): bool
    {
        return parent::shouldPassThrough($request)
            || $request->is('api/admin/maintenance/disable');
    }
}
