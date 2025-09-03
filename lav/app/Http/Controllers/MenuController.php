<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Product;
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
    /**
     * Gabungan:
     * - Generate Sidebar Next.js per produk
     * - Scaffold CRUD Menu (migration, model, controller, seeder, routes) per produk
     *
     * Query/body:
     *  - product_code (disarankan) atau product_id
     *  - (opsional) only=sidebar|crud  -> kalau mau jalankan salah satu saja
     */
    public function generateMenu(Request $request): JsonResponse
    {
        try {
            $productId    = $request->input('product_id');
            $productCodeQ = $request->input('product_code');
            $only         = $request->input('only'); // 'sidebar' | 'crud' | null

            // ===== 0) Konteks produk =====
            $ctx = $this->resolveProductContext($productId, $productCodeQ);
            if (!$ctx['id'] && !$ctx['code']) {
                return response()->json(['message' => 'Produk tidak ditemukan. Sertakan product_code atau product_id yang valid.'], 422);
            }

            $result = [
                'product' => $ctx['code'],
            ];

            // ===== 1) Generate Sidebar Next.js =====
            if ($only !== 'crud') {
                // Ambil groups (root) khusus product_code
                $groupsQ = Menu::query()
                    ->whereNull('parent_id')
                    ->where('type', 'group')
                    ->when($ctx['code'], fn($q) => $q->where('product_code', $ctx['code']))
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

                $groups = $groupsQ->get();

                $usedIconSet = [];
                $modulesTs   = [];

                foreach ($groups as $g) {
                    $modules = collect($g->recursiveChildren ?? [])
                        ->filter(fn($n) => $n->type === 'module' && empty($n->deleted_at))
                        ->sortBy('order_number')
                        ->values();

                    foreach ($modules as $m) {
                        $allMenus = $this->collectMenusDepth($m);

                        // anak langsung dari module
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

                        $moduleIdStr    = Str::slug($m->title, '-');
                        $moduleLabelKey = $this->labelKeyFromTitle($m->title);
                        $moduleDesc     = (string) ($m->note ?? '');

                        $groupColor   = $g->color ?: '#3b82f6';
                        $iconBgClass  = 'bg-primary/15';
                        $iconColor    = 'text-primary';
                        $activeBorder = 'border-primary/40';
                        $borderColor  = 'border-border';
                        $hoverBorder  = 'hover:border-primary/30';

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

                [$stubPath, $template] = $this->resolveStubOrFail(); // stub tunggal
                if (strpos($template, '/*__MENU_ITEMS__*/') === false) {
                    return response()->json([
                        'message' => 'Placeholder /*__MENU_ITEMS__*/ not found in stub',
                        'path'    => $stubPath
                    ], 500);
                }
                $template = str_replace('/*__MENU_ITEMS__*/', $menuItemsLiteral . ';', $template);
                $template = $this->injectMissingIconsIntoImport($template, array_keys($usedIconSet));

                $outDirNext = base_path('../appgenerate/' . $ctx['code'] . '/next-gen/components');
                File::ensureDirectoryExists($outDirNext);
                $outSidebar = $outDirNext . DIRECTORY_SEPARATOR . 'app-sidebar.tsx';
                File::put($outSidebar, $template);

                $result['sidebar'] = [
                    'stub_used' => $stubPath,
                    'file'      => $outSidebar,
                    'icons'     => array_values(array_keys($usedIconSet)),
                ];
            }

            // ===== 2) Scaffold CRUD Menu (Laravel) =====
            if ($only !== 'sidebar') {
                $BASE      = base_path('../appgenerate/' . $ctx['code'] . '/lav-gen');
                $dirModels = $BASE . '/app/Models';
                $dirCtrl   = $BASE . '/app/Http/Controllers/Generate';
                $dirMig    = $BASE . '/database/migrations';
                $dirSeed   = $BASE . '/database/seeders';
                $dirRoutes = $BASE . '/routes';

                File::ensureDirectoryExists($dirModels);
                File::ensureDirectoryExists($dirCtrl);
                File::ensureDirectoryExists($dirMig);
                File::ensureDirectoryExists($dirSeed);
                File::ensureDirectoryExists($dirRoutes);

                $migrationPath  = $this->writeMenusMigration($dirMig);
                $modelPath      = $this->writeMenuModel($dirModels);
                $controllerPath = $this->writeMenuController($dirCtrl);
                $seederPath     = $this->writeMenuSeederFromExisting($dirSeed, $ctx['code']);

                $routesFile = $dirRoutes . '/api.php';
                $this->ensureRoutesFile($routesFile);
                $this->appendRoutesNoPrefix($routesFile);

                $result['crud'] = [
                    'migration'  => $migrationPath,
                    'model'      => $modelPath,
                    'controller' => $controllerPath,
                    'seeder'     => $seederPath,
                    'routes'     => $routesFile,
                    'run_after'  => [
                        "cd ../appgenerate/{$ctx['code']}/lav-gen",
                        "php artisan migrate",
                        "php artisan db:seed --class=MenuSeeder",
                    ],
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Generate OK',
                'data'    => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /* ====================== Helpers (Sidebar) ====================== */

    private function collectMenusDepth($module)
    {
        $result = collect();
        $stack  = [$module];

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
        $path = base_path('stubs/frontend/app-sidebar.stub');
        if (!File::exists($path)) {
            throw new \RuntimeException("Stub file not found at: {$path}");
        }
        return [$path, File::get($path)];
    }

    private function normalizeLucideIcon(?string $name): string
    {
        $n = trim((string) $name);
        if ($n === '') return 'Folder';
        $n = preg_replace('/\s+/', '', $n);
        $n = preg_replace_callback('/[-_](.)/', fn($m) => strtoupper($m[1] ?? ''), $n);
        $n = ucfirst($n);
        static $map = [
            'Filetext'       => 'FileText',
            'Arrowrightleft' => 'ArrowRightLeft',
            'Rotateccw'      => 'RotateCcw',
            'Creditcard'     => 'CreditCard',
            'Barchart3'      => 'BarChart3',
            'Usercheck'      => 'UserCheck',
            'Dollarsign'     => 'DollarSign',
            'Piechart'       => 'PieChart',
        ];
        return $map[$n] ?? $n;
    }

    private function labelKeyFromTitle(string $title): string
    {
        $slug  = Str::slug($title, ' ');
        return ucwords(strtolower($slug));
    }

    private function injectMissingIconsIntoImport(string $template, array $needed): string
    {
        return preg_replace_callback(
            '/import\s*\{\s*([^}]+)\}\s*from\s*[\'"]lucide-react[\'"]\s*;?/m',
            function ($m) use ($needed) {
                $inside   = $m[1];
                $parts    = array_filter(array_map('trim', explode(',', $inside)));
                $existing = [];
                foreach ($parts as $p) {
                    $tok  = preg_split('/\s+as\s+/i', $p);
                    $base = trim($tok[0]);
                    if ($base !== '') $existing[$base] = true;
                    if (isset($tok[1])) {
                        $alias = trim($tok[1]);
                        if ($alias !== '') $existing[$alias] = true;
                    }
                }
                foreach ($needed as $icon) {
                    if (!isset($existing[$icon])) {
                        $parts[]         = $icon;
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

    private function resolveProductContext(?string $productId, ?string $productCodeQ): array
    {
        $prod = null;
        if ($productCodeQ) {
            $prod = Product::query()->where('product_code', $productCodeQ)->first();
        } elseif ($productId) {
            $prod = Product::query()->where('id', $productId)->first();
        }

        if (!$prod) return ['id' => null, 'code' => null];

        $rawCode  = (string) ($prod->product_code ?? '');
        $safeCode = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $rawCode));
        if ($safeCode === '') $safeCode = strtoupper(Str::slug($rawCode, ''));

        return [
            'id'   => (string) $prod->id,
            'code' => $safeCode,
        ];
    }

    /* ====================== Helpers (CRUD Scaffold) ====================== */
    private function timestamp(): string
    {
        return now()->format('Y_m_d_His');
    }

    private function writeMenusMigration(string $dirMig): string
{
    $existing = collect(glob($dirMig . '/*_create_mst_menus_table.php'))->first();
    $file = $existing ?: ($dirMig . '/' . $this->timestamp() . '_create_mst_menus_table.php');

    $content = <<<'PHP'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1) CREATE tanpa FK eksternal, dan parent_id belum di-foreign
        Schema::create('mst_menus', function (Blueprint $table) {
            $table->id();

            // pakai unsignedBigInteger + index, FK nanti (step 2)
            $table->unsignedBigInteger('parent_id')->nullable()->index();

            $table->tinyInteger('level')->default(1);
            $table->enum('type', ['group', 'module', 'menu', 'submenu'])->default('menu');
            $table->string('title');
            $table->string('icon')->nullable();
            $table->string('color', 32)->nullable();
            $table->integer('order_number')->default(0);

            // kolom terkait tabel eksternal, TANPA constrained()
            $table->unsignedBigInteger('crud_builder_id')->nullable()->index();
            $table->string('product_code', 64)->index()->nullable();
            $table->string('route_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('note')->nullable();

            // TANPA constrained('users') – cukup kolom + index
            $table->unsignedBigInteger('created_by')->nullable()->index();

            $table->softDeletes();
            $table->timestamps();
        });

        // 2) Baru tambahkan self-FK untuk parent_id setelah tabel ada
        Schema::table('mst_menus', function (Blueprint $table) {
            $table->foreign('parent_id')
                  ->references('id')->on('mst_menus')
                  ->cascadeOnDelete();
        });

        // Kalau suatu saat kamu PASTI punya tabel ini di workspace produk,
        // kamu bisa aktifkan FK berikut:
        /*
        Schema::table('mst_menus', function (Blueprint $table) {
            if (Schema::hasTable('crud_builders')) {
                $table->foreign('crud_builder_id')->references('id')->on('crud_builders')->nullOnDelete();
            }
            if (Schema::hasTable('users')) {
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            }
        });
        */
    }

    public function down(): void
    {
        Schema::table('mst_menus', function (Blueprint $table) {
            // drop FK kalau ada
            try { $table->dropForeign(['parent_id']); } catch (\Throwable $e) {}
            try { $table->dropForeign(['crud_builder_id']); } catch (\Throwable $e) {}
            try { $table->dropForeign(['created_by']); } catch (\Throwable $e) {}
        });
        Schema::dropIfExists('mst_menus');
    }
};
PHP;

    \Illuminate\Support\Facades\File::put($file, $content);
    return $file;
}


    private function writeMenuModel(string $dirModels): string
    {
        $file = $dirModels . '/Menu.php';
        $content = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'mst_menus';

    protected $fillable = [
        'parent_id',
        'level',
        'type',
        'title',
        'icon',
        'color',
        'order_number',
        'crud_builder_id',
        'product_code',
        'route_path',
        'is_active',
        'note',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
        'order_number' => 'integer',
    ];

    public function parent()  { return $this->belongsTo(Menu::class, 'parent_id'); }
    public function children(){ return $this->hasMany(Menu::class, 'parent_id')->orderBy('order_number'); }
    public function recursiveChildren(){ return $this->children()->with('recursiveChildren'); }
    public function crudBuilder(){ return $this->belongsTo(\App\Models\CrudBuilder::class, 'crud_builder_id'); }
    public function creator(){ return $this->belongsTo(\App\Models\User::class, 'created_by'); }

    public function scopeForProduct($q, ?string $code)
    {
        if ($code) $q->where('product_code', $code);
        return $q;
    }

    public function scopeActive($q){ return $q->where('is_active', true); }
}
PHP;
        File::put($file, $content);
        return $file;
    }

    private function writeMenuController(string $dirCtrl): string
    {
        $file = $dirCtrl . '/MenuController.php';
        $content = <<<'PHP'
<?php

namespace App\Http\Controllers\Generate;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    // GET /api/menus?product_code=RENTVIX&trash=with|only|none
    public function index(Request $req)
    {
        $productCode = $req->query('product_code');
        $trash = $req->query('trash', 'none');

        $q = Menu::query()->forProduct($productCode);
        if ($trash === 'with') $q->withTrashed();
        elseif ($trash === 'only') $q->onlyTrashed();

        return response()->json(['success' => true, 'data' => $q->orderBy('order_number')->get()]);
    }

    // GET /api/menus/tree?product_code=RENTVIX
    public function tree(Request $req)
    {
        $productCode = $req->query('product_code');

        $roots = Menu::query()
            ->forProduct($productCode)
            ->whereNull('parent_id')
            ->with(['recursiveChildren' => fn($q) => $q->orderBy('order_number')])
            ->orderBy('order_number')
            ->get();

        return response()->json(['success' => true, 'data' => $roots]);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'title'        => ['required', 'string', 'max:255'],
            'type'         => ['required', 'in:group,module,menu,submenu'],
            'product_code' => ['nullable', 'string', 'max:64'],
            'parent_id'    => ['nullable', 'exists:mst_menus,id'],
            'icon'         => ['nullable', 'string', 'max:100'],
            'color'        => ['nullable', 'string', 'max:32'],
            'order_number' => ['nullable', 'integer'],
            'crud_builder_id' => ['nullable', 'exists:crud_builders,id'],
            'route_path'   => ['nullable', 'string', 'max:255'],
            'is_active'    => ['nullable', 'boolean'],
            'note'         => ['nullable', 'string'],
            'created_by'   => ['nullable', 'exists:users,id'],
        ]);

        $data['level'] = !empty($data['parent_id'])
            ? (int) (Menu::find($data['parent_id'])->level ?? 0) + 1
            : 1;

        $row = Menu::create($data);
        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function show(string $id)
    {
        return response()->json(['success' => true, 'data' => Menu::withTrashed()->findOrFail($id)]);
    }

    public function update(Request $req, string $id)
    {
        $data = $req->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'type'         => ['sometimes', 'in:group,module,menu,submenu'],
            'product_code' => ['sometimes', 'nullable', 'string', 'max:64'],
            'parent_id'    => ['sometimes', 'nullable', 'exists:mst_menus,id'],
            'icon'         => ['sometimes', 'nullable', 'string', 'max:100'],
            'color'        => ['sometimes', 'nullable', 'string', 'max:32'],
            'order_number' => ['sometimes', 'integer'],
            'crud_builder_id' => ['sometimes', 'nullable', 'exists:crud_builders,id'],
            'route_path'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active'    => ['sometimes', 'boolean'],
            'note'         => ['sometimes', 'nullable', 'string'],
            'created_by'   => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $row = Menu::withTrashed()->findOrFail($id);

        if (array_key_exists('parent_id', $data)) {
            $parentLevel = $data['parent_id'] ? ((int)(Menu::find($data['parent_id'])->level ?? 0)) : 0;
            $data['level'] = $data['parent_id'] ? $parentLevel + 1 : 1;
        }

        $row->update($data);
        return response()->json(['success' => true, 'data' => $row]);
    }

    public function destroy(string $id)
    {
        Menu::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function restore(string $id)
    {
        $row = Menu::onlyTrashed()->findOrFail($id);
        $row->restore();
        return response()->json(['success' => true, 'data' => $row]);
    }

    public function forceDelete(string $id)
    {
        DB::transaction(function () use ($id) {
            $this->deleteSubtree((int)$id);
        });
        return response()->json(['success' => true]);
    }

    private function deleteSubtree(int $id): void
    {
        $node = Menu::withTrashed()->find($id);
        if (!$node) return;

        $children = Menu::withTrashed()->where('parent_id', $id)->get();
        foreach ($children as $ch) $this->deleteSubtree((int)$ch->id);

        $node->forceDelete();
    }

    // POST /api/menus/reorder
    // Body: [{ "id": 10, "order_number": 1, "parent_id": null }, ...]
    public function reorder(Request $req)
    {
        $items = $req->validate([
            '*.id'           => ['required', 'integer', 'exists:mst_menus,id'],
            '*.order_number' => ['required', 'integer'],
            '*.parent_id'    => ['nullable', 'integer', 'exists:mst_menus,id'],
        ]);

        DB::transaction(function () use ($items) {
            foreach ($items as $it) {
                $m = Menu::find($it['id']);
                $m->order_number = $it['order_number'];
                $m->parent_id    = $it['parent_id'] ?? null;
                $m->level        = $m->parent_id ? ((int)(Menu::find($m->parent_id)->level ?? 0) + 1) : 1;
                $m->save();
            }
        });

        return response()->json(['success' => true]);
    }
}
PHP;
        File::put($file, $content);
        return $file;
    }

    /**
     * Seeder diisi dari data Menu yang SUDAH ADA di App Builder untuk product_code terkait
     * (urut level ASC agar parent lebih dulu). FK off saat seed.
     */
    private function writeMenuSeederFromExisting(string $dirSeed, string $productCode): string
    {
        $rows = Menu::query()
            ->where('product_code', $productCode)
            ->orderBy('level')
            ->orderBy('order_number')
            ->get([
                'id','parent_id','level','type','title','icon','color','order_number',
                'crud_builder_id', 'product_id', 'product_code','route_path','is_active','note',
                'created_by','deleted_at','created_at','updated_at',
            ])
            ->map(function ($m) {
                $arr = $m->toArray();
                $arr['is_active'] = (bool)$arr['is_active'];
                if (!empty($arr['created_at'])) $arr['created_at'] = (string)$arr['created_at'];
                if (!empty($arr['updated_at'])) $arr['updated_at'] = (string)$arr['updated_at'];
                if (!empty($arr['deleted_at'])) $arr['deleted_at'] = (string)$arr['deleted_at'];
                return $arr;
            })
            ->values()
            ->all();

        $rowsPhp = var_export($rows, true);

        $file = $dirSeed . '/MenuSeeder.php';
        $content = <<<PHP
<?php

namespace Database\\Seeders;

use Carbon\Carbon;
use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Insert berdasarkan level agar parent lebih dulu
        \$rows = {$rowsPhp};

        \$fmt = function (\$v) {
            if (\$v === null || \$v === '') return null;
            try { return Carbon::parse(\$v)->format('Y-m-d H:i:s'); }
            catch (\\Throwable \$e) { return now()->format('Y-m-d H:i:s'); }
        };

        // --- whitelist kolom yang valid di schema target
        \$allowed = [
            'id','parent_id','level','type','title','icon','color','order_number',
            'crud_builder_id', 'product_id', 'product_code','route_path','is_active','note',
            'created_by','deleted_at','created_at','updated_at',
        ];
        \$allowFlip = array_flip(\$allowed);

        foreach (\$rows as \$r) {
            // mapping is_deleted -> deleted_at
            if (array_key_exists('is_deleted', \$r)) {
                if (\$r['is_deleted'] && empty(\$r['deleted_at'])) {
                    \$r['deleted_at'] = now();
                }
                unset(\$r['is_deleted']);
            }

            // buang kolom yang tidak ada di schema target
            \$r = array_intersect_key(\$r, \$allowFlip);

            \$r = array_merge([
                'parent_id' => null,
                'level' => 1,
                'icon' => null,
                'color' => null,
                'order_number' => 0,
                'crud_builder_id' => null,
                'product_id' => null,
                'product_code' => null,
                'route_path' => null,
                'is_active' => true,
                'note' => null,
                'created_by' => null,
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ], \$r);

            \$r['created_at'] = \$fmt(\$r['created_at'] ?? null);
            \$r['updated_at'] = \$fmt(\$r['updated_at'] ?? null);
            \$r['deleted_at'] = \$fmt(\$r['deleted_at'] ?? null);

            DB::table('mst_menus')->updateOrInsert(['id' => \$r['id']], \$r);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
PHP;
        File::put($file, $content);
        return $file;
    }

    private function ensureRoutesFile(string $path): void
    {
        if (!File::exists($path)) {
            File::put($path, "<?php\n\nuse Illuminate\\Support\\Facades\\Route;\n\n");
        }
    }

    private function appendRoutesNoPrefix(string $routesFile): void
    {
        $markerStart = "// == menus_START ==";
        $markerEnd   = "// == menus_END ==";

        $block = <<<PHP

{$markerStart}
use App\\Http\\Controllers\\Generate\\MenuController;

Route::get('menus/tree', [MenuController::class, 'tree']);
Route::post('menus/reorder', [MenuController::class, 'reorder']);
Route::post('menus/{id}/restore', [MenuController::class, 'restore']);
Route::delete('menus/{id}/force', [MenuController::class, 'forceDelete']);
Route::apiResource('menus', MenuController::class);
{$markerEnd}

PHP;

        $current = File::get($routesFile);

        $pattern = "/" . preg_quote($markerStart, "/") . ".*?" . preg_quote($markerEnd, "/") . "/s";
        if (preg_match($pattern, $current)) {
            $current = preg_replace($pattern, trim($block) . "\n", $current);
        } else {
            $current .= $block;
        }

        File::put($routesFile, $current);
    }
}