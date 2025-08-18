<?php

namespace App\Http\Controllers;

use App\Models\Modules;
use Illuminate\Http\Request;

class ModulesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $modules = Modules::withoutTrashed()->orderByDesc('created_at')->get(); // buat paginasi

            return response()->json([
                'success'=> true,
                'message' => 'Menampilkan data modules',
                'data' => $modules
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => 'Gagal menampilkan data modules ' . $e->getMessage(),
            ], 500);
        }
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
        try {
            $validated = $request->validate([
                'name'         => 'required|string|max:255',
                'menu_title'   => 'required|string|max:255',
                // 'table_name'   => 'required|string|max:255',
                'description'  => 'nullable|string',
                'status'       => 'in:draft,published,archived',
                'created_by'   => 'nullable|string',
                // 'module_group' => 'nullable|string',
            ]);

            // $modules = Modules::create(array_merge($validated, [
            //     'total_categories' => 0,
            //     'total_columns'    => 0,
            //     'total_stats'      => 0,
            // ]));

            $modules = Modules::create([
                ...$validated,
                // 'created_by'       => auth()->id(), // dari user login
                'created_at'       => now(), // waktu buat
                'total_categories' => 0,
                'total_columns'    => 0,
                'total_stats'      => 0,
                // 'updated_at'       => null, // <== PENTING agar saat create kosong
                // 'updated_by'       => null,
            ]);

            $modules->updated_at = null;
            $modules->updated_by = null;
            $modules->save();

            return response()->json([
                'success'=> true,
                'message' => 'Berhasil menambah data modules',
                'data' => $modules
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => 'Gagal menambah data modules ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $modules = Modules::findOrFail($id);
            return response()->json([
                'success'=> true,
                'message' => 'Berhasil menampilkan data by id ' . $id,
                'data' => $modules
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => 'Gagal menampilkan data modules by id ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Modules $modules)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $modules = Modules::findOrFail($id);

            $validated = $request->validate([
                'name'         => 'required|string|max:255',
                'menu_title'   => 'required|string|max:255',
                // 'table_name'   => 'required|string|max:255',
                'description'  => 'nullable|string',
                'status'       => 'in:draft,published,archived',
                'updated_by'   => 'nullable|string',
                // 'module_group' => 'nullable|string',
            ]);

            // $modules->update($validated);
            $modules->fill($validated);
            $modules->updated_at = now();
            $modules->updated_by = 'admin';
            // $modules->updated_by = auth()->id(); dari user login
            $modules->save();

            return response()->json([
                'success'=> true,
                'message' => 'Berhasil update data modules',
                'data' => $modules
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => 'Gagal update data modules ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $modules = Modules::findOrFail($id);
            // $modules->deleted_by = auth()->id(); user login
            $modules->deleted_by = 'admin'; // default
            $modules->save();

            $modules->delete();

            return response()->json([
                'success'=> true,
                'message' => 'Berhasil hapus data modules sementara',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => 'Gagal hapus data modules ' . $e->getMessage(),
            ], 500);
        }
    }

    public function restore($id)
    {
        $modules = Modules::withTrashed()->findOrFail($id);
        $modules->deleted_by = null;
        $modules->save();

        $modules->restore();

        return response()->json([
            'success' => true,
            'message' => 'Modules berhasil dikembalikan',
        ], 200);
    }

    // public function forceDelete($id)
    // {
    //     $module = Modules::withTrashed()->findOrFail($id);

    //     $module->forceDelete(); // HAPUS PERMANEN

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Modul berhasil dihapus permanen.',
    //     ]);
    // }

    public function totalModules()
    {
        try {
            $modules = Modules::count();

            return response()->json([
                'success'=> true,
                'message' => 'Total data modules: ' . $modules,
                'total' => $modules
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => 'Gagal melihat total data modules ' . $e->getMessage(),
            ], 500);
        }
    }
}
