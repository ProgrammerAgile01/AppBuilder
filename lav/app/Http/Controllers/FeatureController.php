<?php

namespace App\Http\Controllers;

use App\Models\Feature;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;

class FeatureController extends Controller
{
    private function mapFeature(Feature $f, bool $withChildren = true): array
    {
        return [
            'id' => (string) $f->id,
            'name' => $f->name,
            'code' => $f->code,
            'description' => $f->description,
            'type' => $f->type,
            'parentId' => $f->parent_id ? (string) $f->parent_id : null,
            'isActive' => (bool) $f->is_active,
            'isDeleted' => method_exists($f, 'trashed') ? $f->trashed() : false,
            'deletedAt' => $f->deleted_at,
            'children' => $withChildren
                ? ($f->relationLoaded('childrenRecursive')
                    ? $f->childrenRecursive->map(fn($c) => $this->mapFeature($c, true))->values()->all()
                    : $f->children()->get()->map(fn($c) => $this->mapFeature($c, true))->values()->all())
                : [],
            'orderNumber' => (int) $f->order_number,
            'created_at' => $f->created_at,
            'updated_at' => $f->updated_at,
        ];
    }

    private function baseListQuery(Request $request)
    {
        $q = Feature::query()
            ->orderBy('order_number')
            ->orderBy('name');

        $trash = $request->query('trash'); // with | only | null
        if ($trash === 'with') {
            $q->withTrashed();
        } elseif ($trash === 'only') {
            $q->onlyTrashed();
        }

        if ($term = $request->query('search')) {
            $q->where(function ($qq) use ($term) {
                $qq->where('name', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if ($type = $request->query('type')) {
            $q->where('type', $type);
        }

        if ($request->filled('parent_id')) {
            $q->where('parent_id', $request->query('parent_id'));
        } elseif ($request->boolean('root_only', false)) {
            $q->whereNull('parent_id');
        }

        if ($request->boolean('with_tree', true)) {
            // anak ikut withTrashed saat mode trash
            $q->with([
                'childrenRecursive' => function ($qq) use ($trash) {
                    if ($trash === 'with' || $trash === 'only') {
                        $qq->withTrashed();
                    }
                }
            ]);
        }

        return $q;
    }

    public function index(Request $request): JsonResponse
    {
        if (!$request->has('root_only') && !$request->has('parent_id')) {
            $request->merge(['root_only' => true]);
        }
        $items = $this->baseListQuery($request)->get();
        $data = $items->map(fn($f) => $this->mapFeature($f, true))->values();
        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', 'unique:features,code'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['category', 'feature', 'subfeature'])],
            'parentId' => ['nullable', 'integer', 'exists:features,id'],
            'isActive' => ['nullable', 'boolean'],
            'orderNumber' => ['nullable', 'integer', 'min:0'],
        ]);

        // Normalisasi root agar NULL
        $parentId = $validated['parentId'] ?? null;
        if ($parentId === 0 || $parentId === '0' || $parentId === '') {
            $parentId = null;
        }

        $feature = Feature::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'parent_id' => $parentId,
            'is_active' => $validated['isActive'] ?? true,
            'order_number' => $validated['orderNumber'] ?? 0,
        ])->load('childrenRecursive');

        return response()->json([
            'message' => 'Fitur berhasil dibuat',
            'data' => $this->mapFeature($feature, true)
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $trash = request()->query('trash');
        $q = Feature::query();
        if ($trash === 'with') {
            $q->withTrashed();
        }
        $q->with([
            'childrenRecursive' => function ($qq) use ($trash) {
                if ($trash === 'with' || $trash === 'only') {
                    $qq->withTrashed();
                }
            }
        ]);

        $feature = $q->findOrFail($id);
        return response()->json(['data' => $this->mapFeature($feature, true)]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $feature = Feature::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', Rule::unique('features', 'code')->ignore($feature->id)],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['category', 'feature', 'subfeature'])],
            'parentId' => ['nullable', 'integer', 'different:id', 'exists:features,id'],
            'isActive' => ['nullable', 'boolean'],
            'orderNumber' => ['nullable', 'integer', 'min:0'],
        ]);

        $parentId = $validated['parentId'] ?? null;
        if ($parentId === 0 || $parentId === '0' || $parentId === '') {
            $parentId = null;
        }

        $feature->fill([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'parent_id' => $parentId,
            'is_active' => $validated['isActive'] ?? $feature->is_active,
            'order_number' => $validated['orderNumber'] ?? $feature->order_number,
        ])->save();

        $feature->load([
            'childrenRecursive' => function ($qq) {
                $qq->withTrashed();
            }
        ]);

        return response()->json([
            'message' => 'Fitur berhasil diperbarui',
            'data' => $this->mapFeature($feature, true),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $feature = Feature::findOrFail($id);
        $feature->delete();
        return response()->json(['message' => 'Fitur berhasil dihapus (soft delete)']);
    }

    /**
     * Hapus node yang tidak terhapus dan tidak punya keturunan terhapus.
     * Mengembalikan null jika seluruh subtree "bersih".
     */
    private function pruneDeleted(?array $node): ?array
    {
        if (!$node)
            return null;

        $prunedChildren = [];
        foreach ($node['children'] ?? [] as $child) {
            $pc = $this->pruneDeleted($child);
            if ($pc !== null) {
                $prunedChildren[] = $pc;
            }
        }

        $isDeleted = !empty($node['isDeleted']);
        if ($isDeleted || count($prunedChildren) > 0) {
            $node['children'] = $prunedChildren;
            return $node;
        }
        return null;
    }

    public function tree(Request $request): JsonResponse
    {
        $trash = $request->query('trash'); // with | only | null

        $q = Feature::query()
            ->whereNull('parent_id')
            ->orderBy('order_number')
            ->orderBy('name');

        // Kunci perbaikan:
        // trash=only => ambil SEMUA root withTrashed (bukan onlyTrashed),
        // lalu prune di tingkat array agar hanya node terhapus/berketurunan terhapus yang tersisa.
        if ($trash === 'with' || $trash === 'only') {
            $q->withTrashed();
        }

        $q->with([
            'childrenRecursive' => function ($qq) use ($trash) {
                if ($trash === 'with' || $trash === 'only') {
                    $qq->withTrashed();
                }
            }
        ]);

        $roots = $q->get();

        // Peta ke array lengkap
        $mapped = $roots->map(fn($f) => $this->mapFeature($f, true))->values()->all();

        if ($trash === 'only') {
            // Prune: sisakan yang terhapus atau punya keturunan terhapus
            $mapped = array_values(array_filter(
                array_map(fn($n) => $this->pruneDeleted($n), $mapped),
                fn($x) => $x !== null
            ));
        }

        return response()->json(['data' => $mapped]);
    }

    public function toggle(string $id): JsonResponse
    {
        $feature = Feature::withTrashed()->findOrFail($id);
        $feature->is_active = !$feature->is_active;
        $feature->save();

        return response()->json([
            'message' => 'Status fitur diperbarui',
            'data' => $this->mapFeature($feature->fresh([
                'childrenRecursive' => function ($qq) {
                    $qq->withTrashed();
                }
            ]), true),
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $feature = Feature::withTrashed()->findOrFail($id);
        $feature->restore();

        return response()->json([
            'message' => 'Fitur berhasil dipulihkan',
            'data' => $this->mapFeature($feature->fresh([
                'childrenRecursive' => function ($qq) {
                    $qq->withTrashed();
                }
            ]), true),
        ]);
    }

    public function force(string $id): JsonResponse
    {
        $feature = Feature::withTrashed()->findOrFail($id);
        $feature->forceDelete();

        return response()->json(['message' => 'Fitur dihapus permanen']);
    }
}
