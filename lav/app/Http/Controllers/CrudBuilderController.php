<?php

namespace App\Http\Controllers;

use App\Models\CrudBuilder;
use App\Models\CrudField;
use App\Models\CrudStatistic;
use App\Models\Modules;
use File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Str;

class CrudBuilderController extends Controller
{
    // =========== REST METHOD ===========
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $builders = CrudBuilder::withoutTrashed()->withCount('fields')->with(['product.templateFrontend', 'fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu'])->orderBy('updated_at')->get();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil menampilkan semua data builder',
                'data' => $builders,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menampilkan data builder ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validasi awal
        try {
            $validated = $request->validate([
                'product_id' => 'required|uuid|exists:mst_products,id',
                'kategori_crud' => 'required|in:utama,pendukung',
                'judul' => 'required|string',
                'nama_tabel' => 'required|string|unique:crud_builders,nama_tabel',
                'field_categories' => 'nullable|array',
                'field_categories.*.nama_kategori' => 'required|string',
                'field_categories.*.columns' => 'nullable|array',
                'field_categories.*.columns.*.nama_kolom' => 'required|string',
                'stats' => 'nullable|array',

                'table_layout' => 'nullable|array',
                'table_layout.layout_name_id' => 'nullable|string',
                'table_layout.layout_name_en' => 'nullable|string',
                'table_layout.show_actions' => 'boolean',
                'table_layout.actions_position' => 'in:left,right',
                'table_layout.row_height' => 'in:compact,normal,tall',
                'table_layout.show_border' => 'boolean',
                'table_layout.alternate_row_colors' => 'boolean',

                'table_layout.columns' => 'nullable|array',
                'table_layout.columns.*.label_id' => 'required|string',
                'table_layout.columns.*.label_en' => 'nullable|string',
                'table_layout.columns.*.alignment' => 'nullable|string|in:left,center,right',
                'table_layout.columns.*.width' => 'nullable|string',
                'table_layout.columns.*.position' => 'nullable|integer',
                'table_layout.columns.*.column_layout' => 'in:single,two_columns',
                'table_layout.columns.*.image_settings' => 'nullable|array',
                'table_layout.columns.*.image_settings.source_column' => 'nullable|string',
                'table_layout.columns.*.image_settings.width' => 'nullable|string',
                'table_layout.columns.*.image_settings.height' => 'nullable|string',
                'table_layout.columns.*.image_settings.fit' => 'nullable|string',
                'table_layout.columns.*.image_settings.border_radius' => 'nullable|string',

                'table_layout.columns.*.contents' => 'nullable|array',
                'table_layout.columns.*.contents.*.source_column' => 'required|string',
                'table_layout.columns.*.contents.*.display_type' => 'required|string',
                'table_layout.columns.*.contents.*.badge_config' => 'nullable|array',
                'table_layout.columns.*.contents.*.badge_config.*.value' => 'required|string',
                'table_layout.columns.*.contents.*.badge_config.*.label' => 'required|string',
                'table_layout.columns.*.contents.*.badge_config.*.color' => 'required|string',

                // -- CARD LAYOUT --
                'card_layout' => 'nullable|array',
                'card_layout.name' => 'nullable|string|max:100',

                'card_layout.mainImage' => 'nullable|array',
                'card_layout.mainImage.field' => 'nullable|string',
                'card_layout.mainImage.width' => 'nullable|integer',
                'card_layout.mainImage.height' => 'nullable|integer',
                'card_layout.mainImage.rounded' => 'nullable|boolean',

                'card_layout.judul' => 'nullable|array',
                'card_layout.judul.field' => 'nullable|string',
                'card_layout.judul.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.judul.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.judul.color' => 'nullable|string',

                'card_layout.subjudul' => 'nullable|array',
                'card_layout.subjudul.field' => 'nullable|string',
                'card_layout.subjudul.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.subjudul.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.subjudul.color' => 'nullable|string',

                'card_layout.status' => 'nullable|array',
                'card_layout.status.field' => 'nullable|string',
                'card_layout.status.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.status.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.status.color' => 'nullable|string',

                'card_layout.status.badge_options' => 'nullable|array',
                'card_layout.status.badge_options.*.value' => 'required|string',
                'card_layout.status.badge_options.*.label' => 'required|string',
                'card_layout.status.badge_options.*.color' => 'required|string',

                'card_layout.infos' => 'nullable|array|max:4',
                'card_layout.infos.*.field' => 'nullable|string',
                'card_layout.infos.*.icon' => 'nullable|string',

                'card_layout.value' => 'nullable|array',
                'card_layout.value.field' => 'nullable|string',
                'card_layout.value.prefix' => 'nullable|string|max:20',
                'card_layout.value.suffix' => 'nullable|string|max:20',
                'card_layout.value.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.value.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.value.color' => 'nullable|string',

                'card_layout.actions' => 'nullable|array',
                'card_layout.actions.view' => 'nullable|boolean',
                'card_layout.actions.edit' => 'nullable|boolean',
                'card_layout.actions.delete' => 'nullable|boolean',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 2. Simpan Master Builder
            $builder = CrudBuilder::create($request->only([
                'product_id',
                'kategori_crud',
                'judul',
                'judul_en',
                'nama_tabel',
                'judul_menu',
                'judul_menu_en',
                'deskripsi',
                'deskripsi_en',
                'status'
            ]));

            // 3. Simpan Kategori dan Kolom
            if ($request->has('field_categories')) {
                foreach ($request->field_categories as $cat) {
                    $category = $builder->fieldCategories()->create([
                        'nama_kategori' => $cat['nama_kategori'],
                    ]);

                    // Tambahkan semua kolom dalam kategori ini
                    if (!empty($cat['columns']) && is_array($cat['columns'])) {
                        foreach ($cat['columns'] as $column) {
                            $column['field_category_id'] = $category->id;
                            $builder->fields()->create($column);
                        }
                    }
                }
            }

            // 4. Simpan Statistik
            if ($request->has('stats')) {
                foreach ($request->stats as $stat) {
                    $builder->stats()->create($stat);
                }
            }

            // 6. Simpan Tabel Layout
            if ($request->has('table_layout')) {
                $layoutData = $request->table_layout;

                $layout = $builder->tableLayout()->create([
                    'layout_name_id' => $layoutData['layout_name_id'] ?? 'default',
                    'show_actions' => $layoutData['show_actions'] ?? true,
                    'actions_position' => $layoutData['actions_position'] ?? 'right',
                    'row_height' => $layoutData['row_height'] ?? 'compact',
                    'show_border' => $layoutData['show_border'] ?? true,
                    'alternate_row_colors' => $layoutData['alternate_row_colors'] ?? true,
                ]);

                foreach ($layoutData['columns'] ?? [] as $col) {
                    $column = $layout->columns()->create([
                        'label_id' => $col['label_id'],
                        'alignment' => $col['alignment'] ?? 'left',
                        'width' => $col['width'] ?? null,
                        'position' => $col['position'] ?? 0,
                        'column_layout' => $col['column_layout'] ?? 'single',
                        'image_settings' => $col['image_settings'] ?? null,
                    ]);

                    foreach ($col['contents'] ?? [] as $content) {
                        $column->contents()->create([
                            'source_column' => $content['source_column'],
                            'display_type' => $content['display_type'],
                            'label_id' => $content['label_id'] ?? null,
                            'styling' => $content['styling'] ?? null,
                            'position' => $content['position'] ?? 0,
                            'badge_config' => $content['badge_config'] ?? null,
                        ]);
                    }
                }
            }

            // 7 Simpan Card Layout (one-to-one)
            if ($request->filled('card_layout')) {
                $builder->cardLayout()->create([
                    'name'   => $request->card_layout['name'] ?? 'Default Layout',
                    'schema' => $request->card_layout, // seluruh konfigurasi disimpan di JSON
                ]);
            }

            // 6. Update total ke tabel modules
            // $this->syncTotals($validated['modules_id']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil membuat builder',
                'data' => $builder->load('product.templateFrontend', 'fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat builder: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $builder = CrudBuilder::withCount('fields')->with(['product.templateFrontend', 'fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data builder dari id: ' . $id,
                'data' => $builder,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal melihat data builder dari id: ' . $id . ' ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CrudBuilder $crudBuilder)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // 1) VALIDASI
        try {
            $validated = $request->validate([
                'product_id' => 'required|uuid|exists:mst_products,id',
                'kategori_crud' => 'required|in:utama,pendukung',
                'judul' => 'required|string',
                'nama_tabel' => 'required|string|unique:crud_builders,nama_tabel,' . $id,
                'field_categories' => 'nullable|array',
                'field_categories.*.nama_kategori' => 'required|string',
                'field_categories.*.columns' => 'nullable|array',
                'field_categories.*.columns.*.nama_kolom' => 'required|string',
                'stats' => 'nullable|array',

                // Table Layout (versi terbaru)
                'table_layout' => 'nullable|array',
                'table_layout.layout_name_id' => 'nullable|string',
                'table_layout.layout_name_en' => 'nullable|string',
                'table_layout.show_actions' => 'boolean',
                'table_layout.actions_position' => 'in:left,right',
                'table_layout.row_height' => 'in:compact,normal,tall',
                'table_layout.show_border' => 'boolean',
                'table_layout.alternate_row_colors' => 'boolean',

                'table_layout.columns' => 'nullable|array',
                'table_layout.columns.*.label_id' => 'required|string',
                'table_layout.columns.*.label_en' => 'nullable|string',
                'table_layout.columns.*.alignment' => 'nullable|string|in:left,center,right',
                'table_layout.columns.*.width' => 'nullable|string',
                'table_layout.columns.*.position' => 'nullable|integer',
                'table_layout.columns.*.column_layout' => 'in:single,two_columns',
                'table_layout.columns.*.image_settings' => 'nullable|array',
                'table_layout.columns.*.image_settings.source_column' => 'nullable|string',
                'table_layout.columns.*.image_settings.width' => 'nullable|string',
                'table_layout.columns.*.image_settings.height' => 'nullable|string',
                'table_layout.columns.*.image_settings.fit' => 'nullable|string',
                'table_layout.columns.*.image_settings.border_radius' => 'nullable|string',

                'table_layout.columns.*.contents' => 'nullable|array',
                'table_layout.columns.*.contents.*.source_column' => 'required|string',
                'table_layout.columns.*.contents.*.display_type' => 'required|string',
                'table_layout.columns.*.contents.*.label_id' => 'nullable|string',
                'table_layout.columns.*.contents.*.styling' => 'nullable|array',
                'table_layout.columns.*.contents.*.position' => 'nullable|integer',
                'table_layout.columns.*.contents.*.badge_config' => 'nullable|array',
                'table_layout.columns.*.contents.*.badge_config.*.value' => 'required|string',
                'table_layout.columns.*.contents.*.badge_config.*.label' => 'required|string',
                'table_layout.columns.*.contents.*.badge_config.*.color' => 'required|string',

                // -- CARD LAYOUT --
                'card_layout' => 'nullable|array',
                'card_layout.name' => 'nullable|string|max:100',

                'card_layout.mainImage' => 'nullable|array',
                'card_layout.mainImage.field' => 'nullable|string',
                'card_layout.mainImage.width' => 'nullable|integer',
                'card_layout.mainImage.height' => 'nullable|integer',
                'card_layout.mainImage.rounded' => 'nullable|boolean',

                'card_layout.judul' => 'nullable|array',
                'card_layout.judul.field' => 'nullable|string',
                'card_layout.judul.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.judul.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.judul.color' => 'nullable|string',

                'card_layout.subjudul' => 'nullable|array',
                'card_layout.subjudul.field' => 'nullable|string',
                'card_layout.subjudul.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.subjudul.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.subjudul.color' => 'nullable|string',

                'card_layout.status' => 'nullable|array',
                'card_layout.status.field' => 'nullable|string',
                'card_layout.status.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.status.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.status.color' => 'nullable|string',

                'card_layout.status.badge_options' => 'nullable|array',
                'card_layout.status.badge_options.*.value' => 'required|string',
                'card_layout.status.badge_options.*.label' => 'required|string',
                'card_layout.status.badge_options.*.color' => 'required|string',

                'card_layout.infos' => 'nullable|array|max:4',
                'card_layout.infos.*.field' => 'nullable|string',
                'card_layout.infos.*.icon' => 'nullable|string',

                'card_layout.value' => 'nullable|array',
                'card_layout.value.field' => 'nullable|string',
                'card_layout.value.prefix' => 'nullable|string|max:20',
                'card_layout.value.suffix' => 'nullable|string|max:20',
                'card_layout.value.size' => 'nullable|string|in:xs,sm,base,lg',
                'card_layout.value.weight' => 'nullable|string|in:normal,medium,semibold,bold',
                'card_layout.value.color' => 'nullable|string',

                'card_layout.actions' => 'nullable|array',
                'card_layout.actions.view' => 'nullable|boolean',
                'card_layout.actions.edit' => 'nullable|boolean',
                'card_layout.actions.delete' => 'nullable|boolean',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 2) AMBIL BUILDER
            $builder = CrudBuilder::with(['product.templateFrontend', 'fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu'])->findOrFail($id);

            // 3) UPDATE MASTER BUILDER
            $builder->update($request->only([
                'product_id',
                'kategori_crud',
                'judul',
                'judul_en',
                'nama_tabel',
                'judul_menu',
                'judul_menu_en',
                'deskripsi',
                'deskripsi_en',
                'status'
            ]));

            // 4) BERSIHKAN RELASI LAMA (kategori, fields, stats, layout)
            //    (pakai cascade delete & loop untuk contents)
            // Field Categories & Fields
            $builder->fields()->delete();
            $builder->fieldCategories()->delete();

            // Stats
            $builder->stats()->delete();

            // Table Layout + children
            if ($builder->tableLayout) {
                foreach ($builder->tableLayout->columns as $col) {
                    $col->contents()->delete();
                }
                $builder->tableLayout->columns()->delete();
                $builder->tableLayout()->delete();
            }

            // 5) SIMPAN KATEGORI & KOLOM BARU
            if ($request->has('field_categories')) {
                foreach ($request->field_categories as $cat) {
                    $category = $builder->fieldCategories()->create([
                        'nama_kategori' => $cat['nama_kategori'],
                    ]);

                    if (!empty($cat['columns']) && is_array($cat['columns'])) {
                        foreach ($cat['columns'] as $column) {
                            $column['field_category_id'] = $category->id;
                            $builder->fields()->create($column);
                        }
                    }
                }
            }

            // 6) SIMPAN STATISTIK BARU
            if ($request->has('stats')) {
                foreach ($request->stats as $stat) {
                    $builder->stats()->create($stat);
                }
            }

            // 7) SIMPAN TABLE LAYOUT BARU
            if ($request->has('table_layout')) {
                $layoutData = $request->table_layout;

                $layout = $builder->tableLayout()->create([
                    'layout_name_id' => $layoutData['layout_name_id'] ?? 'default',
                    'layout_name_en' => $layoutData['layout_name_en'] ?? null,
                    'show_actions' => $layoutData['show_actions'] ?? true,
                    'actions_position' => $layoutData['actions_position'] ?? 'right',
                    'row_height' => $layoutData['row_height'] ?? 'compact',
                    'show_border' => $layoutData['show_border'] ?? true,
                    'alternate_row_colors' => $layoutData['alternate_row_colors'] ?? true,
                ]);

                foreach ($layoutData['columns'] ?? [] as $col) {
                    $column = $layout->columns()->create([
                        'label_id' => $col['label_id'],
                        'label_en' => $col['label_en'] ?? null,
                        'alignment' => $col['alignment'] ?? 'left',
                        'width' => $col['width'] ?? null,
                        'position' => $col['position'] ?? 0,
                        'column_layout' => $col['column_layout'] ?? 'single',
                        'image_settings' => $col['image_settings'] ?? null,
                    ]);

                    foreach ($col['contents'] ?? [] as $content) {
                        $column->contents()->create([
                            'source_column' => $content['source_column'],
                            'display_type' => $content['display_type'],
                            'label_id' => $content['label_id'] ?? null,
                            'styling' => $content['styling'] ?? null,
                            'position' => $content['position'] ?? 0,
                            'badge_config' => $content['badge_config'] ?? null,
                        ]);
                    }
                }
            }

            // 8) Upsert Card Layout (one-to-one)
            if ($request->has('card_layout')) {
                $schema = $request->card_layout;
                $card = $builder->cardLayout()->first();

                if ($card) {
                    $card->update([
                        'name'   => $schema['name'] ?? ($card->name ?? 'Default Layout'),
                        'schema' => $schema,
                    ]);
                } else {
                    $builder->cardLayout()->create([
                        'name'   => $schema['name'] ?? 'Default',
                        'schema' => $schema,
                    ]);
                }
            }

            // 9) SYNC TOTAL KE MODULES
            // $this->syncTotals($validated['modules_id']);

            $builder->status = 'draft';
            $builder->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memperbarui builder',
                'data' => $builder->load('product.templateFrontend', 'fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu'),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui builder: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $builder = CrudBuilder::findOrFail($id);
            // $modulesId = $builder->modules_id;

            $builder->deleted_by = 'admin'; //dummy
            $builder->save();

            $builder->delete();

            // $this->syncTotals($modulesId);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil hapus data builder sementara',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus data builder ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deletedBuilder()
    {
        $builder = CrudBuilder::onlyTrashed()->with(['product.templateFrontend', 'fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu'])->orderByDesc('deleted_at')->get();

        $totalBuilderDihapus = CrudBuilder::onlyTrashed()->count();

        return response()->json([
            'success' => true,
            'message' => 'Menampilkan data builder yang dihapus',
            'total' => $totalBuilderDihapus,
            'data' => $builder
        ], 200);
    }

    public function restore($id)
    {
        $builder = CrudBuilder::onlyTrashed()->findOrFail($id);
        $builder->deleted_by = null; // dummy
        $builder->save();

        $builder->restore();
        return response()->json([
            'success' => true,
            'message' => 'Builder berhasil dikembalikan',
        ], 200);
    }

    public function forceDelete($id)
    {
        $builder = CrudBuilder::onlyTrashed()->findOrFail($id);

        $builder->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Builder berhasil dihapus permanen.',
        ], 200);
    }

    public function totalBuilder()
    {
        try {
            return response()->json([
                'total_builders' => CrudBuilder::count(),
                'published_builders' => CrudBuilder::where('status', 'published')->count(),
                'draft_builders' => CrudBuilder::where('status', 'draft')->count(),
                'archived_builders' => CrudBuilder::where('status', 'archived')->count(),
                'total_columns' => CrudField::whereHas('builder')->count(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal melihat total data builder ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getBuilderTables()
    {
        $tables = CrudBuilder::pluck('nama_tabel')->toArray();
        return response()->json($tables);
    }

    public function getBuilderColumns($table)
    {
        if (!\Schema::hasTable($table)) {
            return response()->json([], 404);
        }

        $columns = \Schema::getColumnListing($table);
        return response()->json($columns);
    }

    /**
     * CONFIG & PATH HELPERS — PER PRODUK.
     */
    private string $productSlug = '';
    private string $productRoot = ''; // appgenerate/{PRODUCT}
    private string $backRoot    = ''; // appgenerate/{PRODUCT}/lav-gen
    private string $frontRoot   = ''; // appgenerate/{PRODUCT}/next-gen

    // product slug (nama product / kode)
    private function resolveProductSlug($builder): string
    {
        $p = $builder->product ?? null;

        $raw = $p->product_code ?? 'DEFAULT';

        return strtoupper(Str::slug($raw, '_'));
    }
    
    // project root (tata letak folder project)
    private function setProjectRoots($builder): void
    {
        $this->productSlug = $this->resolveProductSlug($builder);
        $this->productRoot = base_path('../appgenerate/' . $this->productSlug);
        $this->backRoot    = $this->productRoot . '/lav-gen';
        $this->frontRoot   = $this->productRoot . '/next-gen';

        // Pastikan folder induk ada
        File::ensureDirectoryExists($this->productRoot);
        File::ensureDirectoryExists($this->backRoot);
        File::ensureDirectoryExists($this->frontRoot);

        // Bootstrap(create) proyek jika belum ada
        $this->bootstrapProductProjects($builder);

        // readme instalasi
        $this->writeProductReadme($builder);
    }

    // Product path
    private function productPath(string $rel = ''): string
    {
        return rtrim($this->productRoot . '/' . ltrim($rel, '/'), '/');
    }
    private function backPath(string $rel = ''): string
    {
        return rtrim($this->backRoot . '/' . ltrim($rel, '/'), '/');
    }
    private function frontPath(string $rel = ''): string
    {
        return rtrim($this->frontRoot . '/' . ltrim($rel, '/'), '/');
    }

    /**
     * HELPER Path UI Frontend.
     */
    private function getFrontendSkeletonPath($builder): string
    {
        $templateCode = $builder->product->templateFrontend->template_code ?? 'DEFAULT';

        // Prioritas: skeleton khusus per-produk
        $src = base_path("stubs/skeletons/frontend/{$templateCode}");
        if (File::exists($src)) {
            return $src;
        }

        // Fallback: skeleton umum Next 14
        return base_path('stubs/skeletons/frontend/DEFAULT');
    }

    /**
     * BOOTSTRAP: COPY SKELETON → {PRODUCT}/lav-gen & next-gen.
     */
    private function copyDirectory(string $from, string $to): void
    {
        File::ensureDirectoryExists($to);
        File::copyDirectory($from, $to);
    }

    /**
     * Generate Database name di env.
     */
    private function updateEnvDatabase($builder): void
    {
        $envPath = $this->backPath('.env');
        $dbName  = $builder->product->db_name ?? null;

        if (!$dbName) {
            return; // tidak ada db_name di product
        }

        if (!File::exists($envPath) && File::exists($this->backPath('.env.example'))) {
            File::copy($this->backPath('.env.example'), $envPath);
        }

        if (!File::exists($envPath)) {
            return; // fallback: ga ada env
        }

        $content = File::get($envPath);

        // cari DB_DATABASE=..., lalu ganti dengan db_name
        if (preg_match('/^DB_DATABASE=.*$/m', $content)) {
            $content = preg_replace('/^DB_DATABASE=.*$/m', "DB_DATABASE={$dbName}", $content);
        } else {
            $content .= "\nDB_DATABASE={$dbName}\n";
        }

        File::put($envPath, $content);
    }

    private function bootstrapProductProjects($builder): void
    {
        // Laravel skeleton
        if (!File::exists($this->backPath('composer.json'))) {
            $src = base_path('stubs/skeletons/laravel-12');
            if (!File::exists($src)) {
                throw new \RuntimeException("Skeleton Laravel tidak ditemukan: $src");
            }
            $this->copyDirectory($src, $this->backRoot);

            // siapkan .env dari .env.example jika ada
            if (!File::exists($this->backPath('.env')) && File::exists($this->backPath('.env.example'))) {
                File::copy($this->backPath('.env.example'), $this->backPath('.env'));
            }

            // masukkan nama database di env
            $this->updateEnvDatabase($builder);
        }

        // Next skeleton
        if (!File::exists($this->frontPath('package.json'))) {
            $srcFront = $this->getFrontendSkeletonPath($builder);

            if (File::exists($srcFront)) {
                $this->copyDirectory($srcFront, $this->frontRoot);
            } else {
                // fallback minimal (harusnya tidak terjadi karena getFrontendSkeletonPath sudah fallback)
                File::ensureDirectoryExists($this->frontPath('app'));
                File::ensureDirectoryExists($this->frontPath('components'));
                File::ensureDirectoryExists($this->frontPath('lib'));
                if (!File::exists($this->frontPath('package.json'))) {
                    File::put($this->frontPath('package.json'), json_encode([
                        "name" => "next-gen",
                        "private" => true,
                        "version" => "0.0.0"
                    ], JSON_PRETTY_PRINT));
                }
            }

            if (!File::exists($this->frontPath('.env.local'))) {
                File::put($this->frontPath('.env.local'), "NEXT_PUBLIC_API_URL=http://localhost:8000/api\n");
            }

            // pastikan routes/api.php ada di backend
            if (!File::exists($this->backPath('routes/api.php'))) {
                File::ensureDirectoryExists($this->backPath('routes'));
                File::put($this->backPath('routes/api.php'), "<?php\nuse Illuminate\\Support\\Facades\\Route;\n");
            }
        }

        // inject script instalasi
        $this->injectSetupScriptsFromStub();
    }

    /**
     * UTIL STUB PUBLISHER.
     */
    private function writeOnce(string $dest, string $content): void
    {
        File::ensureDirectoryExists(dirname($dest));
        if (!File::exists($dest)) {
            File::put($dest, $content);
        }
    }

    private function publishStub(string $stubPath, string $destPath, array $repl = [], bool $overwrite = false): void
    {
        $tpl = File::get($stubPath);
        $search  = array_map(fn($k) => "{{{$k}}}", array_keys($repl));
        $content = str_replace($search, array_values($repl), $tpl);

        File::ensureDirectoryExists(dirname($destPath));
        if ($overwrite) {
            File::put($destPath, $content);          // timpa
        } else {
            $this->writeOnce($destPath, $content);   // hanya jika belum ada
        }
    }

    /**
     * Publish runtime (backend + frontend) path dinamis.
     */
    private function scaffoldActionRuntime(string $back, string $front): void
    {
        // Backend runtime
        $this->publishStub(base_path('stubs/runtime/ActionContract.stub'),         $back . "/app/Builder/Contracts/ActionContract.php");
        $this->publishStub(base_path('stubs/runtime/ActionRegistry.stub'),         $back . "/app/Builder/ActionRegistry.php");
        $this->publishStub(base_path('stubs/runtime/config.builder_actions.stub'), $back . "/config/builder_actions.php");
        $this->publishStub(base_path('stubs/export/pdf/ExportPdfController.stub'), $back . "/app/Http/Controllers/Export/ExportPdfController.php", [], overwrite: true);
        $this->publishStub(base_path('stubs/export/pdf/pdf_generic.stub'),         $back . "/resources/views/pdf/generic.blade.php");

        foreach (['UploadMasterCsv','ExportCsv','RecalculateStats'] as $a) {
            $this->publishStub(base_path("stubs/runtime/actions/{$a}.stub"),       $back . "/app/Builder/Actions/{$a}.php");
        }

        // Frontend runtime
        $this->publishStub(base_path('stubs/frontend/runtime/lib-actions.stub'),   $front . "/lib/actions.ts");
        $this->publishStub(base_path('stubs/frontend/runtime/ActionBar.stub'),     $front . "/components/actions/ActionBar.tsx");
    }

    /**
     * Readme instalasi product (laravel dan nextjs).
     */
    private function writeProductReadme($builder, bool $overwrite = false): void
    {
        $product = $this->productSlug;
        $templateName = $builder->product->templateFrontend->template_name ?? 'DEFAULT';

        $dest = $this->productPath('README.md');

        if (!$overwrite && File::exists($dest)) {
            return; // jangan timpa kalau sudah ada
        }

        $md = <<<MD
# {$product} — Hasil Generate

**Jalankan setup_backend.ps1 dan setup_frontend.ps1**
Jika error perlu administrator copy command dibawah


**Template Frontend:** `{$templateName}`

Folder ini berisi dua proyek:
- **./lav-gen** — Laravel 12 (API)
- **./next-gen** — Next.js 14 (Frontend)

> Catatan: README ini dibuat otomatis oleh generator. Jika ingin menimpa konten ini di masa depan, panggil method dengan \$overwrite=true atau edit manual file ini.

---

## Prasyarat
- **PHP ≥ 8.2** (+ ekstensi umum: OpenSSL, PDO, Mbstring, Tokenizer, XML, Ctype, JSON, BCMath, Fileinfo)
- **Composer**
- **Node.js ≥ 18.17** + npm (atau yarn/pnpm)
- **Database** (MySQL/PostgreSQL/SQLite) untuk Laravel
- Git (opsional)

---

## 1. Setup Backend (Laravel 12)
**Windows (PowerShell/CMD):**
```ps1
cd lav-gen
composer install
cp .env.example .env
# edit .env: DB_*, APP_URL=http://localhost:8000
php artisan key:generate
php artisan storage:link
php artisan route:install (opsional)
php artisan migrate
php artisan serve

---

## 2. Setup Frontend (Next 14)
**Windows (PowerShell/CMD):**
```ps1
cd next-gen
npm install / pnpm install / yarn
# buat file .env.local yang berisi
NEXT_PUBLIC_API_URL=http://localhost:8000/api (sesuaikan api backend)
npm run dev
MD;
        File::put($dest, $md);
    }

    /**
     * Inject setup instalasi.
     */
    private function injectSetupScriptsFromStub(): void
    {
        // backend
        $this->publishStub(
            base_path('stubs/setup/setup_backend.ps1.stub'),
            $this->backPath('setup_backend.ps1'),
            repl: [],
            overwrite: false
        );

        // frontend
        $this->publishStub(
            base_path('stubs/setup/setup_frontend.ps1.stub'),
            $this->frontPath('setup_frontend.ps1'),
            repl: [],
            overwrite: false
        );
    }

    /**
     * GENERATE — pakai skeleton.
     */
    private function scaffoldActionRuntimeOnce(): void
    {
        $this->scaffoldActionRuntime($this->backRoot, $this->frontRoot);
    }

    public function generate($id)
    {
        try {
            // load builder dengan relasi
            $builder = CrudBuilder::with(['product.templateFrontend', 'fieldCategories', 'fields', 'stats', 'tableLayout.columns.contents', 'cardLayout', 'menu.parent'])->findOrFail($id);

            // Set root per product & bootstrap skeleton proyek jika belum ada
            $this->setProjectRoots($builder);

            // Publish runtime (contracts, action bar, dll)
            $this->scaffoldActionRuntimeOnce();

            // Data dasar
            $table = $builder->nama_tabel; // kendaraans
            $entity = ucfirst(Str::camel($builder->judul_menu)); // DataKendaraan
            $fields = collect($builder->fields)->map(callback: fn($f) => (object) $f);
            $fieldCategories = $builder->fieldCategories;
            $tableLayout = $builder->tableLayout;
            $cardLayouts = $builder->cardLayout;
            $judulMenu = $builder->judul_menu;
            $menuNode = $builder->menu;
            $totalCategory = $fieldCategories->count();

            // generate migrasi
            $this->generateMigration($table, $builder->fields);
            
            // generate model
            $this->generateModel($entity, $table, $builder->fields, $tableLayout->columns);

            // generate controller
            $this->generateController($entity, $fields);

            // tambah route ke api.php
            $this->appendRoute($judulMenu, $table, $entity);

            // export excel
            $this->generateExportExcel($table, $entity, $builder, $tableLayout);

            // Schema JSON per tabel (setiap entity)
            $this->generateExportPdfSchema($table, $builder, $tableLayout);

            // migrate agar masuk ke database
            // Artisan::call('migrate');

            // generate frontend
            $this->generateFrontend($judulMenu, $table, $builder->fields, $builder->judul, $builder->deskripsi, $fieldCategories, $tableLayout, $cardLayouts, $menuNode, $totalCategory);

            // generate menu frontend
            // $this->updateFrontendMenu($table, $builder->modules->menu_title ?? 'Modul');

            // Update status setelah generate menjadi published
            if ($id) {
                CrudBuilder::where('id', $id)->update(['status' => 'published']);
            }

            return response()->json([
                'success' => true,
                'message' => "Berhasil generate CRUD untuk $entity di product {$this->productSlug}"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Gagal generate CRUD" . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * BACKEND CODEGEN (migrasi, model, controller, route, export).
     */
    private function generateMigration($table, $fields)
    {
        try {
            $template = File::get(base_path('/stubs/migration.stub'));

            $schema = '';
            foreach ($fields as $field) {
                if ($field->tipe_input === 'image') {
                    $schema .= "            \$table->string('{$field->nama_kolom}')->nullable();\n";
                }
                elseif ($field->tipe_data === 'enum' && !empty($field->enum_options)) {
                    $options = is_string($field->enum_options) ? json_decode($field->enum_options, true) : $field->enum_options;
                    if (is_array($options)) {
                        $optionsList = implode("', '", $options);
                        $schema .= "            \$table->enum('{$field->nama_kolom}', ['{$optionsList}'])";
                        $schema .= $field->is_nullable ? "->nullable()" : "";
                        $schema .= $field->is_unique ? "->unique()" : "";
                        $schema .= ";\n";
                    } else {
                        // fallback jika gagal parse JSON
                        $schema .= "            \$table->string('{$field->nama_kolom}')->nullable(); // enum fallback\n";
                    }
                }
                elseif ($field->aktifkan_relasi) {
                    $schema .= "            \$table->foreignId('{$field->nama_kolom}')->constrained('{$field->tabel_relasi}')->references('{$field->kolom_relasi}')->onDelete('cascade');\n";
                } else {
                    $line = "\$table->{$field->tipe_data}('{$field->nama_kolom}')";
                    $line .= $field->is_nullable ? "->nullable()" : "";
                    $line .= $field->is_unique ? "->unique()" : "";
                    $schema .= "            $line;\n";
                }
            }
            
            $content = str_replace(
                ['{{TABLE_NAME}}', '{{SCHEMA}}'],
                [$table, $schema],
                $template
            );

            $filename = $this->backPath('database/migrations/' . now()->format('Y_m_d_His') . "_create_{$table}_table.php");
            File::put($filename, $content);
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate migration " . $e->getMessage());
        }
    }

    private function generateModel($entity, $table, $fields, $tableColumns)
    {
        try {
            $template = File::get(base_path('stubs/model.stub'));

            $fillable = collect($fields)->pluck('nama_kolom')->map(fn($f) => "'$f'")->join(",\n        ");
            
            // appends accesor url image
            $imageCols = collect($fields)
                ->filter(fn($f) => ($f->tipe_input ?? '') === 'image')
                ->pluck('nama_kolom')
                ->values()
                ->all();
            
            if (!empty($imageCols)) {
                $appendsList = collect($imageCols)
                    ->map(fn($name) => "'{$name}_url'")
                    ->join(', ');
                $appends = "protected \$appends = [{$appendsList}];";
            } else {
                $appends = ''; // tidak tulis property jika tidak ada image
            }

            // cast
            $castMap = [];

            foreach ($fields as $field) {
                $tipeInput = $field->tipe_input ?? null;
                $tipeData  = $field->tipe_data  ?? null;

                // Prioritas: tags atau tipe_data json => array
                if ($tipeInput === 'tags' || $tipeData === 'json') {
                    $castMap[$field->nama_kolom] = 'array';
                    continue;
                }

                // Opsional (aman kalau mau kamu aktifkan):
                if ($tipeData === 'boolean') {
                    $castMap[$field->nama_kolom] = 'boolean';
                } elseif ($tipeData === 'date') {
                    $castMap[$field->nama_kolom] = 'date';
                } elseif (in_array($tipeData, ['datetime', 'timestamp'])) {
                    $castMap[$field->nama_kolom] = 'datetime';
                }
            }

            $castsBlock = '';
            if (!empty($castMap)) {
                $castsLines = collect($castMap)
                    ->map(fn($v, $k) => "        '{$k}' => '{$v}',")
                    ->implode("\n");

                $castsBlock = <<<PHP
        protected \$casts = [
    $castsLines
        ];
    PHP;
            }

            // relasi sepertinya masih salah dan erro nanti fix ya
            $relations = '';
            foreach ($fields as $field) {
                if ($field->aktifkan_relasi) {
                    $relName = Str::camel(Str::replaceLast('_id', '', $field->nama_kolom));
                    $relModel = ucfirst(Str::camel(Str::singular(value: $field->tabel_relasi)));

                    $relations .= <<<PHP

            public function $relName() {
                return \$this->$field->tipe_relasi(\\App\\Models\\$relModel::class, '{$field->nama_kolom}');
            }
        PHP;
                }
            }

            // image accessor
            $imageAccessors = '';
            foreach ($fields as $field) {
                if ($field->tipe_input === 'image') {
                    $pascalName = Str::studly($field->nama_kolom);
                    $fieldName = $field->nama_kolom;

                    $imageAccessors .= <<<PHP

                public function get{$pascalName}UrlAttribute()
                {
                    return \$this->$fieldName
                        ? asset('storage/' . \$this->$fieldName)
                        : null;
                }

            PHP;
                }
            }

            $content = str_replace(
                ['{{MODEL_NAME}}', '{{TABLE_NAME}}', '{{FILLABLES}}', '{{RELATIONS}}', '{{ACCESSORS}}', '{{IMAGEAPPEND}}', '{{CASTS}}'],
                [$entity, $table, $fillable, $relations, $imageAccessors, $appends, $castsBlock],
                $template
            );

            File::put($this->backPath("app/Models/{$entity}.php"), $content);
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate model " . $e->getMessage());
        }
    }

    private function generateController($entity, $fields)
    {
        try {
            // $template = File::get(base_path('stubs/controller.stub'));

            $modelName = ucfirst(Str::camel($entity));
            $controllerName = $modelName . 'Controller';
            $variableName = '$' . strtolower($entity);
            $tableName = $entity;
            $routePath = Str::kebab(Str::plural($tableName)); // ex: kendaraans

            $validations = '';
            $storeImageCode = '';
            $updateImageCode = "        \$oldFilesToDelete = [];\n";
            $afterUpdateCleanup = '';
            $assignData = '';
            foreach ($fields as $field) {
                $col = $field->nama_kolom;
                $rules = [];

                // required atau nullable
                if ($field->is_required) {
                    $rules[] = 'required';
                } elseif ($field->is_nullable) {
                    $rules[] = 'nullable';
                }

                // unik
                if ($field->is_unique) {
                    $rules[] = 'unique:' . $entity; // default plural table
                }

                // angka
                if (in_array($field->tipe_data, ['integer', 'float', 'double'])) {
                    $rules[] = 'numeric';
                }

                // email
                if ($field->tipe_data === 'email') {
                    $rules[] = 'email';
                }

                 // string max length
                if ($field->tipe_data === 'string' && !empty($field->panjang)) {
                    $rules[] = 'max:' . $field->panjang;
                }

                // relasi
                if (!empty($field->aktifkan_relasi) && $field->tabel_relasi && $field->kolom_relasi) {
                    $rules[] = 'exists:' . $field->tabel_relasi . ',' . $field->kolom_relasi;
                }

                // enum
                if ($field->tipe_data === 'enum' && !empty($field->enum_options)) {
                    $options = is_array($field->enum_options)
                        ? $field->enum_options
                        : json_decode($field->enum_options, true);

                    if (is_array($options)) {
                        $rules[] = 'in:' . implode(',', $options);
                    }
                }

                // tags
                if ($field->tipe_input === 'tags' && $field->tipe_data === 'json') {
                    $rules[] = 'array';
                }

                // image
                if (in_array($field->tipe_input, ['image'])) {
                    $rules[] = 'image'; // atau 'image' jika hanya gambar
                    $rules[] = 'max:5120'; // ukuran maksimal (KB)
                    $rules[] = 'mimes:jpg,jpeg,png,webp'; // sesuaikan jenis

                    // proses simpan gambar
                    $storeImageCode .= <<<PHP
            if (\$request->hasFile('$col')) {
                \$data['$col'] = \$request->file('$col')->store('uploads/$tableName', 'public');
            }
PHP;

                    $updateImageCode .= <<<PHP
            if (\$request->hasFile('{$col}')) {
                \$old = \$row->{$col};
                \$data['{$col}'] = \$request->file('{$col}')->store('uploads/{$tableName}', 'public');
                if (!empty(\$old)) { \$oldFilesToDelete[] = \$old; }
            }
PHP;

                    $afterUpdateCleanup = <<<PHP
            // hapus file lama setelah update sukses
            foreach (\$oldFilesToDelete as \$oldPath) {
                if (!empty(\$oldPath)) { \\Storage::disk('public')->delete(\$oldPath); }
            }
PHP;

                } else {
                    $assignData .= "        \$data['$col'] = \$validated['$col'] ?? null;\n";
                }

                $validations .= "            '{$field->nama_kolom}' => '" . implode('|', $rules) . "',\n";
            }

            // $content = str_replace(
            //     ['{{VARIABLE_NAME}}', '{{MODEL_NAME}}', '{{CONTROLLER_NAME}}', '{{VALIDATIONS}}', '{{TABLE_NAME}}', '{{STORE_IMAGE_CODE}}', '{{UPDATE_IMAGE_CODE}}', '{{ASSIGN_DATA}}'],
            //     [$variableName, $modelName, $controllerName, $validations, $tableName, $storeImageCode, $updateImageCode, $assignData],
            //     $template
            // );
            // File::put(base_path("../appgenerate/lav-gen/app/Http/Controllers/Generate/{$controllerName}.php"), $content);

            // BASE Controller  (overwrite)
            $basePath  = $this->backPath("app/Http/Controllers/Generate/{$controllerName}.php");
            $this->publishStub(
                base_path('stubs/controller.base.stub'),
                $basePath,
                [
                    'MODEL_NAME'            => $modelName,
                    'CONTROLLER_NAME'       => $controllerName,
                    'ROUTE_PATH'            => $routePath,
                    'VALIDATIONS'           => $validations,
                    'ASSIGN_DATA'           => $assignData,
                    'STORE_IMAGE_CODE'      => $storeImageCode,
                    'UPDATE_IMAGE_CODE'     => $updateImageCode,
                    'AFTER_UPDATE_CLEANUP'  => $afterUpdateCleanup,
                ],
                overwrite: true
            );

            // Override Controller (write-once)
            $childPath = $this->backPath("app/Http/Controllers/Overrides/{$controllerName}.php");
            $this->publishStub(
                base_path('stubs/controller.child.stub'),
                $childPath,
                [
                    'CONTROLLER_NAME'   => $controllerName,
                    'ROUTE_PATH'        => $routePath,
                ],
                overwrite: false
            );
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate controller " . $e->getMessage());
        }
    }

    private function appendRoute($judulMenu, $table, $entity)
    {
        try {
            // $template = File::get(base_path('stubs/route.stub'));

            $routePath = Str::kebab(Str::plural($judulMenu));
            $controllerName = ucfirst(Str::camel($entity)) . 'Controller';
            
            $apiFile = $this->backPath('routes/api.php');
            if (!File::exists($apiFile)) {
                File::ensureDirectoryExists(dirname($apiFile));
                File::put($apiFile, "<?php\n");
            }

            $existingRoutes = File::get($apiFile);

            // Cek apakah apiResource untuk entity ini sudah ada
            if (Str::contains($existingRoutes, "Route::apiResource('$routePath'")) {
                return; // sudah ditulis, skip
            }

            // Route stub sudah mengarah ke Overrides dan menambah endpoints actions
            $content = str_replace(
                ['{{ROUTE_PATH}}', '{{CONTROLLER_NAME}}'],
                [$routePath, $controllerName],
                File::get(base_path('stubs/route.stub'))
            );

            File::append($apiFile, "\n" . $content);
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate route " . $e->getMessage());
        }
    }

    // export excel
    private function generateExportExcel($table, $entity, $builder, $tableLayout)
    {
        $singularSnake = Str::singular($entity); // nama_file
        $singularHeadline = Str::headline($singularSnake); // Nama File

        // 1) Ambil kolom dari Table Layout; fallback ke semua fields
        $cols = [];            // [ ['source'=>'plate_number','label'=>'Plate Number','display'=>'text|currency|date|...'], ... ]
        if ($tableLayout && $tableLayout->columns && count($tableLayout->columns)) {
            foreach ($tableLayout->columns as $c) {
                if (!empty($c->contents)) {
                    foreach ($c->contents as $content) {
                        $src    = $content->source_column;
                        $label  = $content->label_id ?? \Str::headline($src);
                        $disp   = $content->display_type ?? null; // <- untuk format kolom
                        $cols[] = ['source' => $src, 'label' => $label, 'display' => $disp];
                    }
                } else {
                    // Kolom tanpa "contents": tebak nama source dari label (snake)
                    $src    = \Str::snake($c->label_id);
                    $cols[] = ['source' => $src, 'label' => $c->label_id, 'display' => null];
                }
            }
        } else {
            // Fallback: pakai semua field dari builder
            foreach ($builder->fields as $f) {
                $cols[] = [
                    'source'  => $f->nama_kolom,
                    'label'   => $f->label_id ?? \Str::headline($f->nama_kolom),
                    'display' => null, // tidak ada info display_type
                ];
            }
        }

        // 2) HEADINGS dan MAPPINGS
        $headings = collect($cols)
            ->pluck('label')
            ->map(fn($l) => "'" . addslashes($l) . "'")
            ->implode(', ');

        $mappings = collect($cols)
            ->map(fn($c) => "\$r->{$c['source']}")
            ->implode(",\n            ");

        // 3) Deteksi kolom status (opsional, utk summary/filter)
        $statusColumn = collect($cols)
            ->first(fn($c) => in_array(strtolower($c['source']), ['status', 'state']))['source'] ?? '';

        // 4) Generate potongan kode format kolom (berdasarkan display_type dari table_layout)
        $currencyIdx = [];
        $dateIdx     = [];
        $i = 1; // index kolom 1-based sesuai urutan headings
        foreach ($cols as $c) {
            $disp = strtolower((string)($c['display'] ?? ''));
            if ($disp === 'currency') $currencyIdx[] = $i;
            if ($disp === 'date')     $dateIdx[]     = $i;
            $i++;
        }

        $columnFormatsPhp = '';
        foreach ($currencyIdx as $idx) {
            $columnFormatsPhp .= <<<PHP
            if (\$dataEndRow >= \$dataStartRow) {
                \$col = \\PhpOffice\\PhpSpreadsheet\\Cell\\Coordinate::stringFromColumnIndex($idx);
                \$s->getStyle("\$col{\$dataStartRow}:\$col{\$dataEndRow}")
                ->getNumberFormat()->setFormatCode('#,##0');
                \$s->getStyle("\$col{\$dataStartRow}:\$col{\$dataEndRow}")
                ->getAlignment()->setHorizontal(\\PhpOffice\\PhpSpreadsheet\\Style\\Alignment::HORIZONTAL_RIGHT);
            }

            PHP;
        }
        foreach ($dateIdx as $idx) {
            $columnFormatsPhp .= <<<PHP
            if (\$dataEndRow >= \$dataStartRow) {
                \$col = \\PhpOffice\\PhpSpreadsheet\\Cell\\Coordinate::stringFromColumnIndex($idx);
                \$s->getStyle("\$col{\$dataStartRow}:\$col{\$dataEndRow}")
                ->getNumberFormat()->setFormatCode('dd/mm/yyyy');
            }

            PHP;
        }
        if (trim($columnFormatsPhp) === '') {
            $columnFormatsPhp = '// no special formats';
        }

        // 5) Tulis Export Class dari stub BARU (tetap pakai path stub milikmu)
        $this->publishStub(
            base_path('stubs/export/export-class.stub'),
            $this->backPath("app/Exports/{$entity}Export.php"),
        [
            'ENTITY'           => $entity,
            'TABLE'            => $table,
            'HEADINGS'         => $headings,
            'MAPPINGS'         => $mappings,
            'STATUS_COLUMN'    => $statusColumn,
            'BUILDER_TITLE'    => addslashes($builder->judul ?? \Str::headline($table)),

            // ====== tambahan untuk letterhead ======
            'LOGO_PATH'        => 'logo/rentvixpro-transparent.png', // relative ke public_path()
            'LOGO_HEIGHT'      => '84',               // px
            'LOGO_COL_WIDTH'   => '20',               // lebar kolom A (Excel units)

            'HDR_ROW1_HEIGHT' => '28',
            'HDR_ROW2_HEIGHT' => '24',
            'HDR_ROW3_HEIGHT' => '20',
            'LETTERHEAD_LINE1' => addslashes(strtoupper('RentVix Pro')),
            'LETTERHEAD_LINE2' => addslashes("{$builder->judul} - Export"),

            // ====== placeholder yang sudah ada sebelumnya ======
            'GAP_ROWS'         => '4',
            'SIG_WIDTH_COLS'   => '3',
            'COLUMN_FORMATS'   => rtrim($columnFormatsPhp), // dari versi sebelumnya
            'ENTITY_HEADLINE_SINGULAR' => $singularHeadline,
        ],
        overwrite: true
    );
    }

    // export pdf schema
    private function generateExportPdfSchema($table, $builder, $tableLayout): void
    {
        // 1) Ambil kolom dari Table Layout; fallback ke semua fields
        $cols = [];
        if ($tableLayout && $tableLayout->columns && count($tableLayout->columns)) {
            foreach ($tableLayout->columns as $c) {
                if (!empty($c->contents)) {
                    foreach ($c->contents as $content) {
                        $src   = $content->source_column;
                        $label = $content->label_id ?? \Str::headline($src);
                        $disp  = $content->display_type ?? null; // text|date|currency|badge|number|image|icon_text
                        $cols[] = ['source'=>$src,'label'=>$label,'display'=>$disp];
                    }
                } else {
                    $src   = \Str::snake($c->label_id);
                    $cols[] = ['source'=>$src,'label'=>$c->label_id,'display'=>null];
                }
            }
        } else {
            foreach ($builder->fields as $f) {
                $cols[] = [
                    'source'  => $f->nama_kolom,
                    'label'   => $f->label_id ?? \Str::headline($f->nama_kolom),
                    'display' => null,
                ];
            }
        }

        // 2) Schema JSON (ringkasan default bisa kamu ubah)
        $schema = [
            'title'      => $builder->judul ?? \Str::headline($table),
            'menu_title' => $builder->judul_menu ?? \Str::headline($table),
            'table'      => $table,
            'columns'    => $cols,
            'summary'    => [
                'group_by' => 'status', // akan diabaikan jika kolom 'status' tidak ada
                'sum'      => []        // contoh: ['total_biaya','harga_sewa']
            ],
        ];

        $jsonPath = $this->backPath("resources/builder_schema");
        \File::ensureDirectoryExists($jsonPath);
        \File::put("$jsonPath/{$table}.json", json_encode($schema, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
    }

    /**
     * FRONTEND CODEGEN (Next).
     */
    private function generateFrontend($judulMenu, $table, $fields, $title, $deskripsi, $fieldCategories, $tableLayout, $cardLayouts, $menuNode, $totalCategory)
    {
        try {
            $entity = Str::camel($judulMenu); // cth: namaFiles
            $entityKebab = Str::kebab($judulMenu); // cth nama-files
            $entityPlural = Str::kebab(Str::plural($judulMenu));
            $entityPascal = Str::studly($judulMenu); // cth NamaFiles
            $entitySnake = Str::snake($judulMenu); // cth nama_files
            $entityHeadline = Str::headline($judulMenu); // cth Nama Files

            $singularSnake = Str::singular($entity); // nama_file
            $singularCamel = Str::camel($singularSnake); // namaFile
            $singularKebab = Str::kebab($singularSnake); // nama-file
            $singularPlural = Str::plural($singularSnake);
            $singularPascal = Str::studly($singularSnake); // NamaFile
            $singularHeadline = Str::headline($singularSnake); // Nama File

            $folderApp   = $this->frontPath("app/$singularKebab"); // folder app
            $folderCreate= $this->frontPath("app/$singularKebab/create"); // folder app/create
            $folderEdit  = $this->frontPath("app/$singularKebab/edit/[id]"); // folder app/edit/id
            $folderView  = $this->frontPath("app/$singularKebab/view/[id]"); // folder app/view/id
            $folderComp  = $this->frontPath("components/$singularKebab"); // folder components
            $folderForm  = $this->frontPath("components/$singularKebab/form"); // folder form

            // cek dan create folder
            File::ensureDirectoryExists($folderApp);
            File::ensureDirectoryExists($folderCreate);
            File::ensureDirectoryExists($folderEdit);
            File::ensureDirectoryExists($folderView);
            File::ensureDirectoryExists($folderComp);
            File::ensureDirectoryExists($folderForm);

            // Publish runtime Frontend (sekali)
            $this->publishStub(base_path('stubs/frontend/runtime/lib-actions.stub'),  $this->frontPath("lib/actions.ts"));
            $this->publishStub(base_path('stubs/frontend/runtime/ActionBar.stub'),    $this->frontPath("components/actions/ActionBar.tsx"));

            // menu
            $trail = [];

            // naik ke atas sampai root menu
            if ($menuNode) {
                $node = $menuNode;
                while ($node) {
                    $trail[] = [
                        'title' => $node->title,
                        'route_path' => $node->route_path ?: null,
                        'level' => $node->level,
                        'type' => $node->type,
                    ];
                    $node = $node->parent;
                }
                $trail = array_reverse($trail);
            }

            // fallback kalau belum ada menu untuk builder ini
            if (empty($trail)) {
                $trail = [
                    [ 'title' => $judulMenu, 'route_path' => '/'.$singularKebab ]
                ];
            }

            // siapkan nilai yang akan ditanam ke stub
            $breadcrumbJson = json_encode($trail, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
            $menuRoutePath  = $menuNode->route_path ?? '/'.$singularKebab;

            // generate index (app/(nama-folder)/page.tsx)
            $indexTemplate = File::get(base_path('stubs/frontend/app/page-index.stub'));
            File::put("$folderApp/page.tsx", str_replace([
                '{{ENTITY_KEBAB}}',
                '{{ENTITY_CAMEL}}',
                '{{TITLE}}',
                '{{ENTITY_PASCAL}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_CAMEL_SINGULAR}}',
                '{{ENTITY_HEADLINE_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
            ], [
                $entityKebab,
                $entity,
                $title,
                $entityPascal,
                $singularPascal,
                $singularCamel,
                $singularHeadline,
                $singularKebab,
            ], $indexTemplate));

            // generate create/page.tsx
            $createTemplate = File::get(base_path('stubs/frontend/app/create/page-form.stub'));
            File::put("$folderCreate/page.tsx", str_replace([
                '{{ENTITY_KEBAB}}',
                '{{ENTITY_CAMEL}}',
                '{{TITLE}}',
                '{{ENTITY_PASCAL}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_CAMEL_SINGULAR}}',
                '{{ENTITY_HEADLINE_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{ENTITY_PLURAL}}',
            ], [
                $entityKebab,
                $entity,
                $title,
                $entityPascal,
                $singularPascal,
                $singularCamel,
                $singularHeadline,
                $singularKebab,
                $entityPlural,
            ], $createTemplate));

            // generate app/edit/[id]/page.tsx
            $editTemplate = File::get(base_path('stubs/frontend/app/edit/page-edit.stub'));
            File::put("$folderEdit/page.tsx", str_replace([
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{ENTITY_PLURAL}}',
            ], [
                $singularPascal,
                $singularKebab,
                $entityPlural
            ], $editTemplate));

            // generate app/view page
            $viewPageTemplate = File::get(base_path('stubs/frontend/app/view/page-view.stub'));
            File::put("$folderView/page.tsx", str_replace([
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{ENTITY_PLURAL}}'
            ], [
                $singularPascal,
                $singularKebab,
                $entityPlural
            ], $viewPageTemplate));

            // generate components form/page-form.tsx

            // mapping numeric / string
            $numericTypes = ['integer','bigInteger','mediumInteger','smallInteger','tinyInteger','float','double','decimal'];
            $payloadObject = '';
            $payloadFiles  = '';

            foreach ($fields as $field) {
                $name = $field->nama_kolom;
                $tipeData = $field->tipe_data ?? 'string';
                $tipeInput = $field->tipe_input ?? 'text';

                // file/image → ditangani terpisah
                if (in_array($tipeInput, ['image','file'])) {
                    $payloadFiles .= "    if (formData.$name instanceof File) payload.$name = formData.$name;\n";
                    continue;
                }

                // number cast / else default
                if (in_array($tipeData, $numericTypes)) {
                    $payloadObject .= "      $name: formData.$name ? Number(formData.$name) : undefined,\n";
                } else {
                    $payloadObject .= "      $name: formData.$name ?? undefined,\n";
                }
            }
            
            $pageFormTemplate = File::get(base_path('stubs/frontend/components/form/page-form.stub'));
            File::put("$folderForm/$singularKebab-form.tsx", str_replace([
                '{{ENTITY_KEBAB}}',
                '{{ENTITY_CAMEL}}',
                '{{TITLE}}',
                '{{ENTITY_PASCAL}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_CAMEL_SINGULAR}}',
                '{{ENTITY_HEADLINE_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{ENTITY_PLURAL}}',
                '{{PAYLOAD_OBJECT}}',
                '{{PAYLOAD_FILES}}',
                '{{MENU_ROUTE_PATH}}',
                '{{BREADCRUMB_JSON}}'
            ], [
                $entityKebab,
                $entity,
                $title,
                $entityPascal,
                $singularPascal,
                $singularCamel,
                $singularHeadline,
                $singularKebab,
                $entityPlural,
                rtrim($payloadObject), // baris mapping fields
                rtrim($payloadFiles), // baris file/image handling
                $menuRoutePath,
                $breadcrumbJson
            ], $pageFormTemplate));

            // generate components form/form-fields.tsx
            // input form

            $sectionCard = '';
            foreach ($fieldCategories as $category) {
                $categoryTitle = $category['nama_kategori'];

                $inputFields = '';
                foreach ($category['columns'] as $field) {
                    $stub = '';
                    $type = $field->tipe_input ?? 'text';

                    // enum
                    if ($field->tipe_data === 'enum' && !empty($field->enum_options)) {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-enum.stub'));

                        $options = is_string($field->enum_options)
                            ? json_decode($field->enum_options, true)
                            : $field->enum_options;

                        $enumOptions = '';
                        if (is_array($options)) {
                            foreach ($options as $opt) {
                                $enumOptions .= "    <SelectItem value=\"{$opt}\">{$opt}</SelectItem>\n";
                            }
                        }

                        $stub = str_replace('{{OPTIONS}}', rtrim($enumOptions), $stub);
                    }

                    // image
                    elseif ($type === 'image') {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-image.stub'));
                    }

                    // textarea
                    elseif ($type === 'textarea') {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-textarea.stub'));
                    }

                    // checkbox
                    elseif ($type === 'checkbox') {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-checkbox.stub'));
                    }

                    // date
                    elseif ($type === 'date') {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-date.stub'));
                    }

                    // password
                    elseif ($type === 'password') {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-password.stub'));
                    }

                    // tag
                    elseif ($type === 'tags') {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input-tags.stub'));
                    }
                    
                    // default
                    else {
                        $stub = File::get(base_path('stubs/frontend/components/form/input/form-input.stub'));
                    }

                    $required = '';
                    if ($field->is_required === true) {
                        $required = "required";
                    }

                    $inputFields .= str_replace(
                        ['{{FIELD}}', '{{LABEL}}', '{{TYPE}}', '{{PLACEHOLDER}}', '{{REQUIRED}}'],
                        [$field->nama_kolom, Str::headline($field->label_id ?? $field->nama_kolom), $type, $field->placeholder_id, $required],
                        $stub
                    ) . "\n\n";
                }

                //  section grid create

                $sectionCardTemplate = File::get(base_path('stubs/frontend/components/form/form-section-card.stub'));
                $sectionCard .= str_replace([
                    '{{CATEGORY_NAME}}',
                    '{{FORM_INPUTS}}',
                ], [
                    $categoryTitle,
                    $inputFields,
                ], $sectionCardTemplate) . "\n\n";
            }

            // DIBAWAH INI KODENYA BELUM SELESAI YAA LANJUTKAN
            // $tagsField = collect($fields)->filter(fn($f) => in_array($f->tipe_input ?? '', ['tags']))->

            // ketika cuma 1 kategori maka menjadi grid-cols-1
            $grid = $totalCategory === 1 ? 1 : 2;
            
            $formFieldsTemplate = File::get(base_path('stubs/frontend/components/form/page-form-fields.stub'));
            File::put("$folderForm/$singularKebab-form-fields.tsx", str_replace([
                '{{ENTITY_KEBAB}}',
                '{{ENTITY_CAMEL}}',
                '{{TITLE}}',
                '{{ENTITY_PASCAL}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_CAMEL_SINGULAR}}',
                '{{ENTITY_HEADLINE_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{ENTITY_PLURAL}}',
                // '{{FORM_INPUTS}}',
                // '{{CATEGORY_NAME}}',
                '{{FORM_SECTION}}',
                '{{GRID_COLS}}'
            ], [
                $entityKebab,
                $entity,
                $title,
                $entityPascal,
                $singularPascal,
                $singularCamel,
                $singularHeadline,
                $singularKebab,
                $entityPlural,
                // $inputFields,
                // $categoryTitle
                $sectionCard,
                $grid
            ], $formFieldsTemplate));

            // generate components page.tsx
            $searchKeys = collect($fields)
                ->pluck('nama_kolom')
                ->map(fn($n) => Str::camel($n));

            $pageTemplate = File::get(base_path('stubs/frontend/components/page.stub'));
            File::put("$folderComp/$singularKebab-page.tsx", str_replace([
                '{{ENTITY_KEBAB}}',
                '{{ENTITY_CAMEL}}',
                '{{ENTITY_PLURAL}}',
                '{{ENTITY_PASCAL}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_CAMEL_SINGULAR}}',
                '{{ENTITY_HEADLINE_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{SEARCH_KEYS}}',
                '{{TITLE}}',
                '{{MENU_ROUTE_PATH}}',
                '{{BREADCRUMB_JSON}}'
            ], [
                $entityKebab,
                $entity,
                $entityPlural,
                $entityPascal,
                $singularPascal,
                $singularCamel,
                $singularHeadline,
                $singularKebab,
                $searchKeys,
                $title,
                $menuRoutePath,
                $breadcrumbJson
            ], $pageTemplate));

            // generate components page-content.tsx
            // card layout
            $cardLayout = $cardLayouts;
            $cardSchema = [];

            if ($cardLayout) {
                // kolom schema bisa string JSON atau array cast
                $cardSchema = is_string($cardLayout->schema)
                    ? (json_decode($cardLayout->schema, true) ?? [])
                    : ($cardLayout->schema ?? []);
            }

            // ambil format json nya
            $image = $cardSchema['mainImage']['field']  ?? null;
            $imageWidth = $cardSchema['mainImage']['width'] ?? null;
            $imageHeight = $cardSchema['mainImage']['height'] ?? null;

            $judul = $cardSchema['judul']['field'] ?? null;
            $judulSize = $cardSchema['judul']['size'] ?? null;
            $judulWeight = $cardSchema['judul']['weight'] ?? null;
            $judulColor = $cardSchema['judul']['color'] ?? null;

            $subJudul = $cardSchema['subjudul']['field'] ?? null;
            $subJudulSize = $cardSchema['subjudul']['size'] ?? null;
            $subJudulWeight = $cardSchema['subjudul']['weight'] ?? null;
            $subJudulColor = $cardSchema['subjudul']['color'] ?? null;

            $subJudulContent = '';
            if (!empty($subJudul)) {
                $subJudulContent = <<<SUBJUDUL
    {filtered{$singularPascal}.{$subJudul}}
    SUBJUDUL;
            }

            $status = $cardSchema['status']['field'] ?? null;
            $statusBadgeCase = '';
            $statusBadgeContent = '';
            
            if (!empty($cardSchema['status']['field']) && !empty($cardSchema['status']['badge_options'])) {
                foreach ($cardSchema['status']['badge_options'] ?? [] as $badge) {
                $statusBadgeCase .= "case '{$badge['value']}' : return <Badge className='bg-{$badge['color']}-100 text-{$badge['color']}-700'>{$badge['label']}</Badge>;\n";
            }

            $statusBadgeContent .= <<<BADGE
{(() => {
    switch (filtered{$singularPascal}.{$status}) {
        $statusBadgeCase
        default: return filtered{$singularPascal}.{$status};
    }
})()}
BADGE;      
            }

            $infoContent = '';
            foreach ($cardSchema['infos'] ?? [] as $info) {
                $infoField = $info['field'] ?? '';
                if ($infoField === '') continue;

                $infoIcon = $info['icon'] ?? '';
                $infoSize = $info['size'] ?? 'text-sm';
                $infoWeight = $info['weight'] ?? 'font-normal';
                $infoColor = $info['color'] ?? 'text-gray-800';

                $infoContent .= <<<INFOS
    <div className="flex items-center gap-1">
        <{$infoIcon} className="h-3 w-3 $infoColor dark:text-foreground" />
        <span className="$infoColor dark:text-foreground">{filtered{$singularPascal}.$infoField}</span>
    </div>
    INFOS;
            }

            $valueContent = '';

            if (!empty($cardSchema['value']['field'])) {
                $valueField  = $cardSchema['value']['field'];
                $valuePrefix = $cardSchema['value']['prefix'] ?? '';
                $valueSuffix = $cardSchema['value']['suffix'] ?? '';
                $valueSize   = $cardSchema['value']['size'] ?? 'base';
                $valueWeight = $cardSchema['value']['weight'] ?? 'normal';
                $valueColor  = $cardSchema['value']['color'] ?? 'black';

                $valueContent = <<<VALUE
            <span className="font-{$valueWeight} text-{$valueSize} {$valueColor}">
            {$valuePrefix} {formatRupiah(filtered{$singularPascal}.{$valueField})}{$valueSuffix}
            </span>
            VALUE;
            }

            // old value
            // $value = $cardSchema['value']['field'] ?? null;
            // $valuePrefix = $cardSchema['value']['prefix'];
            // $valueSuffix = $cardSchema['value']['suffix'];
            // $valueSize = $cardSchema['value']['size'];
            // $valueWeight = $cardSchema['value']['weight'];
            // $valueColor = $cardSchema['value']['color'];

            // $actions  = $cardSchema['actions']    ?? [];

            $cardStub = File::get(base_path('stubs/frontend/components/card-mobile-page-content.stub'));
            $cardContent = str_replace([
                '{{IMAGE}}',
                '{{IMAGE_WIDTH}}',
                '{{IMAGE_HEIGHT}}',
                '{{JUDUL}}',
                '{{JUDUL_SIZE}}',
                '{{JUDUL_WEIGHT}}',
                '{{JUDUL_COLOR}}',
                '{{SUBJUDUL_CONTENT}}',
                '{{SUBJUDUL_SIZE}}',
                '{{SUBJUDUL_WEIGHT}}',
                '{{SUBJUDUL_COLOR}}',
                '{{STATUS}}',
                '{{STATUS_BADGE}}',
                '{{INFO}}',
                '{{VALUE_CONTENT}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}'
            ], [
                $image,
                $imageWidth,
                $imageHeight,
                $judul,
                $judulSize,
                $judulWeight,
                $judulColor,
                $subJudulContent,
                $subJudulSize,
                $subJudulWeight,
                $subJudulColor,
                $status,
                $statusBadgeContent,
                $infoContent,
                $valueContent,
                $singularPascal,
                $singularKebab
            ], $cardStub);

            // table layout
            $headers = $cells = '';
            foreach ($tableLayout->columns as $col) {
                $headers .= "<TableHead className='text-foreground'>{$col->label_id}</TableHead>\n";

                $cellContent = '';

                if ($col->column_layout === 'two_columns') {
                    $imageHtml = '';

                    if (!empty($col->image_settings['source_column'])) {
                        $imageSource = $col->image_settings['source_column'];
                        $imageWidth = $col->image_settings['width'] ?? 96;
                        $imageHeight = $col->image_settings['height'] ?? 96;
                        $imageVit = $col->image_settings['fit'] ?? 'cover';

                        $imageHtml = "<Image src={item.{$imageSource}_url || '/placeholder.svg'} width={{$imageWidth}} height={{$imageHeight}} className='rounded-md object-$imageVit' />";
                    }

                    // Konten kanan
                    $rightContent = '';
                    foreach ($col->contents as $content) {
                        $source = $content->source_column;
                        $display = $content->display_type;
                        $styling = $content->styling;
                        $fontSize = $styling['fontSize'] ?? 'text-sm';
                        $fontWeight = $styling['fontWeight'] ?? 'font-normal';
                        $fontColor = $styling['color'] ?? 'text-gray-900';

                        switch ($display) {
                            case 'text':
                                $rightContent .= "<div className='$fontSize $fontWeight $fontColor dark:text-foreground'>{item.{$source}}</div>\n";
                                break;

                            case 'badge':
                                $badgeCases = '';
                                foreach ($content->badge_config ?? [] as $badge) {
                                    $badgeCases .= "case '{$badge['value']}': return <Badge className='bg-{$badge['color']}-100 text-{$badge['color']}-700'>{$badge['label']}</Badge>;\n";
                                }

                                $rightContent .= <<<BADGE
                    {(() => {
                        switch (item.{$source}) {
                            {$badgeCases}
                            default: return item.{$source};
                        }
                    })()}
                    BADGE;
                                break;

                            case 'currency':
                                $rightContent .= "<div className='font-bold text-blue-600'>Rp {item.{$source}}/day</div>\n";
                                break;

                            case 'date':
                                $rightContent .= "<div>{new Date(item.{$source}).toLocaleDateString()}</div>\n";
                                break;

                            case 'icon_text':
                                $icon = $content->styling['icon'] ?? 'Star';
                                $rightContent .= <<<HTML
                    <div className="flex items-center gap-2">
                    <{$icon} className="h-4 w-4 text-muted-foreground" />
                    <span>{item.{$source}}</span>
                    </div>
                    HTML;
                                break;

                            default:
                                $rightContent .= "<div>{item.{$source}}</div>\n";
                                break;
                        }
                    }

                    // Gabungkan gambar kiri + konten kanan
                    $cellContent = <<<HTML
                    <div className="text-left flex gap-3">
                        {$imageHtml}
                        <div>
                            {$rightContent}
                        </div>
                    </div>
                    HTML;
                } else {
                    foreach ($col->contents as $content) {
                        $source = $content->source_column;
                        $display = $content->display_type;
                        $styling = $content->styling;
                        $fontSize = $styling['fontSize'] ?? 'text-sm';
                        $fontWeight = $styling['fontWeight'] ?? 'font-normal';
                        $fontColor = $styling['color'] ?? 'text-gray-900';

                        switch ($display) {
                            case 'text':
                                $cellContent .= "<div className='$fontSize $fontWeight $fontColor dark:text-foreground'>{item.{$source}}</div>\n";
                                break;

                            case 'image':
                                $imgWidth = $col->image_settings['width'] ?? 64;
                                $imgHeight = $col->image_settings['height'] ?? 64;
                                $imgFit = $col->image_settings['fit'] ?? 'cover';
                                $imgRadius = $col->image_settings['border_radius'] ?? '0.5rem';

                                $cellContent .= "<img src={item.{$source}_url} alt='' className='w-[{$imgWidth}px] h-[{$imgHeight}px] object-{$imgFit} rounded-[{$imgRadius}]' />\n";
                                break;
                            
                            case 'badge':
                                $badgeCases = '';
                                foreach ($content->badge_config ?? [] as $badge) {
                                    $badgeCases .= "case '{$badge['value']}': return <Badge className='bg-{$badge['color']}-100 text-{$badge['color']}-700'>{$badge['label']}</Badge>;\n";
                                }

                                $cellContent .= <<<BADGE
                {(() => {
                    switch (item.{$source}) {
                        $badgeCases
                        default: return item.{$source};
                    }
                })()}
                BADGE;
                                break;

                            case 'currency':
                                $cellContent .= "<div className='font-bold text-blue-600'>Rp {formatRupiah(item.{$source})}/day</div>\n";
                                break;

                            case 'date':
                                $cellContent .= "<div>{new Date(item.{$source}).toLocaleDateString()}</div>\n";
                                break;

                            case 'icon_text':
                                $icon = $content->styling['icon'] ?? 'Circle';
                                $cellContent .= <<<HTML
                <div className="flex items-center gap-2">
                <{$icon} className="h-4 w-4 text-muted-foreground" />
                <span>{item.{$source}}</span>
                </div>
                HTML;
                                break;

                            default:
                                $cellContent .= "<div>{item.{$source}}</div>\n";
                                break;
                        }
                    }
                    }

                    $cells .= "<TableCell className='text-{$col->alignment}'>{$cellContent}</TableCell>\n";
            }

            // $headers = $cells = '';
            // foreach ($fields as $field) {
            //     $headers .= "<TableHead className='text-foreground'>{$field->label_id}</TableHead>\n";
            //     $cells .= "<TableCell>{item.{$field->nama_kolom}}</TableCell>\n";
            // }

            // // $kolomPertama = $field->nama_kolom->first();

            $tableContent = File::get(base_path('stubs/frontend/components/page-content.stub'));
            File::put("$folderComp/$singularKebab-page-contents.tsx", str_replace([
                '{{TABLE_HEADERS}}',
                '{{TABLE_CELLS}}',
                '{{ENTITY_PASCAL}}',
                '{{ENTITY_PASCAL_SINGULAR}}',
                '{{ENTITY_CAMEL_SINGULAR}}',
                '{{ENTITY_KEBAB}}',
                '{{ENTITY_CAMEL}}',
                '{{DESKRIPSI}}',
                '{{TITLE}}',
                '{{ENTITY_HEADLINE}}',
                '{{ENTITY_HEADLINE_SINGULAR}}',
                '{{ENTITY_KEBAB_SINGULAR}}',
                '{{CARD_MOBILE_VIEW}}',
                '{{ENTITY_SNAKE_SINGULAR}}',
                '{{ENTITY_PLURAL}}'
                // '{{KOLOM_PERTAMA}}'
            ], [
                $headers,
                $cells,
                $entityPascal,
                $singularPascal,
                $singularCamel,
                $entityKebab,
                $entity,
                $deskripsi,
                $title,
                $entityHeadline,
                $singularHeadline,
                $singularKebab,
                $cardContent,
                $singularSnake,
                $entityPlural
                // $kolomPertama
            ], $tableContent));

            // generate components page view detail (BUAT YYYY)
            // $pageViewDetailTemplate = File::get(base_path('stubs/frontend/components/page-view-detail.stub'));
            // File::put("$folderComp/$singularKebab-view-detail.tsx", str_replace([

            // ]));
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate frontend: " . $e->getMessage());
        }
    }
}
