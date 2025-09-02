<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('mst_customer', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->text('alamat');
            $table->string('nama_instansi');

            $table->timestamp('created_at')->nullable();
            $table->string('created_by')->nullable(); // kalau ada auth bisa di set dari controller

            $table->timestamp('updated_at')->nullable()->default(null);
            $table->string('updated_by')->nullable(); // kaya created auth

            $table->softDeletes();
            $table->string('deleted_by')->nullable(); // sama juga kaya created at
        });
    }

    public function down(): void {
        Schema::dropIfExists('mst_customer');
    }
};