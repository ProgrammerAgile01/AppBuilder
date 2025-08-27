<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::query();

        // trash filter: none (default) | with | only
        $trash = $request->query('trash', 'none');
        if ($trash === 'with') {
            $q->withTrashed();
        } elseif ($trash === 'only') {
            $q->onlyTrashed();
        }

        if ($search = $request->query('search')) {
            $q->where(function ($w) use ($search) {
                $w->where('product_code', 'like', "%{$search}%")
                    ->orWhere('product_name', 'like', "%{$search}%")
                    ->orWhere('db_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        $rows = $q->orderByDesc('updated_at')->get();

        // (opsional) kirim count trash untuk badge/metrics jika nanti dibutuhkan
        $trashedCount = Product::onlyTrashed()->count();

        return response()->json([
            'success' => true,
            'data' => $rows,
            'meta' => [
                'trashed' => $trashedCount,
            ],
        ]);
    }

    public function show(string $id)
    {
        $row = Product::withTrashed()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $row,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('mst_products', 'product_code')->whereNull('deleted_at'),
            ],
            'product_name' => ['required', 'string', 'max:160'],
            // status tetap opsional
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            // db_name opsional (UI lama tidak mengirim); jika ada, validasi
            'db_name' => ['nullable', 'string', 'max:60', 'regex:/^[A-Za-z0-9_]+$/'],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';

        // Jika db_name tidak dikirim, generate dari product_code
        $dbName = $request->input('db_name');
        if (empty($dbName)) {
            $dbName = $this->generateUniqueDbName($validated['product_code']);
        } else {
            // normalisasi ke format snake (tanpa memaksa lowercase jika tidak diinginkan)
            $dbName = substr(Str::slug($dbName, '_'), 0, 60);
            // pastikan unik juga
            $dbName = $this->ensureDbNameUnique($dbName);
        }

        $row = Product::create([
            'product_code' => strtoupper($validated['product_code']),
            'product_name' => $validated['product_name'],
            'status'       => $validated['status'],
            'db_name'      => $dbName,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created.',
            'data' => $row,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $row = Product::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'product_code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('mst_products', 'product_code')
                    ->ignore($row->id, 'id')
                    ->whereNull('deleted_at'),
            ],
            'product_name' => ['required', 'string', 'max:160'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            'db_name' => ['nullable', 'string', 'max:60', 'regex:/^[A-Za-z0-9_]+$/'],
        ]);

        // Tentukan db_name baru:
        // - Jika dikirim di request → pakai (dinormalisasi & dipastikan unik)
        // - Jika tidak dikirim → pertahankan nilai lama
        $newDbName = $request->input('db_name');
        if ($newDbName !== null && $newDbName !== '') {
            $newDbName = substr(Str::slug($newDbName, '_'), 0, 60);
            // jika berubah dari yang lama, pastikan unik
            if ($newDbName !== $row->db_name) {
                $newDbName = $this->ensureDbNameUnique($newDbName, $row->id);
            }
        } else {
            $newDbName = $row->db_name; // keep existing (tidak memaksa sinkron dengan product_code)
        }

        $payload = [
            'product_code' => strtoupper($validated['product_code']),
            'product_name' => $validated['product_name'],
            'status'       => $validated['status'] ?? $row->status,
            'db_name'      => $newDbName,
        ];

        $row->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'Product updated.',
            'data' => $row,
        ]);
    }

    public function destroy(string $id)
    {
        $row = Product::findOrFail($id);
        $row->delete(); // soft delete

        return response()->json([
            'success' => true,
            'message' => 'Product moved to trash.',
        ]);
    }

    // === extra endpoints untuk modal "Sampah" ===

    public function restore(string $id)
    {
        $row = Product::onlyTrashed()->findOrFail($id);
        $row->restore();

        return response()->json([
            'success' => true,
            'message' => 'Product restored.',
            'data' => $row,
        ]);
    }

    public function forceDelete(string $id)
    {
        $row = Product::onlyTrashed()->findOrFail($id);
        $row->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Product permanently deleted.',
        ]);
    }

    // ======================
    // Helpers db_name
    // ======================

    /**
     * Generate db_name unik dari product_code.
     * Contoh: "RENTVIX PRO" -> "rentvix_pro", maksimal 60 char.
     */
    protected function generateUniqueDbName(string $productCode, ?string $ignoreId = null): string
    {
        $base = substr(Str::slug($productCode, '_'), 0, 60);
        return $this->ensureDbNameUnique($base, $ignoreId);
    }

    /**
     * Pastikan db_name unik (termasuk data yang sudah soft-delete).
     * Jika sudah ada, tambahkan suffix _2, _3, dst.
     */
    protected function ensureDbNameUnique(string $candidate, ?string $ignoreId = null): string
    {
        $name = $candidate ?: 'app';
        $i = 1;

        $exists = Product::withTrashed()
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->where('db_name', $name)
            ->exists();

        while ($exists) {
            $suffix = '_' . (++$i);
            $trim   = 60 - strlen($suffix);
            $name   = substr($candidate, 0, max(1, $trim)) . $suffix;

            $exists = Product::withTrashed()
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->where('db_name', $name)
                ->exists();
        }

        return $name;
    }
}
