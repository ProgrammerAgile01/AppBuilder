<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\LevelUser;
use Illuminate\Http\Request;

class LevelUserController extends Controller
{
    public function index()
    {
        try {
            $leveluser = LevelUser::orderByDesc('updated_at')->get();

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data LevelUser",
                'data' => $leveluser,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data LevelUser " . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $leveluser = LevelUser::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data LevelUser dari id: $id",
                'data' => $leveluser,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data LevelUser dari id: $id " . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_level' => 'required',
            'deskripsi' => 'required',
            'status' => 'required|in:Aktif,Tidak Aktif',

        ]);

        $leveluser = [];


        $data['nama_level'] = $validated['nama_level'] ?? null;
        $data['deskripsi'] = $validated['deskripsi'] ?? null;
        $data['status'] = $validated['status'] ?? null;


        return LevelUser::create($data);
    }

    public function update(Request $request, $id)
    {
        $leveluser = LevelUser::findOrFail($id);

        $validated = $request->validate([
            'nama_level' => 'required',
            'deskripsi' => 'required',
            'status' => 'required|in:Aktif,Tidak Aktif',

        ]);

        $data = [];


        $data['nama_level'] = $validated['nama_level'] ?? null;
        $data['deskripsi'] = $validated['deskripsi'] ?? null;
        $data['status'] = $validated['status'] ?? null;


        $leveluser->update($data);
        return $leveluser;
    }

    public function destroy($id)
    {
        LevelUser::destroy($id);
        return response()->json(['message' => '🗑️ Dihapus']);
    }
}
