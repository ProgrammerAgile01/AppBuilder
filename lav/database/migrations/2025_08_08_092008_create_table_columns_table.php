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
        Schema::create('table_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_layout_id')->constrained()->restrictOnDelete();
            $table->string('label_id');
            $table->string('label_en')->nullable();
            $table->string('alignment')->default('left');
            $table->string('width')->nullable(); // e.g., "200px"
            $table->integer('position')->default(0);
            $table->enum('column_layout', ['single', 'two_columns'])->default('single');
            $table->json('image_settings')->nullable(); // used if two_columns
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_columns');
    }
};
