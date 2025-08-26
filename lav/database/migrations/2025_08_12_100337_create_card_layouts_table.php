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
        Schema::create('card_layouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crud_builder_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('Default Layout');
            $table->json('schema'); // Simpel & fleksibel: simpan seluruh konfigurasi ke JSON
            $table->boolean('is_default')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_layouts');
    }
};
