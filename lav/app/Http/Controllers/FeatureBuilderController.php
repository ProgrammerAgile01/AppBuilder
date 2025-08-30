<?php

namespace App\Http\Controllers;

use App\Models\FeatureBuilder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class FeatureBuilderController extends Controller
{
    /** GET /api/fitur
     *  Optional: ?search=...&type=feature|category|subfeature&root_only=1&parent_id=ID&with_tree=1&trash=with|only&product_id=...&product_code=...
     */
    public function index(Request $req): JsonResponse
    {
        $trash = $req->query('trash', 'none'); // none|with|only

        $q = FeatureBuilder::query();
        if ($trash === 'with') {
            $q->withTrashed();
        } elseif ($trash === 'only') {
            $q->onlyTrashed();
        }

        // filter per produk (id atau code)
        if ($pid = $req->query('product_id')) {
            $q->where('product_id', $pid);
        }
        if ($pcode = $req->query('product_code')) {
            $q->where('product_code', $pcode);
        }

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
        if ($pid2 = $req->query('parent_id')) {
            $q->where('parent_id', $pid2);
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
        if ($withTrashed) {
            $q->withTrashed();
        }

        $item = $q->findOrFail($id);
        return response()->json(['data' => $item]);
    }

    /** Helper validasi */
    protected function rules(?int $id = null): array
    {
        return [
            'product_id' => ['required', 'string', 'max:36'],
            'product_code' => ['nullable', 'string', 'max:64'],
            'parent_id' => ['nullable', 'integer', 'exists:mst_feature_builder,id'],
            'name' => ['required', 'string', 'max:160'],
            'feature_code' => [
                'required',
                'string',
                'max:128',
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
        return response()->json(['message' => 'Feature restored', 'data' => $row]);
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

    /** GET /api/fitur/tree (root+children 2 tingkat) */
    public function tree(Request $req): JsonResponse
    {
        $trash = $req->query('trash', 'none');

        $q = FeatureBuilder::query()->whereNull('parent_id')->orderBy('order_number');
        if ($trash === 'with') $q->withTrashed();
        elseif ($trash === 'only') $q->onlyTrashed();

        // filter by product_id or product_code
        if ($pid = $req->query('product_id')) $q->where('product_id', $pid);
        if ($pcode = $req->query('product_code')) $q->where('product_code', $pcode);

        $roots = $q->with([
            'children' => function ($qq) use ($trash) {
                if ($trash !== 'none') $qq->withTrashed();
                $qq->orderBy('order_number');
            }
        ])->get();

        return response()->json(['data' => $roots]);
    }

    /** GET /api/fitur/trash-box?product_id=...&product_code=... */
    public function trashBox(Request $req): JsonResponse
    {
        $base = FeatureBuilder::onlyTrashed()
            ->when($req->query('product_id'), fn($q, $pid) => $q->where('product_id', $pid))
            ->when($req->query('product_code'), fn($q, $code) => $q->where('product_code', $code))
            ->orderBy('deleted_at', 'desc');

        $all = (clone $base)->get();
        $byType = [
            'category'   => $all->where('type', 'category')->values(),
            'feature'    => $all->where('type', 'feature')->values(),
            'subfeature' => $all->where('type', 'subfeature')->values(),
        ];

        return response()->json([
            'success' => true,
            'totals' => [
                'all'        => $all->count(),
                'category'   => $byType['category']->count(),
                'feature'    => $byType['feature']->count(),
                'subfeature' => $byType['subfeature']->count(),
            ],
            'data' => [
                'category'   => $byType['category'],
                'feature'    => $byType['feature'],
                'subfeature' => $byType['subfeature'],
            ],
        ]);
    }

    /** POST /api/fitur/generate/{product}
     * {product} bisa berupa UUID id ATAU product_code (string, mis. RENTVIX)
     * - Membuat/overwrite file seeder khusus produk ini (snapshot)
     * - Menjalankan migrate & seeder otomatis
     */
    public function generate(string $product): JsonResponse
{
    // Resolve produk dari id ATAU product_code (string)
    $prod = \App\Models\Product::query()
        ->where('id', $product)
        ->orWhere('product_code', $product)
        ->firstOrFail();

    $productId   = (string) $prod->id;
    $productCode = (string) $prod->product_code;

    try {
        // ===== Siapkan folder tujuan (appgenerate) =====
        $baseGen = base_path('../appgenerate/lav-gen');
        $this->ensureDir($baseGen . '/database/migrations');
        $this->ensureDir($baseGen . '/database/seeders');
        $this->ensureDir($baseGen . '/app/Models');
        $this->ensureDir($baseGen . '/app/Http/Controllers/Generate');
        $this->ensureFile($baseGen . '/routes/api.php');

        // ===== 1) MIGRATION (buat sekali jika belum ada)
        $this->generateMigrationFeatureBuilder();

        // ===== 2) MODEL (buat sekali jika belum ada)
        $this->generateModelFeatureBuilder();

        // ===== 3) CONTROLLER dummy di appgenerate (sekali)
        $this->generateControllerFeatureBuilder();

        // ===== 4) ROUTES – append sekali saja
        $this->appendRoutesFeatureBuilder();

        // ===== 5) SEEDER khusus product (kembalikan class + path absolut)
        // IMPORTANT: generateFeatureSeederForProduct() harus return [$className, $absolutePath]
        [$seederClass, $seederPath] = $this->generateFeatureSeederForProduct($productId, $productCode);

        // Pastikan file seeder bisa di-load oleh autoloader
        if (is_file($seederPath)) {
            require_once $seederPath;
        }

        // ===== 6) Jalankan migrate & seed dengan path REAL di appgenerate =====
        $migrationPath = $baseGen . '/database/migrations';

        // migrate khusus folder appgenerate/lav-gen
        if (is_dir($migrationPath)) {
            \Artisan::call('migrate', [
                '--path'     => $migrationPath,
                '--realpath' => true,
                '--force'    => true,
            ]);
        }

        // seed seeder hasil generate (per-produk) di path appgenerate
        \Artisan::call('db:seed', [
            '--class'    => $seederClass, // mis: FeatureBuilderProductRENTVIXSeeder
            '--path'     => $seederPath,  // absolut
            '--realpath' => true,
            '--force'    => true,
        ]);

        // (Opsional) Anda bisa ambil output bila perlu debugging:
        // $migrateOutput = \Artisan::output();

        return response()->json([
            'success' => true,
            'message' => "Berhasil generate fitur untuk {$productCode} dan menjalankan migrate + seed otomatis.",
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal generate fitur: ' . $e->getMessage(),
        ], 500);
    }
}


    /* ================== Helpers Generator ================== */

    private function ensureDir(string $path): void
    {
        if (!File::isDirectory($path)) File::makeDirectory($path, 0755, true);
    }

    private function ensureFile(string $path): void
    {
        if (!File::exists($path)) File::put($path, "<?php\n\n");
    }

    private function generateMigrationFeatureBuilder(): void
    {
        $destDir = base_path('../appgenerate/lav-gen/database/migrations');
        if (!File::isDirectory($destDir)) File::makeDirectory($destDir, 0755, true);

        $existing = collect(File::files($destDir))
            ->first(fn($f) => Str::contains($f->getFilename(), 'create_mst_feature_builder_table'));
        if ($existing) return;

        $stub = <<<PHP
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mst_feature_builder', function (Blueprint \$table) {
            \$table->id();
            \$table->string('product_id', 36);
            \$table->string('product_code', 64)->nullable();
            \$table->unsignedBigInteger('parent_id')->nullable()->index();
            \$table->string('name', 160);
            \$table->string('feature_code', 128)->index();
            \$table->enum('type', ['category','feature','subfeature'])->default('feature');
            \$table->text('description')->nullable();
            \$table->unsignedBigInteger('crud_menu_id')->nullable();
            \$table->unsignedInteger('price_addon')->default(0);
            \$table->boolean('trial_available')->default(false);
            \$table->unsignedInteger('trial_days')->nullable();
            \$table->boolean('is_active')->default(true);
            \$table->unsignedInteger('order_number')->default(0);
            \$table->softDeletes();
            \$table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('mst_feature_builder');
    }
};
PHP;

        $filename = now()->format('Y_m_d_His') . '_create_mst_feature_builder_table.php';
        File::put($destDir . '/' . $filename, $stub);
    }

    private function generateModelFeatureBuilder(): void
    {
        $dest = base_path('../appgenerate/lav-gen/app/Models/FeatureBuilder.php');
        if (File::exists($dest)) return;

        $stub = <<<PHP
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;

class FeatureBuilder extends Model
{
    use HasFactory, SoftDeletes;

    protected \$table = 'mst_feature_builder';
    protected \$fillable = [
        'product_id','product_code','parent_id','name','feature_code','type',
        'description','crud_menu_id','price_addon','trial_available','trial_days',
        'is_active','order_number'
    ];

    protected \$casts = [
        'trial_available' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function children() {
        return \$this->hasMany(self::class, 'parent_id')->orderBy('order_number');
    }

    public function parent() {
        return \$this->belongsTo(self::class, 'parent_id');
    }

    public function menu() {
        return \$this->belongsTo(\\App\\Models\\Menu::class, 'crud_menu_id');
    }
}
PHP;

        File::put($dest, $stub);
    }

    private function generateControllerFeatureBuilder(): void
    {
        $dest = base_path('../appgenerate/lav-gen/app/Http/Controllers/Generate/FeatureBuilderController.php');
        if (File::exists($dest)) return;

        $stub = <<<PHP
<?php

namespace App\\Http\\Controllers\\Generate;

use App\\Http\\Controllers\\Controller;
use App\\Models\\FeatureBuilder;
use Illuminate\\Http\\Request;
use Illuminate\\Validation\\Rule;

class FeatureBuilderController extends Controller
{
    public function index(Request \$req) {
        \$q = FeatureBuilder::query();
        if (\$pid = \$req->query('product_id')) \$q->where('product_id', \$pid);
        if (\$req->boolean('root_only', false)) \$q->whereNull('parent_id');
        \$q->orderBy('order_number');
        return response()->json(['data' => \$q->get()]);
    }

    public function show(string \$id) {
        \$row = FeatureBuilder::with('children')->findOrFail(\$id);
        return response()->json(['data' => \$row]);
    }

    protected function rules(?int \$id=null): array {
        return [
            'product_id' => ['required','string','max:36'],
            'product_code' => ['nullable','string','max:64'],
            'parent_id' => ['nullable','integer'],
            'name' => ['required','string','max:160'],
            'feature_code' => [
                'required','string','max:128',
                Rule::unique('mst_feature_builder','feature_code')->ignore(\$id)->where(fn(\$q)=>\$q->where('product_id', request('product_id')))
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

    public function store(Request \$req) {
        \$data = \$req->validate(\$this->rules());
        \$row = FeatureBuilder::create(\$data);
        return response()->json(['data'=>\$row],201);
    }

    public function update(Request \$req, string \$id) {
        \$row = FeatureBuilder::withTrashed()->findOrFail(\$id);
        \$data = \$req->validate(\$this->rules((int)\$row->id));
        \$row->update(\$data);
        return response()->json(['data'=>\$row]);
    }

    public function destroy(string \$id) {
        \$row = FeatureBuilder::findOrFail(\$id);
        \$row->delete();
        return response()->json(['message'=>'deleted']);
    }
}
PHP;

        File::put($dest, $stub);
    }

    private function appendRoutesFeatureBuilder(): void
    {
        $apiFile = base_path('../appgenerate/lav-gen/routes/api.php');
        $this->ensureFile($apiFile);
        $content = File::get($apiFile);

        $needle = "Route::apiResource('fitur'";
        if (Str::contains($content, $needle)) return;

        $route = "\nRoute::get('fitur/tree', [\\App\\Http\\Controllers\\Generate\\FeatureBuilderController::class, 'index']);\n";
        $route .= "Route::apiResource('fitur', \\App\\Http\\Controllers\\Generate\\FeatureBuilderController::class);\n";

        File::append($apiFile, $route);
    }

    /**
     * Membuat file seeder khusus untuk snapshot fitur milik satu produk.
     * ClassName: FeatureBuilderProduct{PRODUCTCODE}Seeder  (contoh: FeatureBuilderProductRENTVIXSeeder)
     * Menghapus fitur lama produk tsb, lalu insert snapshot.
     */
    protected function generateFeatureSeederForProduct(string $productId, string $productCode): string
    {
        // Ambil semua fitur (termasuk trash) agar snapshot lengkap
        $rows = FeatureBuilder::withTrashed()
            ->where('product_id', $productId)
            ->orderBy('parent_id')
            ->orderBy('order_number')
            ->orderBy('id')
            ->get()
            ->map(function (FeatureBuilder $f) {
                return [
                    'id'              => $f->id,
                    'product_id'      => $f->product_id,
                    'product_code'    => $f->product_code,
                    'parent_id'       => $f->parent_id,
                    'name'            => $f->name,
                    'feature_code'    => $f->feature_code,
                    'type'            => $f->type,
                    'description'     => $f->description,
                    'crud_menu_id'    => $f->crud_menu_id,
                    'price_addon'     => $f->price_addon,
                    'trial_available' => (bool) $f->trial_available,
                    'trial_days'      => $f->trial_days,
                    'is_active'       => (bool) $f->is_active,
                    'order_number'    => $f->order_number,
                    'deleted_at'      => $f->deleted_at,
                    'created_at'      => $f->created_at,
                    'updated_at'      => $f->updated_at,
                ];
            })
            ->values()
            ->all();

        $className = 'FeatureBuilderProduct' . Str::studly($productCode) . 'Seeder';

        $stub = <<<PHP
<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\DB;

class {$className} extends Seeder
{
    public function run(): void
    {
        // Gunakan product_code (string)
        \$productCode = '{$productCode}';

        // Hapus semua fitur milik product_code ini (termasuk yang soft-deleted)
        DB::table('mst_feature_builder')->where('product_code', \$productCode)->delete();

        // Snapshot data fitur
        \$rows = %s;

        // Pastikan kolom product_code konsisten
        foreach (\$rows as &\$r) {
            \$r['product_code'] = \$productCode;
        }
        unset(\$r);

        // Insert ulang
        foreach (\$rows as \$r) {
            DB::table('mst_feature_builder')->insert(\$r);
        }
    }
}

PHP;

        $export = var_export($rows, true);
        $content = sprintf($stub, $export);

        $path = base_path('../appgenerate/lav-gen/database/seeders/' . $className . '.php');
        File::put($path, $content);

        return 'Database\\Seeders\\' . $className;
    }
}