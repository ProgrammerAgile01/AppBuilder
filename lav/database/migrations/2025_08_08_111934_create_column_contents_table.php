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
        Schema::create('column_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_column_id')->constrained()->restrictOnDelete();
            $table->string('source_column');
            $table->string('display_type'); // text, image, badge, icon, etc.
            $table->string('label_id')->nullable();
            $table->string('label_en')->nullable();
            $table->json('styling')->nullable();
            $table->integer('position')->default(0);
            $table->json('badge_config')->nullable(); // config status badge
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('column_contents');
    }
};
