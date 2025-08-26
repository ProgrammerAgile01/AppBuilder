<?php

namespace App\Http\Controllers;

use App\Models\BuilderPackage;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageBuilderController extends Controller
{
    // ====================== PUBLIC ENDPOINTS ======================

    /**
     * GET /packages
     * Query:
     *  - menu_id=ID
     *  - root_only=1
     *  - with_trashed=1
     *  - only_trashed=1
     */
    public function index(Request $request)
    {
        $q = BuilderPackage::query()->orderBy('name');

        if ($request->filled('menu_id'))
            $q->where('menu_id', (int) $request->menu_id);
        if ($request->boolean('root_only'))
            $q->whereNull('parent_id');
        if ($request->boolean('only_trashed'))
            $q->onlyTrashed();
        elseif ($request->boolean('with_trashed'))
            $q->withTrashed();

        $rows = $q->with(['children' => fn($qq) => $qq->orderBy('name'), 'menu'])->get();
        $menuTree = $this->fetchMenuTree();

        $data = $rows->map(fn(BuilderPackage $p) => $this->toDto($p, $menuTree));
        return response()->json(['success' => true, 'data' => $data->values()]);
    }

    /**
     * (Opsional) GET /menus/{menu}/packages
     * Root-only by menu
     */
    public function indexByMenu($menuId)
    {
        $q = BuilderPackage::where('menu_id', (int) $menuId)->whereNull('parent_id')->orderBy('name');

        if (request()->boolean('only_trashed'))
            $q->onlyTrashed();
        elseif (request()->boolean('with_trashed'))
            $q->withTrashed();

        $rows = $q->with(['children' => fn($qq) => $qq->orderBy('name'), 'menu'])->get();
        $menuTree = $this->fetchMenuTree();

        $data = $rows->map(fn(BuilderPackage $p) => $this->toDto($p, $menuTree));
        return response()->json(['success' => true, 'data' => $data->values()]);
    }

    /**
     * POST /packages
     * Catatan:
     *  - `menu_access` boleh berupa:
     *      a) array of IDs (disarankan, normalized), atau
     *      b) tree FE `menuAccess` (akan di-flatten ke IDs otomatis jika dikirim via field `menuAccess`)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'nullable|exists:menus,id',
            'parent_id' => 'nullable|exists:packages,id',

            'name' => 'required|string|max:255',
            'description' => 'nullable|string',

            'price' => 'required|integer|min:0',
            'max_users' => 'required|integer', // -1 allowed
            'status' => 'required|in:active,inactive,draft',
            'subscribers' => 'nullable|integer|min:0',

            'features' => 'nullable|array',

            // normalized (disarankan):
            'menu_access' => 'sometimes|array',
            'menu_access.*' => 'integer|exists:menus,id',

            // kompat: FE lama kirim tree "menuAccess"
            'menuAccess' => 'sometimes|array',
        ]);

        $menuAccessIds = $validated['menu_access'] ?? [];
        if (empty($menuAccessIds) && $request->has('menuAccess')) {
            $menuAccessIds = $this->flattenIdsFromTree($request->input('menuAccess', []));
        }

        $pkg = BuilderPackage::create(array_merge($validated, [
            'menu_access' => array_values(array_unique(array_map('intval', $menuAccessIds))),
        ]))->load(['children', 'parent', 'menu']);

        $menuTree = $this->fetchMenuTree();
        return response()->json(['success' => true, 'data' => $this->toDto($pkg, $menuTree)], 201);
    }

    /**
     * GET /packages/{package}
     */
    public function show($id)
    {
        $pkg = BuilderPackage::withTrashed()
            ->with([
                'children' => fn($q) => $q->withTrashed()->orderBy('name'),
                'parent' => fn($q) => $q->withTrashed(),
                'menu'
            ])->findOrFail($id);

        $menuTree = $this->fetchMenuTree();
        return response()->json(['success' => true, 'data' => $this->toDto($pkg, $menuTree)]);
    }

    /**
     * PUT/PATCH /packages/{package}
     */
    public function update(Request $request, $id)
    {
        $pkg = BuilderPackage::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'menu_id' => 'sometimes|nullable|exists:menus,id',
            'parent_id' => 'sometimes|nullable|exists:packages,id',

            'name' => 'required|string|max:255',
            'description' => 'nullable|string',

            'price' => 'required|integer|min:0',
            'max_users' => 'required|integer',
            'status' => 'required|in:active,inactive,draft',
            'subscribers' => 'nullable|integer|min:0',

            'features' => 'nullable|array',

            'menu_access' => 'sometimes|array',
            'menu_access.*' => 'integer|exists:menus,id',
            'menuAccess' => 'sometimes|array',
        ]);

        $menuAccessIds = $validated['menu_access'] ?? ($pkg->menu_access ?? []);
        if ($request->has('menuAccess')) {
            $menuAccessIds = $this->flattenIdsFromTree($request->input('menuAccess', []));
        }

        $pkg->update(array_merge($validated, [
            'menu_access' => array_values(array_unique(array_map('intval', $menuAccessIds))),
        ]));

        $pkg->load(['children', 'parent', 'menu']);

        $menuTree = $this->fetchMenuTree();
        return response()->json(['success' => true, 'data' => $this->toDto($pkg, $menuTree)]);
    }

    /**
     * DELETE /packages/{package}  (soft delete recursive)
     */
    public function destroy($id)
    {
        $pkg = BuilderPackage::findOrFail($id);

        DB::transaction(function () use ($pkg) {
            $this->softDeleteRecursively($pkg);
        });

        return response()->json(['success' => true]);
    }

    /**
     * POST /packages-with-children
     * Buat parent + subpackages sekaligus
     */
    public function storeWithChildren(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'nullable|exists:menus,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'max_users' => 'required|integer',
            'status' => 'required|in:active,inactive,draft',
            'subscribers' => 'nullable|integer|min:0',
            'features' => 'nullable|array',

            'menu_access' => 'sometimes|array',
            'menu_access.*' => 'integer|exists:menus,id',
            'menuAccess' => 'sometimes|array',

            'subpackages' => 'array',
            'subpackages.*.name' => 'required_with:subpackages|string|max:255',
            'subpackages.*.description' => 'nullable|string',
            'subpackages.*.price' => 'required_with:subpackages|integer|min:0',
            'subpackages.*.max_users' => 'required_with:subpackages|integer',
            'subpackages.*.status' => 'required_with:subpackages|in:active,inactive,draft',
            'subpackages.*.subscribers' => 'nullable|integer|min:0',
            'subpackages.*.features' => 'nullable|array',

            'subpackages.*.menu_access' => 'sometimes|array',
            'subpackages.*.menu_access.*' => 'integer|exists:menus,id',
            'subpackages.*.menuAccess' => 'sometimes|array',
        ]);

        return DB::transaction(function () use ($validated) {
            $parentMenuAccess = $validated['menu_access'] ?? [];
            if (empty($parentMenuAccess) && !empty($validated['menuAccess'])) {
                $parentMenuAccess = $this->flattenIdsFromTree($validated['menuAccess']);
            }

            $parent = BuilderPackage::create([
                'menu_id' => $validated['menu_id'] ?? null,
                'parent_id' => null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'max_users' => $validated['max_users'],
                'status' => $validated['status'],
                'subscribers' => $validated['subscribers'] ?? 0,
                'features' => $validated['features'] ?? [],
                'menu_access' => array_values(array_unique(array_map('intval', $parentMenuAccess))),
            ]);

            foreach ($validated['subpackages'] ?? [] as $child) {
                $childAccess = $child['menu_access'] ?? [];
                if (empty($childAccess) && !empty($child['menuAccess'])) {
                    $childAccess = $this->flattenIdsFromTree($child['menuAccess']);
                }

                BuilderPackage::create([
                    'menu_id' => $validated['menu_id'] ?? null,
                    'parent_id' => $parent->id,
                    'name' => $child['name'],
                    'description' => $child['description'] ?? null,
                    'price' => $child['price'],
                    'max_users' => $child['max_users'],
                    'status' => $child['status'],
                    'subscribers' => $child['subscribers'] ?? 0,
                    'features' => $child['features'] ?? [],
                    'menu_access' => array_values(array_unique(array_map('intval', $childAccess))),
                ]);
            }

            $parent->load(['children' => fn($q) => $q->withTrashed()]);
            $menuTree = $this->fetchMenuTree();
            return response()->json(['success' => true, 'data' => $this->toDto($parent, $menuTree)], 201);
        });
    }

    /**
     * POST /packages/{package}/restore
     */
    public function restore($id)
    {
        $pkg = BuilderPackage::onlyTrashed()->findOrFail($id);

        DB::transaction(function () use ($pkg) {
            $this->restoreRecursively($pkg);
        });

        $pkg->load(['children' => fn($q) => $q->withTrashed()]);
        $menuTree = $this->fetchMenuTree();
        return response()->json(['success' => true, 'data' => $this->toDto($pkg, $menuTree)]);
    }

    /**
     * DELETE /packages/{package}/force
     */
    public function forceDelete($id)
    {
        $pkg = BuilderPackage::withTrashed()->findOrFail($id);

        DB::transaction(function () use ($pkg) {
            $this->forceDeleteRecursively($pkg);
        });

        return response()->json(['success' => true]);
    }

    // ====================== INTERNAL HELPERS ======================

    /** Ambil tree menu (root → recursive), tanpa enabled flag */
    private function fetchMenuTree(): array
    {
        $roots = Menu::root()
            ->with(['recursiveChildren'])
            ->ordered()
            ->get();

        $map = function (Menu $m) use (&$map) {
            return [
                'id' => (int) $m->id,
                'name' => $m->title,
                'enabled' => false,
                'children' => $m->recursiveChildren->map(fn($c) => $map($c))->values()->all(),
            ];
        };

        return $roots->map(fn($r) => $map($r))->values()->all();
    }

    /** Tandai enabled pada tree menurut daftar ID di package->menu_access */
    private function markEnabled(array $tree, array $enabledIds): array
    {
        $walk = function ($nodes) use (&$walk, $enabledIds) {
            return collect($nodes)->map(function ($n) use (&$walk, $enabledIds) {
                return [
                    'id' => (string) $n['id'],
                    'name' => $n['name'],
                    'enabled' => in_array((int) $n['id'], $enabledIds, true),
                    'children' => !empty($n['children']) ? $walk($n['children']) : [],
                ];
            })->values()->all();
        };
        return $walk($tree);
    }

    /** Flatten dari bentuk tree FE (`menuAccess`) → array of IDs */
    private function flattenIdsFromTree(array $menuAccessTree): array
    {
        $ids = [];
        $walk = function ($nodes) use (&$walk, &$ids) {
            foreach ($nodes as $n) {
                if (!empty($n['enabled']))
                    $ids[] = (int) $n['id'];
                if (!empty($n['children']))
                    $walk($n['children']);
            }
        };
        $walk($menuAccessTree);
        return array_values(array_unique(array_map('intval', $ids)));
    }

    /** Mapper → DTO untuk FE (kembalikan menuAccess sebagai tree + enabled) */
    private function toDto(BuilderPackage $p, array $menuTree): array
    {
        return [
            'id' => (string) $p->id,
            'menu_id' => $p->menu_id ? (string) $p->menu_id : null,
            'parent_id' => $p->parent_id ? (string) $p->parent_id : null,

            'name' => $p->name,
            'description' => $p->description,
            'price' => (int) $p->price,
            'maxUsers' => (int) $p->max_users,
            'status' => (string) $p->status,
            'subscribers' => (int) $p->subscribers,

            'features' => $p->features ?? [],

            // FE expects tree + enabled
            'menuAccess' => $this->markEnabled($menuTree, $p->menu_access ?? []),

            // informasi tambahan
            'createdAt' => optional($p->created_at)->toDateString(),
        ];
    }

    // ===== recursive delete/restore/force (packages tree) =====

    private function softDeleteRecursively(BuilderPackage $node): void
    {
        foreach ($node->children()->get() as $child) {
            $this->softDeleteRecursively($child);
        }
        $node->delete();
    }

    private function restoreRecursively(BuilderPackage $node): void
    {
        $node->restore();

        foreach ($node->children()->withTrashed()->get() as $child) {
            $this->restoreRecursively($child);
        }
    }

    private function forceDeleteRecursively(BuilderPackage $node): void
    {
        foreach ($node->children()->withTrashed()->get() as $child) {
            $this->forceDeleteRecursively($child);
        }
        $node->forceDelete();
    }
}
