<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_management', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('email')->unique();
            $table->bigInteger('nomor_telp');
            $table->foreignId('role')->constrained('level_user')->references('id')->onDelete('cascade');
            $table->enum('status', ['Aktif', 'Tidak Aktif']);
            $table->string('foto')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_management');
    }
};