<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FeatureBuilderSeeder extends Seeder
{
    /**
     * php artisan db:seed --class=FeatureBuilderSeeder --product=<PRODUCT_ID>
     */
    public function run(): void
    {
        $productId = $this->command->option('product') ?? null;

        $products = DB::table('mst_products')
            ->when($productId, fn($q) => $q->where('id', $productId))
            ->get();

        foreach ($products as $p) {
            $now = now();

            // Contoh seed parent (kategori/feature root)
            $parents = [
                [
                    'product_id'   => (string) $p->id,
                    'product_code' => $p->product_code ?? null,
                    'parent_id'    => null,
                    'name'         => 'Core',
                    'feature_code' => 'core',
                    'type'         => 'feature',
                    'description'  => 'Fitur inti',
                    'crud_menu_id' => null,
                    'price_addon'  => 0,
                    'trial_available' => false,
                    'trial_days'   => null,
                    'is_active'    => true,
                    'order_number' => 1,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                    'deleted_at'   => null,
                ],
                [
                    'product_id'   => (string) $p->id,
                    'product_code' => $p->product_code ?? null,
                    'parent_id'    => null,
                    'name'         => 'Integration',
                    'feature_code' => 'integration',
                    'type'         => 'feature',
                    'description'  => 'Integrasi pihak ketiga',
                    'crud_menu_id' => null,
                    'price_addon'  => 0,
                    'trial_available' => false,
                    'trial_days'   => null,
                    'is_active'    => true,
                    'order_number' => 2,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                    'deleted_at'   => null,
                ],
            ];

            // Upsert parents
            foreach ($parents as $parent) {
                $exists = DB::table('mst_feature_builder')
                    ->where('product_id', $parent['product_id'])
                    ->where('feature_code', $parent['feature_code'])
                    ->first();

                if (!$exists) {
                    DB::table('mst_feature_builder')->insert($parent);
                }
            }

            // Ambil id parent yang baru/ada
            $coreId = DB::table('mst_feature_builder')
                ->where('product_id', $p->id)
                ->where('feature_code', 'core')
                ->value('id');

            $integrationId = DB::table('mst_feature_builder')
                ->where('product_id', $p->id)
                ->where('feature_code', 'integration')
                ->value('id');

            // Seed children contoh
            $children = [
                [
                    'product_id'   => (string) $p->id,
                    'product_code' => $p->product_code ?? null,
                    'parent_id'    => $coreId,
                    'name'         => 'Dashboard',
                    'feature_code' => 'core.dashboard',
                    'type'         => 'subfeature',
                    'description'  => 'Ringkasan metrik',
                    'crud_menu_id' => null,
                    'price_addon'  => 0,
                    'trial_available' => false,
                    'trial_days'   => null,
                    'is_active'    => true,
                    'order_number' => 1,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                    'deleted_at'   => null,
                ],
                [
                    'product_id'   => (string) $p->id,
                    'product_code' => $p->product_code ?? null,
                    'parent_id'    => $integrationId,
                    'name'         => 'Webhooks',
                    'feature_code' => 'integration.webhooks',
                    'type'         => 'subfeature',
                    'description'  => 'Sinkronisasi webhook',
                    'crud_menu_id' => null,
                    'price_addon'  => 0,
                    'trial_available' => false,
                    'trial_days'   => null,
                    'is_active'    => true,
                    'order_number' => 1,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                    'deleted_at'   => null,
                ],
            ];

            foreach ($children as $child) {
                $exists = DB::table('mst_feature_builder')
                    ->where('product_id', $child['product_id'])
                    ->where('feature_code', $child['feature_code'])
                    ->first();

                if (!$exists) {
                    DB::table('mst_feature_builder')->insert($child);
                }
            }
        }
    }
}
