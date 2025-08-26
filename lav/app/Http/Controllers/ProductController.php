<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
                    ->orWhere('product_name', 'like', "%{$search}%");
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
                Rule::unique('mst_products', 'product_code')
                    ->whereNull('deleted_at'), // ignore yang sudah soft delete
            ],
            'product_name' => ['required', 'string', 'max:160'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';

        $row = Product::create($validated);

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
        ]);

        $row->update($validated);

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
}
