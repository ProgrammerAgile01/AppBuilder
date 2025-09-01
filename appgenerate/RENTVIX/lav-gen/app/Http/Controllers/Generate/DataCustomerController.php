<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\DataCustomer;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DataCustomerExport;

class DataCustomerController extends Controller
{
    protected string $entityRoute = 'data-customers';

    public function index(Request $request)
    {
        // batas aman per_page (default 10, max 100)
        $perPage = max(1, min((int) $request->query('per_page', 10), 100));

        $q = DataCustomer::query();
        if ($s = $request->get('search')) {
            $q->where(function ($w) use ($s) {
                $w->where('id', 'like', "%$s%");
            });
        }

        // opsional: urutan default
        $q->latest('id'); // atau created_at

        $data = $q->paginate($perPage)->appends($request->query());

        return response()->json([
            'success' => true,
            'message' => 'Berhasil menampilkan data',
            'total' => $data->count(),
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'last_page' => $data->lastPage(),
                'from' => $data->firstItem(),
                'to' => $data->lastItem(),
            ],
            'links' => [
                'first' => $data->url(1),
                'last' => $data->url($data->lastPage()),
                'prev' => $data->previousPageUrl(),
                'next' => $data->nextPageUrl(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required',
            'alamat' => 'required',
            'nama_instansi' => 'required',
        ]);

        $data = [];
        $data['nama_lengkap'] = $validated['nama_lengkap'] ?? null;
        $data['alamat'] = $validated['alamat'] ?? null;
        $data['nama_instansi'] = $validated['nama_instansi'] ?? null;



        $row = DataCustomer::create($data);
        return response()->json(['success'=>true, 'data'=>$row], 201);
    }

    public function show($id)
    {
        $row = DataCustomer::findOrFail($id);
        return response()->json(['success'=>true, 'data'=>$row]);
    }

    public function update(Request $request, $id)
    {
        $row = DataCustomer::findOrFail($id);
        $validated = $request->validate([
            'nama_lengkap' => 'required',
            'alamat' => 'required',
            'nama_instansi' => 'required',
        ]);

        $data = [];
        $data['nama_lengkap'] = $validated['nama_lengkap'] ?? null;
        $data['alamat'] = $validated['alamat'] ?? null;
        $data['nama_instansi'] = $validated['nama_instansi'] ?? null;

        $oldFilesToDelete = [];


        $row->update($data);


        return response()->json(['success'=>true, 'data'=>$row]);
    }

    public function destroy($id)
    {
        $row = DataCustomer::findOrFail($id);
        $row->delete();
        return response()->json(['success'=>true]);
    }

    public function exportExcel(Request $request)
    {
        $file = 'DataCustomer_'.now()->format('Ymd_His').'.xlsx';

        return Excel::download(
            new DataCustomerExport(
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
