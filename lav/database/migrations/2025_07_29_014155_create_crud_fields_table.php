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
        Schema::create('crud_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crud_builder_id')->constrained()->onDelete('cascade');

            // Info kolom
            $table->string('nama_kolom');
            $table->string('label_id');
            $table->string('label_en')->nullable();
            $table->string('placeholder_id');
            $table->string('placeholder_en')->nullable();
            $table->string('tipe_data');
            $table->integer('panjang')->nullable();
            $table->string('tipe_input');
            $table->json('enum_options')->nullable();
            
            // Validasi & opsi tampilan
            $table->boolean('is_required')->default(false);
            $table->boolean('is_nullable')->default(true);
            $table->boolean('is_unique')->default(false);
            $table->boolean('is_readonly')->default(false);
            $table->boolean('is_hide')->default(false);
            $table->string('align')->default('left');
            $table->string('default_value')->nullable();
            $table->integer('urutan')->default(0);

            // Relasi antar tabel (opsional)
            $table->boolean('aktifkan_relasi')->default(false);
            $table->string('tipe_relasi')->nullable();       // belongsTo, hasOne, hasMany
            $table->string('tabel_relasi')->nullable();      // nama tabel relasi
            $table->string('kolom_relasi')->nullable();      // kolom yang dirujuk
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crud_fields');
    }
};
