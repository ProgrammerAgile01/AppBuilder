<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate_number');
            $table->string('brand');
            $table->string('model');
            $table->integer('year');
            $table->string('color');
            $table->enum('vehicle_type', ['Car', 'SUV', 'Van', 'Truck', 'Motorcycle']);
            $table->enum('fuel_type', ['Gasoline', 'Diesel', 'Electric', 'Hybrid']);
            $table->enum('transmission', ['Manual', 'Automatic', 'CVT']);
            $table->integer('number_of_seats');
            $table->integer('mileage');
            $table->integer('daily_rate');
            $table->string('location');
            $table->enum('status', ['Available', 'Rented', 'Maintenance', 'Out Of Service']);
            $table->string('features');
            $table->string('front_photo')->nullable();
            $table->string('side_photo')->nullable();
            $table->string('back_photo')->nullable();
            $table->text('description');

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('vehicles');
    }
};