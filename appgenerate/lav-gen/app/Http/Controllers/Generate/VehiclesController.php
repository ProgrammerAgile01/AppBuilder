<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\Vehicles;
use Illuminate\Http\Request;

class VehiclesController extends Controller
{
    public function index()
    {
        try {
            $vehicles = Vehicles::orderByDesc('updated_at')->get();

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data Vehicles",
                'data' => $vehicles,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data Vehicles " . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $vehicles = Vehicles::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menampilkan data Vehicles dari id: $id",
                'data' => $vehicles,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success'=> false,
                'message' => "Gagal menampilkan data Vehicles dari id: $id " . $e->getMessage(),
            ], 500);
        }
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
            'features' => 'required',
            'front_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'side_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'back_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'description' => 'required',

        ]);

            if ($request->hasFile('front_photo')) {
                $data['front_photo'] = $request->file('front_photo')->store('uploads/Vehicles', 'public');
            }            if ($request->hasFile('side_photo')) {
                $data['side_photo'] = $request->file('side_photo')->store('uploads/Vehicles', 'public');
            }            if ($request->hasFile('back_photo')) {
                $data['back_photo'] = $request->file('back_photo')->store('uploads/Vehicles', 'public');
            }
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


        return Vehicles::create($data);
    }

    public function update(Request $request, $id)
    {
        $vehicles = Vehicles::findOrFail($id);

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
            'features' => 'required',
            'front_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'side_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'back_photo' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp',
            'description' => 'required',

        ]);

        $data = [];

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


        $vehicles->update($data);
        return $vehicles;
    }

    public function destroy($id)
    {
        Vehicles::destroy($id);
        return response()->json(['message' => '🗑️ Dihapus']);
    }
}
