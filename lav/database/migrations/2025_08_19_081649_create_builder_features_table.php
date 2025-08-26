<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();

            // opsional relasi ke menus (biar bisa indexByMenu)
            $table->foreignId('menu_id')->nullable()->constrained('menus')->nullOnDelete();

            // hirarki (parent paket → subpaket)
            $table->foreignId('parent_id')->nullable()->constrained('packages')->nullOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            $table->unsignedBigInteger('price')->default(0);     // harga /bulan (Rp)
            $table->integer('max_users')->default(1);            // -1 = unlimited

            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');

            $table->unsignedInteger('subscribers')->default(0);

            // JSON
            $table->json('features')->nullable();     // array of Feature
            $table->json('menu_access')->nullable();  // array tree MenuAccess

            $table->timestamps();
            $table->softDeletes();

            $table->index(['menu_id', 'parent_id']);
            $table->index(['status']);
            $table->index(['name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
