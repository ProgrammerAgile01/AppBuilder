<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use File;
use Str;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    /**
     * GET /menus?trash=none|with|only&product_id=...&product_code=...
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $trash = $request->query('trash', 'none');
            $productId = $request->query('product_id');
            $productCode = $request->query('product_code');

            $query = Menu::query();

            if ($trash === 'with') {
                $query->withTrashed();
            } elseif ($trash === 'only') {
                $query->onlyTrashed();
            }

            // filter per product
            if (!empty($productId)) {
                $query->where('product_id', $productId);
            } elseif (!empty($productCode)) {
                $query->where('product_code', $productCode);
            }

            $withChildren = [
                'recursiveChildren' => function ($q) use ($trash) {
                    if ($trash !== 'none') $q->withTrashed();
                    $q->with([
                        'recursiveChildren' => function ($qq) use ($trash) {
                            if ($trash !== 'none') $qq->withTrashed();
                        }
                    ]);
                },
                'crudBuilder' => function ($q) use ($trash) {
                    if ($trash !== 'none') $q->withTrashed();
                },
            ];

            if ($trash === 'only') {
                $menus = $query->with($withChildren)->ordered()->get(); // flat only trashed
            } else {
                $menus = $query->with($withChildren)->root()->ordered()->get(); // tree
            }

            return response()->json(['data' => $menus]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch menus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
{
    try {
        $data = $request->validate([
            'product_id'     => ['required','uuid','exists:mst_products,id'],
            'product_code'   => ['nullable','string'], // <— INT, bukan string

            'parent_id'      => 'nullable|exists:menus,id',
            'type'           => ['required', Rule::in(['group','module','menu'])],
            'title'          => 'required|string|max:255',
            'icon'           => 'nullable|string|max:100',
            'color'          => ['nullable','string','max:32'],
            'order_number'   => 'nullable|integer|min:1',
            'crud_builder_id'=> 'nullable|exists:crud_builders,id',
            'route_path'     => 'nullable|string|max:255',
            'is_active'      => 'boolean',
            'note'           => 'nullable|string|max:1000',
        ]);

        // Jika parent ada, wariskan product dari parent
        $level = 1;
        if (!empty($data['parent_id'])) {
            $parent = Menu::withTrashed()->find($data['parent_id']);
            if ($parent) {
                $level = ($parent->level ?? 0) + 1;
                $data['product_id']   = $parent->product_id;
                $data['product_code'] = $parent->product_code;
            }
        }
        $data['level'] = $level;

        // Jika TIDAK ada parent dan product_code belum dikirim, ambil dari tabel produk
        if (empty($data['parent_id']) && !array_key_exists('product_code',$data)) {
            $prod = \App\Models\Product::withTrashed()->find($data['product_id']);
            if ($prod && isset($prod->product_code)) {
                $data['product_code'] = (int) $prod->product_code;
            }
        }

        if (!isset($data['order_number'])) {
            $max = Menu::withTrashed()->where('parent_id', $data['parent_id'] ?? null)->max('order_number') ?? 0;
            $data['order_number'] = $max + 1;
        }

        $data['is_active'] = $data['is_active'] ?? true;
        $data['created_by'] = auth()->id();

        $menu = Menu::create($data)->load('recursiveChildren');
        return response()->json($menu, 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to create menu',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $withTrashed = $request->boolean('with_trashed', false);

            $menu = $withTrashed
                ? Menu::withTrashed()->with('recursiveChildren')->findOrFail($id)
                : Menu::with('recursiveChildren')->findOrFail($id);

            return response()->json($menu);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Menu not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch menu', 'error' => $e->getMessage()], 500);
        }
    }

    
public function update(Request $request, string $id): JsonResponse
{
    try {
        $menu = Menu::withTrashed()->findOrFail($id);
        if ($menu->trashed()) {
            return response()->json(['message' => 'Cannot update a trashed menu. Restore first.'], 409);
        }

        $data = $request->validate([
            'product_id'     => ['nullable','uuid','exists:mst_products,id'],
            'product_code'   => ['nullable','string'], // <— INT

            'parent_id'      => 'nullable|exists:menus,id',
            'type'           => ['required', Rule::in(['group','module','menu'])],
            'title'          => 'required|string|max:255',
            'icon'           => 'nullable|string|max:100',
            'color'          => ['nullable','string','max:32'],
            'order_number'   => 'nullable|integer|min:1',
            'crud_builder_id'=> 'nullable|exists:crud_builders,id',
            'route_path'     => 'nullable|string|max:255',
            'is_active'      => 'boolean',
            'note'           => 'nullable|string|max:1000',
        ]);

        // konsistensi product dengan parent (jika ada)
        $parentId = array_key_exists('parent_id', $data) ? $data['parent_id'] : $menu->parent_id;
        if (!empty($parentId)) {
            $parent = Menu::withTrashed()->find($parentId);
            if ($parent) {
                $data['product_id']   = $parent->product_id;
                $data['product_code'] = $parent->product_code;
            }
        } elseif (isset($data['product_id']) && !array_key_exists('product_code',$data)) {
            $prod = \App\Models\Product::withTrashed()->find($data['product_id']);
            if ($prod && isset($prod->product_code)) {
                $data['product_code'] = (int) $prod->product_code;
            }
        }

        // level + order
        $level = 1;
        if (!empty($parentId)) {
            $parent = Menu::withTrashed()->find($parentId);
            if ($parent) $level = ($parent->level ?? 0) + 1;
        }
        $data['level'] = $level;

        if (!isset($data['order_number'])) {
            $max = Menu::withTrashed()->where('parent_id', $parentId)->max('order_number') ?? 0;
            $data['order_number'] = max($menu->order_number ?? 1, $max);
        }

        $menu->update($data);
        return response()->json($menu->fresh('recursiveChildren'));
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to update menu', 'error' => $e->getMessage()], 500);
        }
    }

        public function destroy(string $id): JsonResponse
    {
        try {
            $menu = Menu::findOrFail($id);
            $menu->delete();

            return response()->json(['message' => 'Menu soft-deleted successfully']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Menu not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete menu', 'error' => $e->getMessage()], 500);
        }
    }

    public function restore(string $id): JsonResponse
    {
        try {
            $menu = Menu::withTrashed()->findOrFail($id);

            if (!$menu->trashed()) {
                return response()->json(['message' => 'Menu tidak terhapus dan tidak bisa dipulihkan.'], 409);
            }

            $menu->restore();
            return response()->json(['message' => 'Menu berhasil dipulihkan']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memulihkan menu', 'error' => $e->getMessage()], 500);
        }
    }

    public function forceDelete(string $id): JsonResponse
    {
        try {
            $menu = Menu::withTrashed()->findOrFail($id);
            $menu->forceDelete();

            return response()->json(['message' => 'Menu permanently deleted']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Menu not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to force delete menu', 'error' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|exists:menus,id',
                'items.*.order_number' => 'required|integer|min:1',
                'parent_id' => 'nullable|exists:menus,id'
            ]);

            foreach ($data['items'] as $item) {
                Menu::where('id', $item['id'])
                    ->where('parent_id', $data['parent_id'] ?? null)
                    ->update(['order_number' => $item['order_number']]);
            }

            return response()->json(['message' => 'Menu items reordered successfully']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reorder menu items', 'error' => $e->getMessage()], 500);
        }
    }

    public function toggleActive(string $id): JsonResponse
    {
        try {
            $menu = Menu::withTrashed()->findOrFail($id);
            if ($menu->trashed()) {
                return response()->json(['message' => 'Cannot toggle a trashed menu'], 409);
            }
            $menu->update(['is_active' => !$menu->is_active]);

            return response()->json([
                'message' => 'Menu status updated successfully',
                'is_active' => $menu->is_active
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Menu not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update menu status', 'error' => $e->getMessage()], 500);
        }
    }

    private function wouldCreateCircularReference(string $menuId, string $parentId): bool
    {
        $parent = Menu::withTrashed()->find($parentId);
        while ($parent) {
            if ((string) $parent->id === (string) $menuId) return true;
            $parent = $parent->parent;
        }
        return false;
    }

    /**
     * Generator + filter per product
     * POST /generate-menu?product_id=...&group_id=...&module_id=...
     */
    public function generateMenu(Request $request): JsonResponse
    {
        try {
            $groupId   = $request->query('group_id');
            $moduleId  = $request->query('module_id');
            $productId = $request->query('product_id'); // BARU

            $groupsQ = Menu::query()
                ->whereNull('parent_id')
                ->where('type', 'group')
                ->when($productId, fn($q) => $q->where('product_id', $productId)) // filter product
                ->with([
                    'recursiveChildren' => function ($q) {
                        $q->orderBy('order_number')
                          ->with([
                              'recursiveChildren' => function ($qq) {
                                  $qq->orderBy('order_number')
                                     ->with(['recursiveChildren']);
                              }
                          ]);
                    }
                ])
                ->orderBy('order_number');

            if ($groupId)  $groupsQ->where('id', $groupId);
            $groups = $groupsQ->get();

            $usedIconSet = [];
            $modulesTs = [];

            foreach ($groups as $g) {
                $modules = collect($g->recursiveChildren ?? [])
                    ->filter(fn($n) => $n->type === 'module' && empty($n->deleted_at))
                    ->sortBy('order_number')
                    ->values();

                foreach ($modules as $m) {
                    if ($moduleId && (string) $m->id !== (string) $moduleId) continue;

                    // kumpulkan semua "menu" di bawah module
                    $allMenus = $this->collectMenusDepth($m);

                    // top menu
                    $topMenus = $allMenus->filter(fn($n) => (string) $n->parent_id === (string) $m->id)
                                         ->sortBy('order_number')
                                         ->values();

                    $itemsTs = [];
                    $nestedItemsTs = [];
                    $seen = ['href' => [], 'title' => []];

                    $pushItem = function (string $icon, string $labelKey, string $href) use (&$itemsTs, &$seen) {
                        $hk = trim($href) !== '' ? strtolower($href) : '';
                        $tk = strtolower($labelKey);
                        if (($hk && isset($seen['href'][$hk])) || isset($seen['title'][$tk])) return;
                        if ($hk) $seen['href'][$hk] = true;
                        $seen['title'][$tk] = true;
                        $itemsTs[] = '{ icon: ' . $icon . ', labelKey: "' . addslashes($labelKey) . '" as any, href: "' . addslashes($href) . '" }';
                    };

                    foreach ($topMenus as $top) {
                        $topIcon = $this->normalizeLucideIcon($top->icon ?: 'FileText');
                        $usedIconSet[$topIcon] = true;

                        $children = $allMenus->filter(fn($n) => (string) $n->parent_id === (string) $top->id)
                                             ->sortBy('order_number')
                                             ->values();

                        if ($children->isEmpty()) {
                            $pushItem($topIcon, $this->labelKeyFromTitle($top->title), $top->route_path ?: '#');
                        } else {
                            $subTs = [];
                            foreach ($children as $ch) {
                                $chIcon = $this->normalizeLucideIcon($ch->icon ?: 'FileText');
                                $usedIconSet[$chIcon] = true;

                                $subTs[] = '{ icon: '.$chIcon.', label: "'.addslashes($ch->title).'", href: "'.addslashes($ch->route_path ?: "#").'" }';
                                $pushItem($chIcon, $this->labelKeyFromTitle($ch->title), $ch->route_path ?: '#');
                            }

                            $nestedItemsTs[] = '{ id: "nid_'.addslashes((string)$top->id).'", icon: '.$topIcon.', label: "'.addslashes($top->title).'", items: ['.implode(',', $subTs).'] }';

                            if (!empty($top->route_path)) {
                                $pushItem($topIcon, $this->labelKeyFromTitle($top->title), $top->route_path);
                            }
                        }
                    }

                    $modIcon = $this->normalizeLucideIcon($m->icon ?: 'Package');
                    $usedIconSet[$modIcon] = true;

                    $moduleIdStr = \Illuminate\Support\Str::slug($m->title, '-');
                    $moduleLabelKey = $this->labelKeyFromTitle($m->title);
                    $moduleDesc = (string) ($m->note ?? '');

                    $groupColor = $g->color ?: '#3b82f6';
                    $iconBgClass = 'bg-primary/15';
                    $iconColor = 'text-primary';
                    $activeBorder = 'border-primary/40';
                    $borderColor = 'border-border';
                    $hoverBorder = 'hover:border-primary/30';

                    $moduleParts = [
                        'id: "' . addslashes($moduleIdStr) . '"',
                        'icon: ' . $modIcon,
                        'labelKey: "' . addslashes($moduleLabelKey) . '" as any',
                        'description: "' . addslashes($moduleDesc) . '"',
                        'descriptionId: "' . addslashes($moduleDesc) . '"',
                        'count: ' . (count($itemsTs) + count($nestedItemsTs)),
                        'items: [' . implode(',', $itemsTs) . ']',
                    ];
                    if (!empty($nestedItemsTs)) {
                        $moduleParts[] = 'nestedItems: [' . implode(',', $nestedItemsTs) . ']';
                    }
                    $moduleParts[] = 'groupId: "' . addslashes((string) $g->id) . '"';
                    $moduleParts[] = 'groupName: "' . addslashes($g->title) . '"';
                    $moduleParts[] = 'groupColor: "' . addslashes($groupColor) . '"';
                    $moduleParts[] = 'iconBg: "' . $iconBgClass . '"';
                    $moduleParts[] = 'iconColor: "' . $iconColor . '"';
                    $moduleParts[] = 'activeBorder: "' . $activeBorder . '"';
                    $moduleParts[] = 'borderColor: "' . $borderColor . '"';
                    $moduleParts[] = 'hoverBorder: "' . $hoverBorder . '"';

                    $modulesTs[] = '{ ' . implode(', ', $moduleParts) . ' }';
                }
            }

            $menuItemsLiteral = '[' . implode(',', $modulesTs) . ']';

            [$stubPath, $template] = $this->resolveStubOrFail();
            if (strpos($template, '/*__MENU_ITEMS__*/') === false) {
                return response()->json([
                    'message' => 'Placeholder /*__MENU_ITEMS__*/ not found in stub',
                    'path' => $stubPath
                ], 500);
            }

            $template = str_replace('/*__MENU_ITEMS__*/', $menuItemsLiteral . ';', $template);
            $template = $this->injectMissingIconsIntoImport($template, array_keys($usedIconSet));

            $outDir = base_path('../appgenerate/next-gen/components');
            $outFile = $outDir . DIRECTORY_SEPARATOR . 'app-sidebar.tsx';
            \Illuminate\Support\Facades\File::ensureDirectoryExists($outDir);
            \Illuminate\Support\Facades\File::put($outFile, $template);

            return response()->json([
                'message' => 'Sidebar generated',
                'file' => $outFile,
                'stub_used' => $stubPath,
                'iconsUsed' => array_values(array_keys($usedIconSet)),
                'modules' => count($modulesTs),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to generate sidebar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function collectMenusDepth($module)
    {
        $result = collect();
        $stack = [$module];

        while (!empty($stack)) {
            $node = array_pop($stack);

            $children = collect($node->recursiveChildren ?? [])
                ->filter(fn($n) => empty($n->deleted_at))
                ->sortBy('order_number')
                ->values();

            foreach ($children as $ch) {
                if ($ch->type === 'menu') $result->push($ch);
                $stack[] = $ch;
            }
        }

        return $result;
    }

    private function resolveStubOrFail(): array
    {
        $candidates = [
            base_path('stubs/frontend/app-sidebar.stub'),
        ];

        foreach ($candidates as $path) {
            if (File::exists($path)) {
                return [$path, File::get($path)];
            }
        }

        throw new \RuntimeException("Stub file not found. Checked paths:\n- " . implode("\n- ", $candidates));
    }

    private function normalizeLucideIcon(?string $name): string
    {
        $n = trim((string) $name);
        if ($n === '') return 'Folder';
        $n = preg_replace('/\s+/', '', $n);
        $n = preg_replace_callback('/[-_](.)/', fn($m) => strtoupper($m[1] ?? ''), $n);
        $n = ucfirst($n);
        static $map = [
            'Filetext' => 'FileText',
            'Arrowrightleft' => 'ArrowRightLeft',
            'Rotateccw' => 'RotateCcw',
            'Creditcard' => 'CreditCard',
            'Barchart3' => 'BarChart3',
            'Usercheck' => 'UserCheck',
            'Dollarsign' => 'DollarSign',
            'Piechart' => 'PieChart',
        ];
        return $map[$n] ?? $n;
    }

    private function labelKeyFromTitle(string $title): string
    {
        $slug = \Illuminate\Support\Str::slug($title, ' ');
        $label = ucwords(strtolower($slug));
        return $label;
    }

    private function injectMissingIconsIntoImport(string $template, array $needed): string
    {
        return preg_replace_callback(
            '/import\s*\{\s*([^}]+)\}\s*from\s*[\'"]lucide-react[\'"]\s*;?/m',
            function ($m) use ($needed) {
                $inside = $m[1];
                $parts = array_filter(array_map('trim', explode(',', $inside)));
                $existing = [];
                foreach ($parts as $p) {
                    $tok = preg_split('/\s+as\s+/i', $p);
                    $base = trim($tok[0]);
                    if ($base !== '') $existing[$base] = true;
                    if (isset($tok[1])) {
                        $alias = trim($tok[1]);
                        if ($alias !== '') $existing[$alias] = true;
                    }
                }
                foreach ($needed as $icon) {
                    if (!isset($existing[$icon])) {
                        $parts[] = $icon;
                        $existing[$icon] = true;
                    }
                }
                $newInside = implode(', ', $parts);
                return 'import { ' . $newInside . ' } from "lucide-react";';
            },
            $template,
            1
        );
    }
}
