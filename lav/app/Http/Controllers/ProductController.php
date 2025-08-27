<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\TemplateFrontend;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::with('template');

        // trash filter: none|with|only
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
        $row = Product::withTrashed()->with('template')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $row,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code' => [
                'required', 'string', 'max:64',
                Rule::unique('mst_products', 'product_code')->whereNull('deleted_at'),
            ],
            'product_name' => ['required', 'string', 'max:160'],
            'status'       => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            'db_name'      => ['nullable', 'string', 'max:60', 'regex:/^[A-Za-z0-9_]+$/'],
            'template_id'  => ['nullable', 'uuid', Rule::exists('mst_template_frontend', 'id')->whereNull('deleted_at')],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';

        // handle db_name
        $dbName = $request->input('db_name');
        if (empty($dbName)) {
            $dbName = $this->generateUniqueDbName($validated['product_code']);
        } else {
            $dbName = substr(Str::slug($dbName, '_'), 0, 60);
            $dbName = $this->ensureDbNameUnique($dbName);
        }

        // siapkan template_code bila ada template_id
        $templateCode = null;
        if (!empty($validated['template_id'])) {
            $templateCode = TemplateFrontend::where('id', $validated['template_id'])->value('template_code');
        }

        $row = Product::create([
            'product_code' => strtoupper($validated['product_code']),
            'product_name' => $validated['product_name'],
            'status'       => $validated['status'],
            'db_name'      => $dbName,
            'template_id'  => $validated['template_id'] ?? null,
            'template_code'=> $templateCode, // salin kode template (denormalized)
        ])->load('template');

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
                'required', 'string', 'max:64',
                Rule::unique('mst_products', 'product_code')->ignore($row->id, 'id')->whereNull('deleted_at'),
            ],
            'product_name' => ['required', 'string', 'max:160'],
            'status'       => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            'db_name'      => ['nullable', 'string', 'max:60', 'regex:/^[A-Za-z0-9_]+$/'],
            'template_id'  => ['nullable', 'uuid', Rule::exists('mst_template_frontend', 'id')->whereNull('deleted_at')],
        ]);

        // db_name
        $newDbName = $request->input('db_name');
        if ($newDbName !== null && $newDbName !== '') {
            $newDbName = substr(Str::slug($newDbName, '_'), 0, 60);
            if ($newDbName !== $row->db_name) {
                $newDbName = $this->ensureDbNameUnique($newDbName, $row->id);
            }
        } else {
            $newDbName = $row->db_name;
        }

        // Tetapkan template_code sesuai template_id baru
        $templateCode = $row->template_code; // default: pertahankan
        if (array_key_exists('template_id', $validated)) {
            if (!empty($validated['template_id'])) {
                $templateCode = TemplateFrontend::where('id', $validated['template_id'])->value('template_code');
            } else {
                // FE bisa kirim kosong → lepas relasi
                $templateCode = null;
            }
        }

        $payload = [
            'product_code' => strtoupper($validated['product_code']),
            'product_name' => $validated['product_name'],
            'status'       => $validated['status'] ?? $row->status,
            'db_name'      => $newDbName,
            'template_id'  => $validated['template_id'] ?? null,
            'template_code'=> $templateCode,
        ];

        $row->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'Product updated.',
            'data' => $row->load('template'),
        ]);
    }

    public function destroy(string $id)
    {
        $row = Product::findOrFail($id);
        $row->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product moved to trash.',
        ]);
    }

    public function restore(string $id)
    {
        $row = Product::onlyTrashed()->findOrFail($id);
        $row->restore();

        return response()->json([
            'success' => true,
            'message' => 'Product restored.',
            'data' => $row->load('template'),
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
     */
    protected function generateUniqueDbName(string $productCode, ?string $ignoreId = null): string
    {
        $base = substr(Str::slug($productCode, '_'), 0, 60);
        return $this->ensureDbNameUnique($base, $ignoreId);
    }

    /**
     * Pastikan db_name unik (termasuk soft-deleted).
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
