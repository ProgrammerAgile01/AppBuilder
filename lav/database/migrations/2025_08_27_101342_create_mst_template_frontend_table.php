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
        Schema::create('mst_template_frontend', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('template_code', 64)->unique();
            $table->string('template_name', 160);
            $table->enum('status', ['active','inactive','archived'])->default('active');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mst_template_frontend');
    }
};
