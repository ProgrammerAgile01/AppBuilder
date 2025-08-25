<?php

namespace App\Builder\Actions;

use App\Builder\Contracts\ActionContract;
use Illuminate\Http\Request;

class HelloWorldAction implements ActionContract
{
    public function key(): string { return 'hello'; }            // URL key: /vehicles/actions/hello
    public function label(): string { return 'Say Hello'; }      // Nama tombol di UI
    public function position(): string { return 'toolbar'; }     // Muncul di header list
    public function forEntities(): array { return ['vehicles']; } // Hanya di modul vehicles
    public function uiSchema(): array { return ['type' => 'none']; } // Tanpa form/file

    public function handle(Request $request, string $entity): mixed
    {
        // Tempat logika bisnis aksi
        return response()->json([
            'success' => true,
            'message' => "👋 Hello from server! Entity: {$entity}",
        ]);
    }
}
