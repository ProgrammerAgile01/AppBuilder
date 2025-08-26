<?php
// database/migrations/2025_08_24_000000_create_mst_products_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mst_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('product_code', 64)->unique();
            $table->string('product_name', 160);
            $table->enum('status', ['active','inactive','archived'])->default('active');
            $table->timestamps();
            $table->softDeletes(); // <— penting: deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mst_products');
    }
};