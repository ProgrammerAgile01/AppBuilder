<?php

namespace App\Http\Controllers;

use App\Models\TemplateFrontend;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TemplateFrontendController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $q = TemplateFrontend::query();

        // trash filter: none (default) | with | only
        $trash = $request->query('trash', 'none');
        if ($trash === 'with') {
            $q->withTrashed();
        } elseif ($trash === 'only') {
            $q->onlyTrashed();
        }

        if ($search = $request->query('search')) {
            $q->where(function ($w) use ($search) {
                $w->where('template_code', 'like', "%{$search}%")
                    ->orWhere('template_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        $rows = $q->orderByDesc('updated_at')->get();

        // (opsional) kirim count trash untuk badge/metrics jika nanti dibutuhkan
        $trashedCount = TemplateFrontend::onlyTrashed()->count();

        return response()->json([
            'success' => true,
            'data' => $rows,
            'meta' => [
                'trashed' => $trashedCount,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'template_code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('mst_template_frontend', 'template_code')
                    ->whereNull('deleted_at'), // ignore yang sudah soft delete
            ],
            'template_name' => ['required', 'string', 'max:160'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';

        $row = TemplateFrontend::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template frontend created.',
            'data' => $row,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $row = TemplateFrontend::withTrashed()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $row,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TemplateFrontend $templateFrontend)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $row = TemplateFrontend::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'template_code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('mst_template_frontend', 'template_code')
                    ->ignore($row->id, 'id')
                    ->whereNull('deleted_at'),
            ],
            'template_name' => ['required', 'string', 'max:160'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
        ]);

        $row->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template frontend updated.',
            'data' => $row,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $row = TemplateFrontend::findOrFail($id);
        $row->delete(); // soft delete

        return response()->json([
            'success' => true,
            'message' => 'Template frontend moved to trash.',
        ]);
    }

    public function restore(string $id)
    {
        $row = TemplateFrontend::onlyTrashed()->findOrFail($id);
        $row->restore();

        return response()->json([
            'success' => true,
            'message' => 'Template frontend restored.',
            'data' => $row,
        ]);
    }

    public function forceDelete(string $id)
    {
        $row = TemplateFrontend::onlyTrashed()->findOrFail($id);
        $row->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Template frontend permanently deleted.',
        ]);
    }
}
