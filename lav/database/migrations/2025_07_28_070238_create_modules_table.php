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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Judul modul
            $table->string('menu_title'); // Judul menu di sidebar
            // $table->string('table_name'); // Judul menu di sidebar
            $table->text('description')->nullable();

            $table->unsignedInteger('total_categories')->default(0);
            $table->unsignedInteger('total_columns')->default(0);
            $table->unsignedInteger('total_stats')->default(0);

            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');

            // $table->string('module_group')->nullable(); // Username atau user_id string

            $table->timestamp('created_at')->nullable();
            $table->string('created_by')->nullable(); // Username atau user_id string
            
            $table->timestamp('updated_at')->nullable()->default(null);
            $table->string('updated_by')->nullable();

            $table->softDeletes();
            $table->string('deleted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
