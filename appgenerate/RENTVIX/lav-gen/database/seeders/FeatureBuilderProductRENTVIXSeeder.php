<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureBuilderProductRENTVIXSeeder extends Seeder
{
    public function run(): void
    {
        // Gunakan product_code (string)
        $productCode = 'RENTVIX';

        // Hapus semua fitur milik product_code ini (termasuk yang soft-deleted)
        DB::table('mst_feature_builder')->where('product_code', $productCode)->delete();

        // Snapshot data fitur
        $rows = array (
  0 => 
  array (
    'id' => 1,
    'product_id' => '949e6fc6-f9f2-42a5-a18a-74f104da4982',
    'product_code' => 'RENTVIX',
    'parent_id' => NULL,
    'name' => 'Kirim Wa',
    'feature_code' => 'wa.send',
    'type' => 'feature',
    'description' => 'oke',
    'crud_menu_id' => NULL,
    'price_addon' => 50000,
    'trial_available' => false,
    'trial_days' => NULL,
    'is_active' => true,
    'order_number' => 1,
    'deleted_at' => NULL,
    'created_at' => 
    \Illuminate\Support\Carbon::__set_state(array(
       'endOfTime' => false,
       'startOfTime' => false,
       'constructedObjectId' => '00000000000004ff0000000000000000',
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
       'date' => '2025-08-29 16:34:42.000000',
       'timezone_type' => 3,
       'timezone' => 'Asia/Jakarta',
    )),
    'updated_at' => 
    \Illuminate\Support\Carbon::__set_state(array(
       'endOfTime' => false,
       'startOfTime' => false,
       'constructedObjectId' => '00000000000004fe0000000000000000',
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
       'date' => '2025-08-29 16:34:42.000000',
       'timezone_type' => 3,
       'timezone' => 'Asia/Jakarta',
    )),
  ),
  1 => 
  array (
    'id' => 2,
    'product_id' => '949e6fc6-f9f2-42a5-a18a-74f104da4982',
    'product_code' => 'RENTVIX',
    'parent_id' => 1,
    'name' => 'Send Booking',
    'feature_code' => 'wa.send_booking',
    'type' => 'subfeature',
    'description' => 'lorem',
    'crud_menu_id' => 3,
    'price_addon' => 0,
    'trial_available' => false,
    'trial_days' => NULL,
    'is_active' => true,
    'order_number' => 1,
    'deleted_at' => NULL,
    'created_at' => 
    \Illuminate\Support\Carbon::__set_state(array(
       'endOfTime' => false,
       'startOfTime' => false,
       'constructedObjectId' => '000000000000050c0000000000000000',
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
       'date' => '2025-08-29 16:35:00.000000',
       'timezone_type' => 3,
       'timezone' => 'Asia/Jakarta',
    )),
    'updated_at' => 
    \Illuminate\Support\Carbon::__set_state(array(
       'endOfTime' => false,
       'startOfTime' => false,
       'constructedObjectId' => '00000000000005090000000000000000',
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
       'date' => '2025-08-29 16:35:00.000000',
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
