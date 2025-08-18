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
        Schema::create('crud_builders', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('modules_id')->constrained()->onDelete('cascade');
            $table->enum('kategori_crud', ['utama', 'pendukung'])->default('utama');
            $table->string('judul');
            $table->string('judul_en')->nullable();
            $table->string('nama_tabel');
            $table->string('judul_menu')->nullable();
            $table->string('judul_menu_en')->nullable();
            $table->text('deskripsi')->nullable();
            $table->text('deskripsi_en')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            
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
        Schema::dropIfExists('crud_builders');
    }
};
