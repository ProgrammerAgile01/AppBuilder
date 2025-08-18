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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $builders = CrudBuilder::withoutTrashed()->withCount('fields')->with(['fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout'])->orderBy('updated_at')->get();

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
                // 'modules_id' => 'required|exists:modules,id',
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
                // 'modules_id',
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
                'data' => $builder->load('fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat builder: ' . $e->getMessage(),
            ], 500);
        }
    }

    // private function syncTotals($modulesId)
    // {
    //     Modules::where('id', $modulesId)->update([
    //         'total_categories' => CrudBuilder::where('modules_id', $modulesId)->count(),
    //         'total_columns' => CrudField::whereHas('builder', fn($q) => $q->where('modules_id', $modulesId))->count(),
    //         'total_stats' => CrudStatistic::whereHas('builder', fn($q) => $q->where('modules_id', $modulesId))->count(),
    //     ]);
    // }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $builder = CrudBuilder::withCount('fields')->with(['fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout'])->findOrFail($id);

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
                // 'modules_id' => 'required|exists:modules,id',
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
            $builder = CrudBuilder::with(['fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout'])->findOrFail($id);

            // 3) UPDATE MASTER BUILDER
            $builder->update($request->only([
                // 'modules_id',
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
                'data' => $builder->load('fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout'),
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
        $builder = CrudBuilder::onlyTrashed()->with(['fieldCategories.columns', 'stats', 'tableLayout.columns.contents', 'cardLayout'])->orderByDesc('deleted_at')->get();

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

    public function generate($id)
    {
        try {
            $builder = CrudBuilder::with(['modules', 'fieldCategories', 'fields', 'stats'])->findOrFail($id);
            $table = $builder->nama_tabel; // kendaraans
            $entity = ucfirst(Str::studly($table)); // Kendaraan
            $fields = collect($builder->fields)->map(callback: fn($f) => (object) $f);
            $fieldCategories = $builder->fieldCategories;
            $tableLayout = $builder->tableLayout;
            $cardLayouts = $builder->cardLayout;

            // generate migrasi
            $this->generateMigration($table, $builder->fields);
            
            // generate model
            $this->generateModel($entity, $table, $builder->fields, $tableLayout->columns);

            // generate controller
            $this->generateController($entity, $fields);

            // tambah route ke api.php
            $this->appendRoute($table, $entity);

            // migrate agar masuk ke database
            // Artisan::call('migrate');

            // generate frontend
            $this->generateFrontend($table, $builder->fields, $builder->judul, $builder->deskripsi, $fieldCategories, $tableLayout, $cardLayouts);

            // generate menu frontend
            // $this->updateFrontendMenu($table, $builder->modules->menu_title ?? 'Modul');

            if ($id) {
                CrudBuilder::where('id', $id)->update(['status' => 'published']);
            }

            return response()->json([
                'success' => true,
                'message' => "Berhasil generate CRUD untuk $entity"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => `Gagal generate CRUD untuk $entity ` . $e->getMessage(),
            ], 500);
        }
    }

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

            $filename = base_path('../appgenerate/lav-gen/database/migrations/' . now()->format('Y_m_d_His') . "_create_{$table}_table.php");
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

        //     foreach ($tableColumns as $tableColumn) {
        //         if ($tableColumn->column_layout === 'two_columns' && !is_null($tableColumn->image_settings)) {
        //             $source = $tableColumn->image_settings['source_column'];

        //             $appendImage .= <<<PHP
        //     protected \$appends = ['{$source}_url'];
        // PHP;
        //         }
        //     }

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
                ['{{MODEL_NAME}}', '{{TABLE_NAME}}', '{{FILLABLES}}', '{{RELATIONS}}', '{{ACCESSORS}}', '{{IMAGEAPPEND}}'],
                [$entity, $table, $fillable, $relations, $imageAccessors, $appends],
                $template
            );

            File::put(base_path("../appgenerate/lav-gen/app/Models/{$entity}.php"), $content);
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate model " . $e->getMessage());
        }
    }

    private function generateController($entity, $fields)
    {
        try {
            $template = File::get(base_path('stubs/controller.stub'));

            $modelName = ucfirst(Str::camel($entity));
            $controllerName = $modelName . 'Controller';
            $variableName = '$' . strtolower($entity);
            $tableName = $entity;

            $validations = '';
            $storeImageCode = '';
            $updateImageCode = '';
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

                // enum (soon pengembangan)
                // if ($field->tipe_data === 'enum' && is_array($field->enum_options)) {
                //     $enumValues = implode(',', $field->enum_options);
                //     $rules[] = 'in:' . $enumValues;
                // }

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
            if (\$request->hasFile('$col')) {
                \$data['$col'] = \$request->file('$col')->store('uploads/$tableName', 'public');
            } else {
                unset(\$data['$col']);
            }
PHP;
                } else {
                    $assignData .= "        \$data['$col'] = \$validated['$col'] ?? null;\n";
                }

                $validations .= "            '{$field->nama_kolom}' => '" . implode('|', $rules) . "',\n";
            }

            $content = str_replace(
                ['{{VARIABLE_NAME}}', '{{MODEL_NAME}}', '{{CONTROLLER_NAME}}', '{{VALIDATIONS}}', '{{TABLE_NAME}}', '{{STORE_IMAGE_CODE}}', '{{UPDATE_IMAGE_CODE}}', '{{ASSIGN_DATA}}'],
                [$variableName, $modelName, $controllerName, $validations, $tableName, $storeImageCode, $updateImageCode, $assignData],
                $template
            );
            File::put(base_path("../appgenerate/lav-gen/app/Http/Controllers/Generate/{$controllerName}.php"), $content);
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate controller " . $e->getMessage());
        }
    }

    private function appendRoute($table, $entity)
    {
        try {
            $template = File::get(base_path('stubs/route.stub'));

            $routePath = Str::kebab(Str::plural($table));
            $controllerName = ucfirst(Str::camel($entity)) . 'Controller';
            $apiFile = base_path('../appgenerate/lav-gen/routes/api.php');
            $existingRoutes = File::get($apiFile);

            if (Str::contains($existingRoutes, "Route::apiResource('$routePath'")) {
                // Sudah ada, tidak perlu ditambahkan lagi
                return;
            }

            $content = str_replace(
                ['{{ROUTE_PATH}}', '{{CONTROLLER_NAME}}'],
                [$routePath, $controllerName],
                $template
            );

            File::append(base_path('../appgenerate/lav-gen/routes/api.php'), "\n" . $content);
        } catch (\Exception $e) {
            throw new \Exception("Gagal generate route " . $e->getMessage());
        }
    }

    // func generate frontend
    private function generateFrontend($table, $fields, $title, $deskripsi, $fieldCategories, $tableLayout, $cardLayouts)
    {
        try {
            $entity = Str::camel($table); // cth: namaFiles
            $entityKebab = Str::kebab($table); // cth nama-files
            $entityPlural = Str::kebab(Str::plural($table));
            $entityPascal = Str::studly($table); // cth NamaFiles
            $entitySnake = Str::snake($table); // cth nama_files
            $entityHeadline = Str::headline($table); // cth Nama Files

            $singularSnake = Str::singular($entity); // nama_file
            $singularCamel = Str::camel($singularSnake); // namaFile
            $singularKebab = Str::kebab($singularSnake); // nama-file
            $singularPlural = Str::plural($singularSnake);
            $singularPascal = Str::studly($singularSnake); // NamaFile
            $singularHeadline = Str::headline($singularSnake); // Nama File

            $folderApp = base_path("../appgenerate/next-gen/app/$singularKebab"); // folder app
            $folderCreate = "$folderApp/create"; // folder app/create
            $folderEdit = "$folderApp/edit/[id]"; // folder app/edit/id
            $folderView = "$folderApp/view/[id]"; // folder app/view/id
            $folderComp = base_path("../appgenerate/next-gen/components/$singularKebab"); // folder components
            $folderForm = "$folderComp/form"; // folder form

            // cek dan create folder
            File::ensureDirectoryExists($folderApp);
            File::ensureDirectoryExists($folderCreate);
            File::ensureDirectoryExists($folderEdit);
            File::ensureDirectoryExists($folderView);
            File::ensureDirectoryExists($folderComp);
            File::ensureDirectoryExists($folderForm);

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
                    '{{FORM_INPUTS}}'
                ], [
                    $categoryTitle,
                    $inputFields
                ], $sectionCardTemplate) . "\n\n";
            }
            
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
                '{{FORM_SECTION}}'
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
                $sectionCard
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
                '{{TITLE}}'
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
                $title
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

            $status = $cardSchema['status']['field'] ?? null;
            $statusBadgeCase = '';
            $statusBadgeContent = '';
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

            
            $value = $cardSchema['value']['field'] ?? null;
            $valuePrefix = $cardSchema['value']['prefix'];
            $valueSuffix = $cardSchema['value']['suffix'];
            $valueSize = $cardSchema['value']['size'];
            $valueWeight = $cardSchema['value']['weight'];
            $valueColor = $cardSchema['value']['color'];

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
                '{{SUBJUDUL}}',
                '{{SUBJUDUL_SIZE}}',
                '{{SUBJUDUL_WEIGHT}}',
                '{{SUBJUDUL_COLOR}}',
                '{{STATUS}}',
                '{{STATUS_BADGE}}',
                '{{INFO}}',
                '{{VALUE}}',
                '{{VALUE_PREFIX}}',
                '{{VALUE_SUFFIX}}',
                '{{VALUE_SIZE}}',
                '{{VALUE_WEIGHT}}',
                '{{VALUE_COLOR}}',
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
                $subJudul,
                $subJudulSize,
                $subJudulWeight,
                $subJudulColor,
                $status,
                $statusBadgeContent,
                $infoContent,
                $value,
                $valuePrefix,
                $valueSuffix,
                $valueSize,
                $valueWeight,
                $valueColor,
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

                                $cellContent .= "<img src={item.{$source}} alt='' className='w-[{$imgWidth}px] h-[{$imgHeight}px] object-{$imgFit} rounded-[{$imgRadius}]' />\n";
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
                '{{CARD_MOBILE_VIEW}}'
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
                $cardContent
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
