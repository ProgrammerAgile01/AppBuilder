<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menus')->onDelete('cascade');
            $table->tinyInteger('level')->default(1);
            $table->enum('type', ['group', 'module', 'menu', 'submenu'])->default('menu');
            $table->string('title');
            $table->string('icon')->nullable();
            $table->string('color', 32)->nullable();
            $table->integer('order_number')->default(0);
            $table->foreignId('crud_builder_id')->nullable()->constrained('crud_builders')->onDelete('set null');
            $table->string('route_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
