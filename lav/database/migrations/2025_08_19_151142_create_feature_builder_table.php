<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feature_builders', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('package_id');
            $table->unsignedBigInteger('menu_id')->nullable();
            $table->unsignedBigInteger('feature_id')->nullable();

            $table->string('status')->default('active'); // opsional
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('package_id')->references('id')->on('packages')->cascadeOnDelete();
            $table->foreign('menu_id')->references('id')->on('menus')->nullOnDelete();
            $table->foreign('feature_id')->references('id')->on('features')->nullOnDelete();

            $table->unique(['package_id', 'menu_id', 'feature_id']); // cegah duplikat
            $table->index(['package_id']);
            $table->index(['menu_id']);
            $table->index(['feature_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_builders');
    }
};
