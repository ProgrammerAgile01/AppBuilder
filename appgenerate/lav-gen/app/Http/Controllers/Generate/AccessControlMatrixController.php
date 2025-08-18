<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\AccessControlMatrix;
use Illuminate\Http\Request;

class AccessControlMatrixController extends Controller
{
    public function index()
    {
        try {
            $accesscontrolmatrix = AccessControlMatrix::orderByDesc('updated_at')->get();

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data AccessControlMatrix",
                'data' => $accesscontrolmatrix,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data AccessControlMatrix " . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $accesscontrolmatrix = AccessControlMatrix::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data AccessControlMatrix dari id: $id",
                'data' => $accesscontrolmatrix,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data AccessControlMatrix dari id: $id " . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_level_id' => 'required|exists:level_user,id',
            'menu_id' => 'required|exists:menu_id,id',
            'view' => 'nullable',
            'add' => 'nullable',
            'edit' => 'nullable',
            'delete' => 'nullable',
            'approve' => 'nullable',

        ]);


        $data['user_level_id'] = $validated['user_level_id'] ?? null;
        $data['menu_id'] = $validated['menu_id'] ?? null;
        $data['view'] = $validated['view'] ?? null;
        $data['add'] = $validated['add'] ?? null;
        $data['edit'] = $validated['edit'] ?? null;
        $data['delete'] = $validated['delete'] ?? null;
        $data['approve'] = $validated['approve'] ?? null;


        return AccessControlMatrix::create($data);
    }

    public function update(Request $request, $id)
    {
        $accesscontrolmatrix = AccessControlMatrix::findOrFail($id);

        $validated = $request->validate([
            'user_level_id' => 'required|exists:level_user,id',
            'menu_id' => 'required|exists:menu_id,id',
            'view' => 'nullable',
            'add' => 'nullable',
            'edit' => 'nullable',
            'delete' => 'nullable',
            'approve' => 'nullable',

        ]);

        $data = [];


        $data['user_level_id'] = $validated['user_level_id'] ?? null;
        $data['menu_id'] = $validated['menu_id'] ?? null;
        $data['view'] = $validated['view'] ?? null;
        $data['add'] = $validated['add'] ?? null;
        $data['edit'] = $validated['edit'] ?? null;
        $data['delete'] = $validated['delete'] ?? null;
        $data['approve'] = $validated['approve'] ?? null;


        $accesscontrolmatrix->update($data);
        return $accesscontrolmatrix;
    }

    public function destroy($id)
    {
        AccessControlMatrix::destroy($id);
        return response()->json(['message' => '🗑️ Dihapus']);
    }
}
