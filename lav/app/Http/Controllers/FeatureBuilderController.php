<?php

namespace App\Http\Controllers;

use App\Models\FeatureBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class FeatureBuilderController extends Controller
{
    /** GET /api/fitur
     *  Optional: ?search=...&type=feature|category|subfeature&root_only=1&parent_id=ID&with_tree=1&trash=with|only
     */
    public function index(Request $req): JsonResponse
    {
        $trash = $req->query('trash', 'none'); // none|with|only

        $q = FeatureBuilder::query();
        if ($trash === 'with')
            $q->withTrashed();
        elseif ($trash === 'only')
            $q->onlyTrashed();

        if ($s = trim((string) $req->query('search'))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', "%$s%")
                    ->orWhere('feature_code', 'like', "%$s%")
                    ->orWhere('product_code', 'like', "%$s%");
            });
        }

        if ($t = $req->query('type')) {
            $q->where('type', $t);
        }

        if ($req->boolean('root_only', true)) {
            $q->whereNull('parent_id');
        }
        if ($pid = $req->query('parent_id')) {
            $q->where('parent_id', $pid);
        }

        $q->orderBy('order_number')->orderBy('name');

        $withTree = $req->boolean('with_tree', true);
        $items = $q->get();

        if ($withTree) {
            $items->load([
                'children' => function ($qq) {
                    $qq->orderBy('order_number')->orderBy('name');
                }
            ]);
        }

        return response()->json(['data' => $items]);
    }

    /** GET /api/fitur/{id} */
    public function show(string $id, Request $req): JsonResponse
    {
        $withTrashed = $req->boolean('with_trashed', false);
        $q = FeatureBuilder::with('children', 'menu');
        if ($withTrashed)
            $q->withTrashed();

        $item = $q->findOrFail($id);
        return response()->json(['data' => $item]);
    }

    /** Helper validasi */
    protected function rules(?int $id = null): array
    {
        return [
            'product_id' => ['required', 'string', 'max:36'], // sesuaikan bila BIGINT: ['required','integer','exists:mst_products,id']
            'product_code' => ['nullable', 'string', 'max:64'],
            'parent_id' => ['nullable', 'integer', 'exists:mst_feature_builder,id'],
            'name' => ['required', 'string', 'max:160'],
            'feature_code' => [
                'required',
                'string',
                'max:128',
                // unique per product_id + feature_code
                Rule::unique('mst_feature_builder', 'feature_code')
                    ->ignore($id)
                    ->where(fn($q) => $q->where('product_id', request('product_id')))
            ],
            'type' => ['required', Rule::in(['category', 'feature', 'subfeature'])],
            'description' => ['nullable', 'string'],
            'crud_menu_id' => ['nullable', 'integer', 'exists:menus,id'],

            'price_addon' => ['nullable', 'integer', 'min:0'],
            'trial_available' => ['nullable', 'boolean'],
            'trial_days' => ['nullable', 'integer', 'min:1'],

            'is_active' => ['nullable', 'boolean'],
            'order_number' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /** POST /api/fitur */
    public function store(Request $req): JsonResponse
    {
        $data = $req->validate($this->rules());

        $data['price_addon'] = (int) ($data['price_addon'] ?? 0);
        $data['trial_available'] = (bool) ($data['trial_available'] ?? false);
        $data['trial_days'] = $data['trial_available'] ? ($data['trial_days'] ?? 7) : null;
        $data['is_active'] = (bool) ($data['is_active'] ?? true);
        $data['order_number'] = (int) ($data['order_number'] ?? 0);

        $row = FeatureBuilder::create($data);

        return response()->json(['data' => $row], 201);
    }

    /** PUT /api/fitur/{id} */
    public function update(Request $req, string $id): JsonResponse
    {
        $row = FeatureBuilder::withTrashed()->findOrFail($id);

        $data = $req->validate($this->rules((int) $row->id));

        $data['price_addon'] = (int) ($data['price_addon'] ?? $row->price_addon ?? 0);
        $data['trial_available'] = (bool) ($data['trial_available'] ?? $row->trial_available ?? false);
        $data['trial_days'] = $data['trial_available'] ? ($data['trial_days'] ?? $row->trial_days ?? 7) : null;
        $data['is_active'] = (bool) ($data['is_active'] ?? $row->is_active ?? true);
        $data['order_number'] = (int) ($data['order_number'] ?? $row->order_number ?? 0);

        $row->update($data);

        return response()->json(['data' => $row]);
    }

    /** DELETE /api/fitur/{id} (soft) */
    public function destroy(string $id): JsonResponse
    {
        $row = FeatureBuilder::findOrFail($id);
        $row->delete();
        return response()->json(['message' => 'Feature soft-deleted']);
    }

    /** POST /api/fitur/{id}/restore */
    public function restore(string $id): JsonResponse
    {
        $row = FeatureBuilder::withTrashed()->findOrFail($id);
        if (!$row->trashed()) {
            return response()->json(['message' => 'Item is not deleted'], 409);
        }
        $row->restore();
        return response()->json(['message' => 'Feature restored']);
    }

    /** DELETE /api/fitur/{id}/force */
    public function force(string $id): JsonResponse
    {
        $row = FeatureBuilder::withTrashed()->findOrFail($id);
        $row->forceDelete();
        return response()->json(['message' => 'Feature permanently deleted']);
    }

    /** POST /api/fitur/{id}/toggle */
    public function toggle(string $id): JsonResponse
    {
        $row = FeatureBuilder::withTrashed()->findOrFail($id);
        if ($row->trashed())
            return response()->json(['message' => 'Cannot toggle a trashed feature'], 409);
        $row->is_active = !$row->is_active;
        $row->save();

        return response()->json(['data' => $row, 'message' => 'Toggled']);
    }

    /** GET /api/fitur/tree
     * Mengembalikan root + children (rekursif sederhana 2 tingkat) untuk preview
     */
    public function tree(Request $req): JsonResponse
    {
        $trash = $req->query('trash', 'none');

        $q = FeatureBuilder::query()->whereNull('parent_id')->orderBy('order_number');
        if ($trash === 'with')
            $q->withTrashed();
        elseif ($trash === 'only')
            $q->onlyTrashed();

        $roots = $q->with([
            'children' => function ($qq) use ($trash) {
                if ($trash !== 'none')
                    $qq->withTrashed();
                $qq->orderBy('order_number');
            }
        ])->get();

        return response()->json(['data' => $roots]);
    }
}