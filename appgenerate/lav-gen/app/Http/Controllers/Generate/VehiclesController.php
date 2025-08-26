<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\Vehicles;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\VehiclesExport;

class VehiclesController extends Controller
{
    protected string $entityRoute = 'vehicles';

    public function index(Request $request)
    {
        $q = Vehicles::query();
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
            'message' => 'Berhasil mengambil data vehicles',
            'total'   => $data->count(),
            'data'    => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'required',
            'brand' => 'required',
            'model' => 'required',
            'year' => 'required|numeric',
            'color' => 'required',
            'vehicle_type' => 'required|in:Car,SUV,Van,Truck,Motorcycle',
            'fuel_type' => 'required|in:Gasoline,Diesel,Electric,Hybrid',
            'transmission' => 'required|in:Manual,Automatic,CVT',
            'number_of_seats' => 'required|numeric',
            'mileage' => 'required|numeric',
            'daily_rate' => 'required|numeric',
            'location' => 'required',
            'status' => 'required|in:Available,Rented,Maintenance,Out Of Service',
            'features' => 'nullable|array',
            'front_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'side_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'back_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'description' => 'required',
        ]);

        $data = [];
        $data['plate_number'] = $validated['plate_number'] ?? null;
        $data['brand'] = $validated['brand'] ?? null;
        $data['model'] = $validated['model'] ?? null;
        $data['year'] = $validated['year'] ?? null;
        $data['color'] = $validated['color'] ?? null;
        $data['vehicle_type'] = $validated['vehicle_type'] ?? null;
        $data['fuel_type'] = $validated['fuel_type'] ?? null;
        $data['transmission'] = $validated['transmission'] ?? null;
        $data['number_of_seats'] = $validated['number_of_seats'] ?? null;
        $data['mileage'] = $validated['mileage'] ?? null;
        $data['daily_rate'] = $validated['daily_rate'] ?? null;
        $data['location'] = $validated['location'] ?? null;
        $data['status'] = $validated['status'] ?? null;
        $data['features'] = $validated['features'] ?? null;
        $data['description'] = $validated['description'] ?? null;

            if ($request->hasFile('front_photo')) {
                $data['front_photo'] = $request->file('front_photo')->store('uploads/Vehicles', 'public');
            }            if ($request->hasFile('side_photo')) {
                $data['side_photo'] = $request->file('side_photo')->store('uploads/Vehicles', 'public');
            }            if ($request->hasFile('back_photo')) {
                $data['back_photo'] = $request->file('back_photo')->store('uploads/Vehicles', 'public');
            }

        $row = Vehicles::create($data);
        return response()->json(['success'=>true, 'data'=>$row], 201);
    }

    public function show($id)
    {
        $row = Vehicles::findOrFail($id);
        return response()->json(['success'=>true, 'data'=>$row]);
    }

    public function update(Request $request, $id)
    {
        $row = Vehicles::findOrFail($id);
        $validated = $request->validate([
            'plate_number' => 'required',
            'brand' => 'required',
            'model' => 'required',
            'year' => 'required|numeric',
            'color' => 'required',
            'vehicle_type' => 'required|in:Car,SUV,Van,Truck,Motorcycle',
            'fuel_type' => 'required|in:Gasoline,Diesel,Electric,Hybrid',
            'transmission' => 'required|in:Manual,Automatic,CVT',
            'number_of_seats' => 'required|numeric',
            'mileage' => 'required|numeric',
            'daily_rate' => 'required|numeric',
            'location' => 'required',
            'status' => 'required|in:Available,Rented,Maintenance,Out Of Service',
            'features' => 'nullable|array',
            'front_photo' => 'nullable|image|max:5120|mimes:jpg,jpeg,png,webp',
            'side_photo' => 'nullable|image|max:5120|mimes:jpg,jpeg,png,webp',
            'back_photo' => 'nullable|image|max:5120|mimes:jpg,jpeg,png,webp',
            'description' => 'required',
        ]);

        $data = [];
        $data['plate_number'] = $validated['plate_number'] ?? null;
        $data['brand'] = $validated['brand'] ?? null;
        $data['model'] = $validated['model'] ?? null;
        $data['year'] = $validated['year'] ?? null;
        $data['color'] = $validated['color'] ?? null;
        $data['vehicle_type'] = $validated['vehicle_type'] ?? null;
        $data['fuel_type'] = $validated['fuel_type'] ?? null;
        $data['transmission'] = $validated['transmission'] ?? null;
        $data['number_of_seats'] = $validated['number_of_seats'] ?? null;
        $data['mileage'] = $validated['mileage'] ?? null;
        $data['daily_rate'] = $validated['daily_rate'] ?? null;
        $data['location'] = $validated['location'] ?? null;
        $data['status'] = $validated['status'] ?? null;
        $data['features'] = $validated['features'] ?? null;
        $data['description'] = $validated['description'] ?? null;

            if ($request->hasFile('front_photo')) {
                $data['front_photo'] = $request->file('front_photo')->store('uploads/Vehicles', 'public');
            } else {
                unset($data['front_photo']);
            }            if ($request->hasFile('side_photo')) {
                $data['side_photo'] = $request->file('side_photo')->store('uploads/Vehicles', 'public');
            } else {
                unset($data['side_photo']);
            }            if ($request->hasFile('back_photo')) {
                $data['back_photo'] = $request->file('back_photo')->store('uploads/Vehicles', 'public');
            } else {
                unset($data['back_photo']);
            }

        $row->update($data);
        return response()->json(['success'=>true, 'data'=>$row]);
    }

    public function destroy($id)
    {
        $row = Vehicles::findOrFail($id);
        $row->delete();
        return response()->json(['success'=>true]);
    }

    public function exportExcel(Request $request)
    {
        $file = 'Vehicles_'.now()->format('Ymd_His').'.xlsx';

        return Excel::download(
            new VehiclesExport(
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
