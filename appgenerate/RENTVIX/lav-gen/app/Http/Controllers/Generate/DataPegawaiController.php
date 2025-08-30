<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\DataPegawai;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DataPegawaiExport;

class DataPegawaiController extends Controller
{
    protected string $entityRoute = 'data-pegawais';

    public function index(Request $request)
    {
        $q = DataPegawai::query();
        if ($s = $request->get('search')) {
            $q->where(function ($w) use ($s) {
                $w->where('id', 'like', "%$s%");
            });
        }
        // return response()->json($q->paginate((int)($request->get('per_page', 15))));

        // opsional: urutan default
        $q->latest('id'); // atau created_at

        $data = $q->get();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil data',
            'total'   => $data->count(),
            'data'    => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required',
            'alamat' => 'required',
        ]);

        $data = [];
        $data['nama'] = $validated['nama'] ?? null;
        $data['alamat'] = $validated['alamat'] ?? null;



        $row = DataPegawai::create($data);
        return response()->json(['success'=>true, 'data'=>$row], 201);
    }

    public function show($id)
    {
        $row = DataPegawai::findOrFail($id);
        return response()->json(['success'=>true, 'data'=>$row]);
    }

    public function update(Request $request, $id)
    {
        $row = DataPegawai::findOrFail($id);
        $validated = $request->validate([
            'nama' => 'required',
            'alamat' => 'required',
        ]);

        $data = [];
        $data['nama'] = $validated['nama'] ?? null;
        $data['alamat'] = $validated['alamat'] ?? null;

        $oldFilesToDelete = [];


        $row->update($data);


        return response()->json(['success'=>true, 'data'=>$row]);
    }

    public function destroy($id)
    {
        $row = DataPegawai::findOrFail($id);
        $row->delete();
        return response()->json(['success'=>true]);
    }

    public function exportExcel(Request $request)
    {
        $file = 'DataPegawai_'.now()->format('Ymd_His').'.xlsx';

        return Excel::download(
            new DataPegawaiExport(
                search: $request->query('search'),
                status: $request->query('status'),
                city: $request->query('city', 'Jakarta'),
                approvedByName: $request->query('approved_by_name', 'Manager Operasional'),
                approvedByTitle: $request->query('approved_by_title', 'Manager Operasional'),
                approvedDate: $request->query('approved_date')
            ),
            $file
        );
    }
}
