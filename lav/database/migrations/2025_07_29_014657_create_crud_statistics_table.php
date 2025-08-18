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
        Schema::create('crud_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crud_builder_id')->constrained()->onDelete('cascade');
            $table->string('judul_statistik_id');
            $table->string('judul_statistik_en')->nullable();
            $table->string('icon')->nullable();
            $table->text('query_angka');   // hasil angka
            $table->text('query_resume');  // ringkasan bulan ini vs bulan lalu
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crud_statistics');
    }
};
