<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureBuilderProductABSENFASTSeeder extends Seeder
{
    public function run(): void
    {
        // Gunakan product_code (string)
        $productCode = 'ABSENFAST';

        // Hapus semua fitur milik product_code ini (termasuk yang soft-deleted)
        DB::table('mst_feature_builder')->where('product_code', $productCode)->delete();

        // Snapshot data fitur
        $rows = array (
  0 => 
  array (
    'id' => 4,
    'product_id' => '4f2383fa-8944-4df5-8c17-f5edce140df4',
    'product_code' => 'ABSENFAST',
    'parent_id' => NULL,
    'name' => 'Export Excel',
    'feature_code' => 'export-excel',
    'type' => 'feature',
    'description' => 'Fitur Export Excel',
    'crud_menu_id' => NULL,
    'price_addon' => 15000,
    'trial_available' => true,
    'trial_days' => 7,
    'is_active' => true,
    'order_number' => 1,
    'deleted_at' => NULL,
    'created_at' => 
    \Illuminate\Support\Carbon::__set_state(array(
       'endOfTime' => false,
       'startOfTime' => false,
       'constructedObjectId' => '00000000000005170000000000000000',
       'clock' => NULL,
       'localMonthsOverflow' => NULL,
       'localYearsOverflow' => NULL,
       'localStrictModeEnabled' => NULL,
       'localHumanDiffOptions' => NULL,
       'localToStringFormat' => NULL,
       'localSerializer' => NULL,
       'localMacros' => NULL,
       'localGenericMacros' => NULL,
       'localFormatFunction' => NULL,
       'localTranslator' => NULL,
       'dumpProperties' => 
      array (
        0 => 'date',
        1 => 'timezone_type',
        2 => 'timezone',
      ),
       'dumpLocale' => NULL,
       'dumpDateProperties' => NULL,
       'date' => '2025-08-28 08:20:44.000000',
       'timezone_type' => 3,
       'timezone' => 'Asia/Jakarta',
    )),
    'updated_at' => 
    \Illuminate\Support\Carbon::__set_state(array(
       'endOfTime' => false,
       'startOfTime' => false,
       'constructedObjectId' => '00000000000005160000000000000000',
       'clock' => NULL,
       'localMonthsOverflow' => NULL,
       'localYearsOverflow' => NULL,
       'localStrictModeEnabled' => NULL,
       'localHumanDiffOptions' => NULL,
       'localToStringFormat' => NULL,
       'localSerializer' => NULL,
       'localMacros' => NULL,
       'localGenericMacros' => NULL,
       'localFormatFunction' => NULL,
       'localTranslator' => NULL,
       'dumpProperties' => 
      array (
        0 => 'date',
        1 => 'timezone_type',
        2 => 'timezone',
      ),
       'dumpLocale' => NULL,
       'dumpDateProperties' => NULL,
       'date' => '2025-08-28 08:20:44.000000',
       'timezone_type' => 3,
       'timezone' => 'Asia/Jakarta',
    )),
  ),
);

        // Pastikan kolom product_code konsisten
        foreach ($rows as &$r) {
            $r['product_code'] = $productCode;
        }
        unset($r);

        // Insert ulang
        foreach ($rows as $r) {
            DB::table('mst_feature_builder')->insert($r);
        }
    }
}
