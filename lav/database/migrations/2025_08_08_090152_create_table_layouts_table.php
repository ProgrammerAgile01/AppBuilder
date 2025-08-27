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
        Schema::create('table_layouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crud_builder_id')->constrained()->restrictOnDelete();
            $table->string('layout_name_id')->default('default');
            $table->string('layout_name_en')->nullable();
            $table->boolean('show_actions')->default(true);
            $table->enum('actions_position', ['left', 'right'])->default('right');
            $table->enum('row_height', ['compact', 'normal', 'tall'])->default('normal');
            $table->boolean('show_border')->default(true);
            $table->boolean('alternate_row_colors')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_layouts');
    }
};
