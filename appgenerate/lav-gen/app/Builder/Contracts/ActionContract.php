<?php

namespace App\Builder\Contracts;

use Illuminate\Http\Request;

interface ActionContract
{
    public function key(): string;          // Kunci unik aksi, dipakai di URL: /{entity}/actions/{key}
    public function label(): string;        // label yang ditampilkan di UI (mis: "Say Hello")
    public function position(): string;     // toolbar | row | bulk | detail
    public function forEntities(): array;   // ['*'] atau ['kendaraans']

    /**
     * uiSchema:
     * - type: 'none' | 'file' | 'form'
     * - method?: 'GET' | 'POST'
     * - download?: 'stream' (untuk GET download)
     * - fields?: [{ name,label,input,placeholder }]
     * - accept?: '.csv' (untuk type=file)
     */
    public function uiSchema(): array;

    public function handle(Request $request, string $entity): mixed;
    // Fungsi eksekusi saat tombol diklik (logikamu taruh di sini
}
