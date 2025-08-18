<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\Pelanggans;
use Illuminate\Http\Request;

class PelanggansController extends Controller
{
    public function index()
    {
        try {
            $pelanggans = Pelanggans::orderByDesc('updated_at')->get();

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data Pelanggans",
                'data' => $pelanggans,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data Pelanggans " . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $pelanggans = Pelanggans::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data Pelanggans dari id: $id",
                'data' => $pelanggans,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data Pelanggans dari id: $id " . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|max:100',

        ]);

        return Pelanggans::create($validated);
    }

    public function update(Request $request, $id)
    {
        $data = Pelanggans::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|max:100',

        ]);

        $data->update($validated);
        return $data;
    }

    public function destroy($id)
    {
        Pelanggans::destroy($id);
        return response()->json(['message' => '🗑️ Dihapus']);
    }
}
