<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::apiResource('pelanggans', App\Http\Controllers\Generate\PelanggansController::class);
Route::apiResource('level_users', App\Http\Controllers\Generate\LevelUserController::class);
Route::apiResource('user_managements', App\Http\Controllers\Generate\UserManagementController::class);
Route::apiResource('vehicles', App\Http\Controllers\Generate\VehiclesController::class);
Route::apiResource('access_control_matrices', App\Http\Controllers\Generate\AccessControlMatrixController::class);