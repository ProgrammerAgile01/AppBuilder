<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('data_kendaraan', function (Blueprint $table) {
            $table->id();
            $table->string('jenis')->nullable();
            $table->string('warna')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('data_kendaraan');
    }
};