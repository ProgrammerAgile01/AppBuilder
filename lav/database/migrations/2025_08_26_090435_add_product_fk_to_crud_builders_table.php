<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('crud_builders', function (Blueprint $table) {
            // tambah kolom UUID yang nullable (karena ON DELETE SET NULL)
            $table->uuid('product_id')->nullable()->after('id');

            // FK ke mst_products(id)
            $table->foreign('product_id')
                  ->references('id')->on('mst_products')
                  ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('crud_builders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
        });
    }
};
