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
        Schema::table('crud_fields', function (Blueprint $table) {
            $table->foreignId('field_category_id')->nullable()->after('crud_builder_id')->constrained('field_categories')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crud_fields', function (Blueprint $table) {
            //
        });
    }
};
