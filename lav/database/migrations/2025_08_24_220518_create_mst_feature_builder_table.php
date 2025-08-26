<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mst_feature_builder', function (Blueprint $table) {
            $table->bigIncrements('id');

            // === sesuaikan dengan tipe id di mst_products ===
            $table->char('product_id', 36); // pakai CHAR(36) jika products.id UUID
            // Jika products.id BIGINT: ganti menjadi ->unsignedBigInteger('product_id');

            $table->string('product_code', 64)->index()->nullable();

            $table->unsignedBigInteger('parent_id')->nullable()->index(); // self reference (id bigint)
            $table->string('name', 160);
            $table->string('feature_code', 128)->index();
            $table->enum('type', ['category', 'feature', 'subfeature'])->default('feature');
            $table->text('description')->nullable();

            $table->foreignId('crud_menu_id')->nullable()->constrained('menus')->nullOnDelete();

            // === kolom yang diminta ===
            $table->unsignedInteger('price_addon')->default(0);         // simpan angka (rupiah) tanpa desimal
            $table->boolean('trial_available')->default(false);
            $table->unsignedSmallInteger('trial_days')->nullable();

            $table->boolean('is_active')->default(true);
            $table->integer('order_number')->default(0);

            $table->softDeletes();
            $table->timestamps();

            // FK
            // Jika mst_products.id = CHAR(36)
            $table->foreign('product_id')->references('id')->on('mst_products')->cascadeOnDelete();
            // $table->foreign('crud_menu_id')->references('id')->on('menus')->cascadeOnDelete();

            // Jika mst_products.id = BIGINT, gunakan ini dan HAPUS FK di atas:
            // $table->foreign('product_id')->references('id')->on('mst_products')->cascadeOnDelete();

            // self reference parent
            $table->foreign('parent_id')->references('id')->on('mst_feature_builder')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mst_feature_builder');
    }
};
