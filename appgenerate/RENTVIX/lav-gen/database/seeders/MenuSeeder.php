<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Insert berdasarkan level agar parent lebih dulu
        $rows = array (
  0 => 
  array (
    'id' => 1,
    'parent_id' => NULL,
    'level' => 1,
    'type' => 'group',
    'title' => 'Operasional',
    'icon' => 'Settings',
    'color' => '#14b8a6',
    'order_number' => 1,
    'crud_builder_id' => NULL,
    'product_code' => 'RENTVIX',
    'route_path' => NULL,
    'is_active' => true,
    'note' => 'Manage Operasional',
    'created_by' => NULL,
    'deleted_at' => NULL,
    'created_at' => '2025-08-27T03:21:34.000000Z',
    'updated_at' => '2025-08-27T03:21:34.000000Z',
    'is_deleted' => false,
  ),
  1 => 
  array (
    'id' => 2,
    'parent_id' => 1,
    'level' => 2,
    'type' => 'module',
    'title' => 'Data Operational',
    'icon' => 'Settings',
    'color' => NULL,
    'order_number' => 1,
    'crud_builder_id' => NULL,
    'product_code' => 'RENTVIX',
    'route_path' => NULL,
    'is_active' => true,
    'note' => 'Manage Data Operasional',
    'created_by' => NULL,
    'deleted_at' => NULL,
    'created_at' => '2025-08-27T03:22:03.000000Z',
    'updated_at' => '2025-08-27T03:22:03.000000Z',
    'is_deleted' => false,
  ),
  2 => 
  array (
    'id' => 3,
    'parent_id' => 2,
    'level' => 3,
    'type' => 'menu',
    'title' => 'Data Kendaraan',
    'icon' => 'Car',
    'color' => NULL,
    'order_number' => 1,
    'crud_builder_id' => 2,
    'product_code' => 'RENTVIX',
    'route_path' => '/data-kendaraan',
    'is_active' => false,
    'note' => NULL,
    'created_by' => NULL,
    'deleted_at' => NULL,
    'created_at' => '2025-08-27T03:22:33.000000Z',
    'updated_at' => '2025-08-30T06:51:37.000000Z',
    'is_deleted' => false,
  ),
);

        $fmt = function ($v) {
            if ($v === null || $v === '') return null;
            try { return Carbon::parse($v)->format('Y-m-d H:i:s'); }
            catch (\Throwable $e) { return now()->format('Y-m-d H:i:s'); }
        };

        // --- whitelist kolom yang valid di schema target
        $allowed = [
            'id','parent_id','level','type','title','icon','color','order_number',
            'crud_builder_id','product_code','route_path','is_active','note',
            'created_by','deleted_at','created_at','updated_at',
        ];
        $allowFlip = array_flip($allowed);

        foreach ($rows as $r) {
            // mapping is_deleted -> deleted_at
            if (array_key_exists('is_deleted', $r)) {
                if ($r['is_deleted'] && empty($r['deleted_at'])) {
                    $r['deleted_at'] = now();
                }
                unset($r['is_deleted']);
            }

            // buang kolom yang tidak ada di schema target
            $r = array_intersect_key($r, $allowFlip);

            $r = array_merge([
                'parent_id' => null,
                'level' => 1,
                'icon' => null,
                'color' => null,
                'order_number' => 0,
                'crud_builder_id' => null,
                'product_code' => null,
                'route_path' => null,
                'is_active' => true,
                'note' => null,
                'created_by' => null,
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ], $r);

            $r['created_at'] = $fmt($r['created_at'] ?? null);
            $r['updated_at'] = $fmt($r['updated_at'] ?? null);
            $r['deleted_at'] = $fmt($r['deleted_at'] ?? null);

            DB::table('mst_menus')->updateOrInsert(['id' => $r['id']], $r);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}