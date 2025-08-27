<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mst_products', function (Blueprint $table) {
            $table->uuid('template_frontend_id')->nullable()->after('id');
            $table->foreign('template_frontend_id')
                  ->references('id')->on('mst_template_frontend')
                  ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mst_products', function (Blueprint $table) {
            $table->dropForeign(['template_frontend_id']);
            $table->dropColumn('template_frontend_id');
        });
    }
};
