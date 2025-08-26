<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\UserManagement;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index()
    {
        try {
            $usermanagement = UserManagement::orderByDesc('updated_at')->get();

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data UserManagement",
                'data' => $usermanagement,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data UserManagement " . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $usermanagement = UserManagement::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data UserManagement dari id: $id",
                'data' => $usermanagement,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data UserManagement dari id: $id " . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required',
            'email' => 'required|unique:user_management',
            'nomor_telp' => 'required',
            'role' => 'required|exists:level_user,id',
            'status' => 'required|in:Aktif,Tidak Aktif',
            'foto' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',

        ]);

        $usermanagement = [];

            if ($request->hasFile('foto')) {
                $data['foto'] = $request->file('foto')->store('uploads/UserManagement', 'public');
            }
        $data['nama'] = $validated['nama'] ?? null;
        $data['email'] = $validated['email'] ?? null;
        $data['nomor_telp'] = $validated['nomor_telp'] ?? null;
        $data['role'] = $validated['role'] ?? null;
        $data['status'] = $validated['status'] ?? null;


        return UserManagement::create($data);
    }

    public function update(Request $request, $id)
    {
        $usermanagement = UserManagement::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required',
            'email' => 'required|unique:user_management',
            'nomor_telp' => 'required',
            'role' => 'required|exists:level_user,id',
            'status' => 'required|in:Aktif,Tidak Aktif',
            'foto' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',

        ]);

        $data = [];

            if ($request->hasFile('foto')) {
                $data['foto'] = $request->file('foto')->store('uploads/UserManagement', 'public');
            } else {
                unset($data['foto']);
            }
        $data['nama'] = $validated['nama'] ?? null;
        $data['email'] = $validated['email'] ?? null;
        $data['nomor_telp'] = $validated['nomor_telp'] ?? null;
        $data['role'] = $validated['role'] ?? null;
        $data['status'] = $validated['status'] ?? null;


        $usermanagement->update($data);
        return $usermanagement;
    }

    public function destroy($id)
    {
        UserManagement::destroy($id);
        return response()->json(['message' => '🗑️ Dihapus']);
    }
}
