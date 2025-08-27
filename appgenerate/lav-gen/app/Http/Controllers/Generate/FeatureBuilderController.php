<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\FeatureBuilder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FeatureBuilderController extends Controller
{
    public function index(Request $req) {
        $q = FeatureBuilder::query();
        if ($pid = $req->query('product_id')) $q->where('product_id', $pid);
        if ($req->boolean('root_only', false)) $q->whereNull('parent_id');
        $q->orderBy('order_number');
        return response()->json(['data' => $q->get()]);
    }

    public function show(string $id) {
        $row = FeatureBuilder::with('children')->findOrFail($id);
        return response()->json(['data' => $row]);
    }

    protected function rules(?int $id=null): array {
        return [
            'product_id' => ['required','string','max:36'],
            'product_code' => ['nullable','string','max:64'],
            'parent_id' => ['nullable','integer'],
            'name' => ['required','string','max:160'],
            'feature_code' => [
                'required','string','max:128',
                Rule::unique('mst_feature_builder','feature_code')->ignore($id)->where(fn($q)=>$q->where('product_id', request('product_id')))
            ],
            'type' => ['required', Rule::in(['category','feature','subfeature'])],
            'description' => ['nullable','string'],
            'crud_menu_id' => ['nullable','integer'],
            'price_addon' => ['nullable','integer','min:0'],
            'trial_available' => ['nullable','boolean'],
            'trial_days' => ['nullable','integer','min:1'],
            'is_active' => ['nullable','boolean'],
            'order_number' => ['nullable','integer','min:0'],
        ];
    }

    public function store(Request $req) {
        $data = $req->validate($this->rules());
        $row = FeatureBuilder::create($data);
        return response()->json(['data'=>$row],201);
    }

    public function update(Request $req, string $id) {
        $row = FeatureBuilder::withTrashed()->findOrFail($id);
        $data = $req->validate($this->rules((int)$row->id));
        $row->update($data);
        return response()->json(['data'=>$row]);
    }

    public function destroy(string $id) {
        $row = FeatureBuilder::findOrFail($id);
        $row->delete();
        return response()->json(['message'=>'deleted']);
    }
}